const router = require('express').Router();

const AuthController = require('../controller/AuthController');

router.all('/register', AuthController.register);

router.get('/login', AuthController.login);

router.post('/login', AuthController.postLogin);

router.get('/list', AuthController.list);

router.post('/select', AuthController.select);

router.get('/authorize', AuthController.authorize);

router.post('/authorize', AuthController.postAuthorize);

router.post('/token', AuthController.token);

router.post('/device', AuthController.device);

module.exports = router;