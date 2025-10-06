const crypto = require('crypto');
const slugify = require('slugify');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const AuthDatabase = require('../model/BusinessModels/Auth')();
const UserService = require('./UserService');
const {
  signPayload,
  verifyToken,
  signDevice,
} = require('../utils/keys');
const { getFhirResourceModel, parseFhirReference, defaultScopesByRole } = require('../utils/fhirUtils');

class AuthService {
  async login(body) {
    try {
      let user = await UserService.findOne({
        username: body.username,
      });
      
      if (!user || !(await bcrypt.compare(body.password, user.password))) {
        return {
          code: 401,
          message: 'Usuário e/ou senha estão incorretos.'
        }
      };

      const auth = await AuthDatabase.findOne({
        client_id: body.client_id,
        user_id: user._id,
        redirect_uri: body.redirect_uri
      });

      if (!auth) {
        return {
          login: user,
        };
      };

      const code = await this._generateAuthorizationCode(
        user,
        auth.scope,
        body.client_id,
        body.redirect_uri,
        auth.aud,
        auth.state
      );

      return {
        code,
        login: user
      }

    } catch (e) {
      console.error('Error logging in:', e.message);
      throw e;
    }
  }

  async authorize(params) {
    try {
      const user = await UserService.findById(params.user_id);
      
      if (!user) {
        return {
          code: 404,
          message: 'Usuário não encontrado.'
        }
      };

      const allowedScopes = defaultScopesByRole[user.role] || [];
      const requestedScopes = params.scope?.split(' ') || [];
      const filteredScopes = requestedScopes.filter(scope => allowedScopes.includes(scope));
      
      if (filteredScopes.length === 0) {
        return {
          code: 403,
          message: 'Nenhuma scope permitida para esse usuário.',
        };
      }

      const scopeString = filteredScopes.join(' ');

      const code = await this._generateAuthorizationCode(
        user,
        scopeString,
        params.client_id,
        params.redirect_uri,
        params.aud,
        params.state
      );

      return {
        params,
        code,
      };

    } catch (e) {
      console.error('Error authorizing:', e.message);
      throw e;
    }
  }

  async token(body) {
    try {
      if (!body.grant_type) {
        return {
          code: 400,
          message: 'Grant_type em falta.',
        };
      }

      if (body.grant_type === 'authorization_code') {
        const { code, client_id, redirect_uri } = body;
        if (!code || !client_id || !redirect_uri) {
          return {
            code: 400,
            message: 'Parâmetros para authorization_code em falta.',
          };
        }

        const decoded = await verifyToken(body.code);
        
        const auth = await AuthDatabase.findOne({
          client_id,
          redirect_uri,
          user_id: new mongoose.Types.ObjectId(decoded.sub),
          authorization_code: code,
        });

        if (!auth) {
          return {
            code: 401,
            message: 'Authorization code inválido ou expirado.',
          };
        }
        
        auth.authorization_code = null;
        await auth.save();

        const isPatient = !!decoded.patient;
        const resourceType = isPatient ? 'Patient' : 'Practitioner';
        const resourceModel = getFhirResourceModel(resourceType);
        const resourceId = decoded.sub;
        const resource = await resourceModel.findById(resourceId);

        const fhirUserUrl = `${process.env.DEFAULT_URL}/${resourceType}/${resourceId}`;

        const accessTokenPayload = {
          client_id,
          scope: decoded.scope,
          sub: resourceId,
          ...(isPatient && { patient: resourceId }),
          ...(!isPatient && { fhirUser: fhirUserUrl }),
        };

        const access_token = await signPayload(accessTokenPayload, 3600);

        const response = {
          access_token,
          token_type: 'bearer',
          expires_in: 3600,
          scope: decoded.scope,
          client_id,
          ...(isPatient && { patient: resourceId }),
          ...(!isPatient && { fhirUser: fhirUserUrl }),
        };

        const scopes = decoded.scope?.split(' ') || [];
        if (scopes.includes('openid')) {
          response.id_token = await signPayload(
            {
              sub: resourceId,
              name: resource.name?.[0]?.text || '',
              given_name: resource.name?.[0]?.given?.[0] || '',
              family_name: resource.name?.[0]?.family || '',
              profile: fhirUserUrl,
              fhirUser: fhirUserUrl,
            },
            3600
          );
        }

        return response;

      } else if (body.grant_type === 'client_credentials') {
        if (!body.client_id || !body.client_secret) {
          return {
            code: 400,
            message: 'client_id e/ou client_secret em falta.',
          };
        }

        const auth = await AuthDatabase.findOne({
          client_id: body.client_id,
          client_secret: body.client_secret,
        });

        if (!auth) {
          return {
            code: 401,
            message: 'Credenciais inválidas.',
          };
        }

        const access_token = await signPayload({
          client_id: auth.client_id,
          scope: auth.scope,
        });

        return {
          access_token,
          token_type: 'bearer',
          expires_in: 3600,
          scope: auth.scope,
          client_id: auth.client_id,
        };
      } else {
        return {
          code: 400,
          message: `grant_type não suportado: ${body.grant_type}`,
        };
      }
    } catch (e) {
      console.error('Error in token request:', e.message);
      return {
        code: 500,
        message: 'Erro no servidor.',
      };
    }
  }

  async device(body) {
    try {
      if(!body.client_name){
        return {
          code: 400,
          message: 'Client_name em falta.',
        };
      }

      const client_name = body.client_name;
      const slug = slugify(body.client_name, { lower: true, strict: true });
      const client_id = `${uuidv4().slice(0, 12)}-${slug}`;
      const client_secret = crypto.randomBytes(32).toString('hex');
      const scope = 'all/*.crudsh';

      const auth = new AuthDatabase({
        client_name,
        client_id,
        client_secret,
        scope

      })

      await auth.save();

      return {
          client_id,
          client_secret
        };

    } catch (e) {
      console.error('Error in device signup:', e.message);
      return {
        code: 500,
        message: 'Erro no servidor.',
      };
    }
  }

  ///
  async _generateAuthorizationCode(user, scope, client_id, redirect_uri, aud, state) {
    const resourceType = parseFhirReference(user.fhirReference);
    const ResourceModel = getFhirResourceModel(resourceType);

    const resource = await ResourceModel.findOne({
      identifier: {
        $elemMatch: {
          value: mongoose.Types.ObjectId(user._id),
        },
      },
    });

    if (!resource) {
      throw new Error('Recurso FHIR associado não encontrado.');
    }

    const isPatient = resourceType === 'Patient';
    const sub = resource._id.toString();

    const payload = {
      sub,
      scope,
      ...(isPatient ? { patient: sub } : { fhirUser: `${process.env.DEFAULT_URL}/${resourceType}/${sub}` }),
    };

    const code = await signPayload(payload, 60);

    await AuthDatabase.findOneAndUpdate(
      { client_id, user_id: user._id, redirect_uri },
      {
        client_id,
        user_id: resource._id,
        redirect_uri,
        aud,
        state,
        scope,
        authorization_code: code,
        fhir_resource: user.fhirReference,
      },
      { upsert: true }
    );

    return code;
  }
}

module.exports = new AuthService();