const PatientService = require('../service/PatientService');
const ObservationService = require('../service/ObservationService')

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

    async getPatientObservations(req, res) {
        try {
            const id = req.params.id;
            const observations = await ObservationService.getObservationsByPatientId(id);

            if (!observations || observations.length === 0) {
                res.status(404).send('Nenhuma Observation encontrada para este Patient.');
            } else {
                res.status(200).json(observations);
            }
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    }

}

module.exports = new PatientController();