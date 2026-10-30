const EncounterService = require('../service/EncounterService');

class EncounterController {
  async createEncounter(req, res) {
    try {
      const result = await EncounterService.createEncounter(req.body);
      return res.status(201).json(result);
    } catch (e) {
      return res.status(e.statusCode || 400).json({
        error: e.message,
      });
    }
  }

  async getEncounterById(req, res) {
    try {
      const result = await EncounterService.getEncounterById(req.params.id);

      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode || 500).json({
        error: e.message,
      });
    }
  }

  async deleteEncounter(req, res) {
    try {
      await EncounterService.delete(req.params.id);
      return res.status(204).send();
    } catch (e) {
      return res.status(e.statusCode || 500).json({
        error: e.message,
      });
    }
  }

  async updateEncounter(req, res) {
    try {
      const result = await EncounterService.update(req.params.id, req.body);

      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode || 500).json({
        error: e.message,
      });
    }
  }

  async searchEncounters(req, res) {
    try {
      const result = await EncounterService.search(req.query);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({
        error: e.message,
      });
    }
  }
}

module.exports = new EncounterController();
