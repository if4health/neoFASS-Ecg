const crypto = require('crypto');
const mongoose = require('mongoose');
const AuthDatabase = require('../model/BusinessModels/Auth')();
const PacienteService = require('./PacienteService');
const MedicoService = require('./MedicoService');
const PatientSchema = require("../model/patient/Patient");
const {
  signPayload,
  verifyToken,
  verifySymmetricToken,
  signDevice,
} = require('../utils/keys');

class AuthService {
  async login(body) {
    try {
      let login = await PacienteService.find({
        cpf: body.cpf,
        senha: crypto.createHash('md5').update(body.senha).digest('hex'),
      });
      if (login.length === 0) {
        login = await MedicoService.find({
          cpf: body.cpf,
          senha: crypto.createHash('md5').update(body.senha).digest('hex'),
        });
        if (login.length === 0) {
          return {
            code: 401,
            message: 'Login not found',
          };
        }
        return {
          medico: true,
          login: login[0],
        };
      }

      const auth = await AuthDatabase.findOne({
        client_id: body.client_id,
        paciente_id: login[0]._id,
        redirect_uri: body.redirect_uri,
      });
      if (!auth || auth.length === 0) {
        return {
          login: login[0],
        };
      }

      const patient = await PatientSchema.findOne({
        identifier: {
          $elemMatch: {
            value: mongoose.Types.ObjectId(login[0]._id),
          },
        },
      });
      const payload = { patient: patient._id, scope: auth.scope };
      const code = await signPayload(payload, 60);
      auth.authorization_code = code;
      await auth.save();
      return {
        code,
        login: login[0],
      };
    } catch (e) {
      return e;
    }
  }

  async authorize(params) {
    try {
      const patient = await PatientSchema.findOne({
        identifier: {
          $elemMatch: {
            value: mongoose.Types.ObjectId(params.paciente_id),
          },
        },
      });
      const code = await signPayload(
        { patient: patient._id, scope: params.scope },
        60
        );
      await AuthDatabase.create({
        aud: params.aud,
        scope: params.scope,
        client_id: params.client_id,
        state: params.state,
        redirect_uri: params.redirect_uri,
        paciente_id: params.paciente_id,
        patient_id: patient._id,
        authorization_code: code,
      });
      return {
        params,
        code,
      };
    } catch (e) {
      return e;
    }
  }

  async select(body) {
    const patient = await PatientSchema.findById(body.patient);
    const code = await signPayload(
      { patient: patient._id, scope: body.scope },
      3600
    );
    await AuthDatabase.create({
      aud: body.aud,
      scope: body.scope,
      client_id: body.client_id,
      state: body.state,
      redirect_uri: body.redirect_uri,
      patient_id: body.patient,
      authorization_code: code,
    });
    return {
      code,
    };
  }

  async token(body) {
    try {
      if (body.code == null) {
        return {
          code: 400,
          message: 'Invalid params',
        };
      }
    
      if (body.grant_type === 'authorization_code') {
        const decodedJWT = await verifyToken(body.code);
        const result = await AuthDatabase.findOne({
          client_id: body.client_id,
          redirect_uri: body.redirect_uri,
          patient_id: new mongoose.Types.ObjectId(decodedJWT.patient),
          authorization_code: body.code,
        });

        let arrayScopes = result.scope.split(' ');
        if (decodedJWT.scope !== undefined) {
          arrayScopes = decodedJWT.scope.split(' ');
        }
        if (result === null || result.length === 0) {
          return {
            code: 401,
            message: 'Invalid user',
          };
        }
        result.authorization_code = null;
        await result.save();
        const patient = await PatientSchema.findById(decodedJWT.patient);
        const access_token = await signPayload(
          {
            scope: decodedJWT.scope,
            patient: decodedJWT.patient,
            client_id: body.client_id,
            expires_in: 3600,
          },
          3600
        );
        const retorno = {
          access_token,
          token_type: 'bearer',
          expires_in: 3600,
          scope: decodedJWT.scope,
          patient: decodedJWT.patient,
          client_id: body.client_id,
        };
        if (arrayScopes.includes('openid')) {
          const id_token = await signPayload(
            {
              name: patient.name.use,
              given_name: patient.name.given,
              family_name: patient.name.family,
              profile: `${process.env.DEFAULT_URL}/Patient/${patient._id}`,
            },
            3600
          );
          retorno.id_token = id_token;
        }
        if (arrayScopes.includes('launch/patient')) {
          retorno.patient = decodedJWT.patient;
        }
        return retorno;
      } 
      
      
      
      else {
        const decodedJWT = verifySymmetricToken(body.code);
        if (decodedJWT.grant_type === 'client_credentials') {
          const result = await AuthDatabase.findOne({
            client_id: decodedJWT.client_id,
            client_secret: decodedJWT.client_secret,
          });
          if (
            result === null ||
            result.length === 0 ||
            result.client_secret !== decodedJWT.client_secret
          ) {
            return {
              code: 401,
              message: 'Invalid user',
            };
          }
          const access_token = await signPayload(
            {
              scope: result.scope,
              client_id: body.client_id,
              expires_in: 3600,
            },
            3600
          );
          const retorno = {
            access_token,
            token_type: 'bearer',
            expires_in: 3600,
            scope: body.scope,
            client_id: body.client_id,
          };
          return retorno;
        }
        return {
          code: 401,
          message: 'Invalid grant type',
        };
      }
    } catch (e) {
      console.log(e);
      return {
        code: 401,
        message: 'Invalid auth',
      };
    }
  }

  async device(body) {
    try {
      const device = await AuthDatabase.findOne({
        client_id: body.client_id,
        client_secret: body.client_secret,
      });

      if (!device) {
        throw new Error('Device not found or credentials are invalid.');
      }

      const payload = {
        _id: { "$oid": device._id.toString() },
        client_id: device.client_id,
        client_secret: device.client_secret,
        scope: device.scope,
        grant_type: "client_credentials",
      };

      const token = await signDevice(payload);

      return token;
    } catch (e) {
      console.error('Error generating device token:', e.message);
      throw e;
    }
  }
}

module.exports = new AuthService();