const router = require('express').Router();
const PractitionerController = require('../controller/PractitionerController');

router.post('/', PractitionerController.createPractitioner);

router.get('/:id', PractitionerController.getPractitionerById);

router.delete('/:id', PractitionerController.deletePractitioner);

router.put('/:id', PractitionerController.updatePractitioner);

module.exports = router;
