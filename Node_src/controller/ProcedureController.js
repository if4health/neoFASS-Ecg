const ProcedureService = require('../service/ProcedureService');

class ProcedureController {
  async getProcedure(req, res) {
    try {
      const result = await ProcedureService.getProcedureById(req.query);

      if (!result) {
        return res.status(404).json('Procedure not found');
      }

      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: e.message,
        error: e,
      });
    }
  }

  async getProcedureById(req, res) {
    try {
      const query = {
        id: req.params.id,
      };

      const result = await ProcedureService.getProcedureById(query);

      if (!result) {
        return res.status(404).json('Procedure not found');
      }

      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(e.statusCode || 500).json(e.message);
    }
  }

  async createProcedure(req, res) {
    try {
      const result = await ProcedureService.create(req.body);

      return res.status(201).json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json(e.message);
    }
  }

  async updateProcedure(req, res) {
    try {
      const id = req.params.id;

      const result = await ProcedureService.update(id, req.body);

      res.json(result);
    } catch (e) {
      if (e.message === 'Procedure not found') {
        res.status(404).json(e.message);
      } else {
        res.status(500).json(e.message);
      }
    }
  }

  async deleteProcedure(req, res) {
    try {
      const id = req.params.id;

      const result = await ProcedureService.delete(id);

      if (result) {
        res.json('Deletado com sucesso');
      } else {
        res.status(404).json('Procedure not found');
      }
    } catch (e) {
      res.status(500).json(e.message);
    }
  }
}

module.exports = new ProcedureController();
