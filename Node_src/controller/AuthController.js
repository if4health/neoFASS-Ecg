const path = require('path');
const AuthService = require('../service/AuthService');
const PatientService = require('../service/PatientService');

class AuthController {
  // Inicia o processo de autenticação
  async register(req, res) {
    const redirectPath = `${path.join(req.baseUrl, 'login')}?${new URLSearchParams(req.query).toString()}`;
    res.redirect(redirectPath);
  }

  // Exibe a tela de login
  login(req, res) {
    res.render('login', req.query);
  }

  // Efetua o login do usuário, sendo paciente ou médico
  async postLogin(req, res) {
    const { redirect_uri, state, aud, scope, client_id } = req.body;
    const login = await AuthService.login(req.body);

    if (login.code === 401) {
      return res.render('login', {
        ...req.body,
        error: login.message,
      });
    }

    if (login.code) {
      const redirectURL = `${redirect_uri}?${new URLSearchParams({ state, code: login.code }).toString()}`;
      return res.redirect(redirectURL);
    }

    if (login.medico) {
      const redirectPath = `${path.join(req.baseUrl, 'list')}?${new URLSearchParams({
        redirect_uri,
        state,
        medico_id: login.login._id,
        aud,
        scope,
        client_id,
      }).toString()}`;
      return res.redirect(redirectPath);
    }

    const redirectPath = `${path.join(req.baseUrl, 'authorize')}?${new URLSearchParams({
      redirect_uri,
      state,
      paciente_id: login.login._id,
      aud,
      scope,
      client_id,
    }).toString()}`;
    return res.redirect(redirectPath);
  }

  // Exibe lista de pacientes do login do médico
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

  // Seleciona o paciente para exibir os dados
  async select(req, res) {
    const { redirect_uri, state } = req.body;
    const auth = await AuthService.select(req.body);
    const redirectURL = `${redirect_uri}?${new URLSearchParams({ state, code: auth.code }).toString()}`;
    res.redirect(redirectURL);
  }

  // Exibe a tela das permissões solicitadas pela aplicação
  authorize(req, res) {
    res.render('auth', req.query);
  }

  // Confirma a autorização da aplicação pelo usuário
  async postAuthorize(req, res) {
    const { redirect_uri, state } = req.body;
    const auth = await AuthService.authorize(req.body);
    const redirectURL = `${redirect_uri}?${new URLSearchParams({ state, code: auth.code }).toString()}`;
    res.redirect(redirectURL);
  }

  // Gera um token com os grant_types: 'authorization_code' e 'client_credentials'
  async token(req, res) {
    res.json(await AuthService.token(req.body));
  }
}

module.exports = new AuthController();
