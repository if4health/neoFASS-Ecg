const express = require('express');
const EncounterController = require('../controller/EncounterController');

const router = express.Router();

router.post('/', (req, res) => EncounterController.createEncounter(req, res));

router.get('/search', (req, res) =>
  EncounterController.searchEncounters(req, res)
);

router.get('/:id', (req, res) =>
  EncounterController.getEncounterById(req, res)
);

router.put('/:id', (req, res) => EncounterController.updateEncounter(req, res));

router.delete('/:id', (req, res) =>
  EncounterController.deleteEncounter(req, res)
);

module.exports = router;
