const router = require('express').Router();
const DiagnosticReportController = require('../controller/DiagnosticReportController');

router.post('/', DiagnosticReportController.createDiagnosticReport);

router.get('/:id', DiagnosticReportController.getDiagnosticReportById);

router.get('/', DiagnosticReportController.getDiagnosticReport);

router.put('/:id', DiagnosticReportController.updateDiagnosticReport);

router.delete('/:id', DiagnosticReportController.deleteDiagnosticReport);

module.exports = router;
