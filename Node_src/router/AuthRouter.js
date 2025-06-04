const router = require('express').Router();

const AuthController = require('../controller/AuthController');

router.all('/register', AuthController.register);

router.get('/login', AuthController.login);

router.post('/login', AuthController.postLoginNew);

router.get('/list', AuthController.list);

router.post('/select', AuthController.select);

router.get('/authorize', AuthController.authorize);

router.post('/authorize', AuthController.postAuthorize);

router.post('/token', AuthController.token);

router.post('/device', AuthController.device);

router.post('/signup', AuthController.signup);

module.exports = router;