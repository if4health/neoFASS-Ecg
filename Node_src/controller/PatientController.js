const PatientService = require('../service/PatientService');

class PatientController {

    async createPatient(req, res) {
        try {
            const result = await PatientService.createPatient(req.body);
            res.json(result);
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async getPatientById(req, res) {
        const id = req.params.id;
        try {
            const result = await PatientService.getPatientById(req.params.id);
            res.status(200).json(result);
        } catch (e) {
            console.log(e);
            res.status(e.statusCode || 500).json(e.message);
        }
    }

    async deletePatient(req, res) {
        try {
            const id = req.params.id;
            const result = await PatientService.delete(id);
            if (result == null)
                res.status(404).send('Patient não encontrado');
            else
                res.json("Patient deletado");
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async updatePatient(req, res) {
        const id = req.params.id;
        const patient = req.body;
        try {
            const result = await PatientService.update(id, patient);
            if (result == null)
                res.status(404).send('Patient não encontrado');
            else
                res.json("Patient atualizado");
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async searchPatients(req, res) {
        try {
            const params = req.query;
            const result = await PatientService.search(params);

            res.status(200).json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    }

}

module.exports = new PatientController();