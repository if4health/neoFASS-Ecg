const LocationService = require('../service/LocationService');

class LocationController {
  async createLocation(req, res) {
    try {
      const result = await LocationService.createLocation(req.body);
      return res.status(201).json(result);
    } catch (e) {
      return res.status(e.statusCode || 400).json({
        error: e.message,
      });
    }
  }

  async getLocationById(req, res) {
    try {
      const result = await LocationService.getLocationById(req.params.id);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode || 500).json({
        error: e.message,
      });
    }
  }

  async deleteLocation(req, res) {
    try {
      await LocationService.delete(req.params.id);
      return res.status(204).send();
    } catch (e) {
      return res.status(e.statusCode || 500).json({
        error: e.message,
      });
    }
  }

  async updateLocation(req, res) {
    try {
      const result = await LocationService.update(req.params.id, req.body);

      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode || 500).json({
        error: e.message,
      });
    }
  }

  async searchLocations(req, res) {
    try {
      const result = await LocationService.search(req.query);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({
        error: e.message,
      });
    }
  }
}

module.exports = new LocationController();
