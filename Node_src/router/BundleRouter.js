const router = require('express').Router();
const BundleController = require('../controller/BundleController');

router.post('/', BundleController.processBundle);

module.exports = router;