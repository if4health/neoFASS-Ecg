const DiagnosticReportService = require('../service/DiagnosticReportService');

class DiagnosticReportController {
    
    async getDiagnosticReport(req, res) {
        try {
            const result = await DiagnosticReportService.getDiagnosticReportById(req.query);
            
            if (!result) {
                return res.status(404).json('DiagnosticReport not found');
            }
            res.json({
                resourceType: 'Bundle',
                entry: Array.isArray(result) ? result : [result],
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: e.message, error: e });
        }
    }

    async getDiagnosticReportById(req, res) {
        try {
            const query = { 
                id: req.params.id, 
                _include: req.query._include 
            };
            
            const result = await DiagnosticReportService.getDiagnosticReportById(query);
            
            if (!result)
                return res.status(404).json('DiagnosticReport not found');
            
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(e.statusCode || 500).json(e.message);
        }
    }

    async createDiagnosticReport(req, res) {
        try {
            const result = await DiagnosticReportService.create(req.body);
            return res.status(201).json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    }

    async updateDiagnosticReport(req, res) {
        try {
            const id = req.params.id;
            const result = await DiagnosticReportService.update(id, req.body);
            res.json(result);
        } catch (e) {
            if (e.message == "DiagnosticReport not found") {
                res.status(404).json(e.message);
            } else {
                res.status(500).json(e.message);
            }
        }
    }

    async deleteDiagnosticReport(req, res) {
        try {
            const id = req.params.id;
            const result = await DiagnosticReportService.delete(id);
            if (result) {
                res.json("Deletado com sucesso");
            } else {
                res.status(404).json("DiagnosticReport not found");
            }
        } catch (e) {
            res.status(500).json(e.message);
        }
    }
}

module.exports = new DiagnosticReportController();