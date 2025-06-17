const router = require('express').Router();

const AuthController = require('../controller/AuthController');

router.all('/register', AuthController.register);

router.get('/login', AuthController.showLogin);

router.post('/login', AuthController.handleLogin);

// router.get('/list', AuthController.list);

// router.post('/select', AuthController.select);

router.get('/authorize', AuthController.showAuthorize);

router.post('/authorize', AuthController.handleAuthorize);

router.post('/token', AuthController.handleToken);

router.get('/device', AuthController.showDevice);

router.post('/device', AuthController.handleDevice);

router.get('/signup', AuthController.showSignup);

router.post('/signup', AuthController.handleSignup);

module.exports = router;