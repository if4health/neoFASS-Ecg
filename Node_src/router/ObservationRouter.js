const router = require('express').Router();
const ObservationController = require('../controller/ObservationController');

router.post('/', ObservationController.createObservation);

router.get('/:id', ObservationController.getObservationById);

router.get("/:id/data/:start/:end", ObservationController.getObservationByStartAndEnd);

router.get("/:id/data/:min", ObservationController.getObservationByMin);

router.patch('/:id', ObservationController.patchComponent);

router.put('/:id', ObservationController.updateObservation);

router.delete('/:id', ObservationController.deleteObservation);

router.get('/', ObservationController.searchObservations);

module.exports = router;
