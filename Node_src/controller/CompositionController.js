const CompositionService = require('../service/CompositionService');

class CompositionController {
  async getComposition(req, res) {
    try {
      const result = await CompositionService.getCompositionById(req.query);

      if (!result) {
        return res.status(404).json('Composition not found');
      }

      return res.json(result);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: e.message,
        error: e,
      });
    }
  }

  async getCompositionById(req, res) {
    try {
      const query = {
        id: req.params.id,
      };

      const result = await CompositionService.getCompositionById(query);

      if (!result) {
        return res.status(404).json('Composition not found');
      }

      return res.json(result);
    } catch (e) {
      console.error(e);
      return res.status(e.statusCode || 500).json(e.message);
    }
  }

  async createComposition(req, res) {
    try {
      const result = await CompositionService.create(req.body);

      return res.status(201).json(result);
    } catch (e) {
      console.error(e);

      if (e.message === 'Patient not found') {
        return res.status(404).json(e.message);
      }

      if (e.name === 'ValidationError') {
        return res.status(400).json({
          message: e.message,
          errors: e.errors,
        });
      }

      return res.status(e.statusCode || 500).json(e.message);
    }
  }

  async updateComposition(req, res) {
    try {
      const id = req.params.id;
      const result = await CompositionService.update(id, req.body);

      return res.json(result);
    } catch (e) {
      console.error(e);

      if (e.message === 'Composition not found') {
        return res.status(404).json(e.message);
      }

      if (e.name === 'ValidationError') {
        return res.status(400).json({
          message: e.message,
          errors: e.errors,
        });
      }

      if (e.message === 'Invalid ID format') {
        return res.status(400).json(e.message);
      }

      return res.status(e.statusCode || 500).json(e.message);
    }
  }

  async deleteComposition(req, res) {
    try {
      const id = req.params.id;
      const result = await CompositionService.delete(id);

      if (!result) {
        return res.status(404).json('Composition not found');
      }

      return res.json('Deletado com sucesso');
    } catch (e) {
      console.error(e);
      return res.status(500).json(e.message);
    }
  }
}

module.exports = new CompositionController();
