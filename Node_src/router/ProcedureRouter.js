const router = require('express').Router();

const ProcedureController = require('../controller/ProcedureController');

router.post('/', ProcedureController.createProcedure);

router.get('/:id', ProcedureController.getProcedureById);

router.get('/', ProcedureController.getProcedure);

router.put('/:id', ProcedureController.updateProcedure);

router.delete('/:id', ProcedureController.deleteProcedure);

module.exports = router;
