const express = require('express');
const LocationController = require('../controller/LocationController');

const router = express.Router();

router.post('/', (req, res) => LocationController.createLocation(req, res));

router.get('/search', (req, res) =>
  LocationController.searchLocations(req, res)
);

router.get('/:id', (req, res) => LocationController.getLocationById(req, res));

router.put('/:id', (req, res) => LocationController.updateLocation(req, res));

router.delete('/:id', (req, res) =>
  LocationController.deleteLocation(req, res)
);

module.exports = router;
