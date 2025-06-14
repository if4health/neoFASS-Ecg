const AuthService = require('../service/AuthService');
const PatientService = require('../service/PatientService');
const UserService = require('../service/UserService');

class AuthController {
  async register(req, res) {
    const redirectPath = `${req.baseUrl}/login?${new URLSearchParams(req.query).toString()}`;
    res.redirect(redirectPath);
  }

  showLogin(req, res) {
    res.render('login', req.query);
  }

  async handleLogin(req, res) {
    const { redirect_uri, state, aud, scope, client_id } = req.body;
    const login = await AuthService.newLogin(req.body);

    if (login.code === 401) {
      return res.render('login', {
        ...req.body,
        error: login.message,
      });
    }

    if (login.code) {
      const redirectURL = `${redirect_uri}?${new URLSearchParams({
        state,
        code: login.code,
      }).toString()}`;
      return res.redirect(redirectURL);
    }

    const redirectPath = `${req.baseUrl}/authorize?${new URLSearchParams({
      redirect_uri,
      state,
      user_id: login.login._id,
      aud,
      scope,
      client_id,
    }).toString()}`;
    return res.redirect(redirectPath);
  }

  async list(req, res) {
    const { redirect_uri, state, aud, scope, client_id, medico_id } = req.query;
    const patients = await PatientService.findPatientByPractitioner(medico_id);
    res.render('list', {
      redirect_uri,
      state,
      medico_id,
      aud,
      scope,
      client_id,
      patients,
    });
  }

  async select(req, res) {
    const { redirect_uri, state } = req.body;
    const auth = await AuthService.select(req.body);
    const redirectURL = `${redirect_uri}?${new URLSearchParams({
      state,
      code: auth.code,
    }).toString()}`;
    res.redirect(redirectURL);
  }

  showAuthorize(req, res) {
    res.render('auth', req.query);
  }

  async handleAuthorize(req, res) {
    const { redirect_uri, state } = req.body;
    const auth = await AuthService.newAuthorize(req.body);
    const redirectURL = `${redirect_uri}?${new URLSearchParams({
      state,
      code: auth.code,
    }).toString()}`;
    res.redirect(redirectURL);
  }

  async handleToken(req, res) {
    res.json(await AuthService.newToken(req.body));
  }

  async device(req, res) {
    res.json(await AuthService.device(req.body));
  }

  showSignup(req, res) {
    res.render('signup', req.query);
  }
  
  async handleSignup(req, res) {
    try {
      const result = await UserService.create(req.body);
      res.json(result);
    } catch (e) {
      console.error('Error on signup:', e.message);
      throw e;
    }
  }

  showDevice(req, res) {
    res.render('device', req.query);
  }

  async handleDevice(req, res) {
    try {
      //TODO: Criar auth com uuid e hash
    } catch (error) {
      console.error('Error on signup:', e.message);
      throw e;
    }
  }
}


module.exports = new AuthController();
