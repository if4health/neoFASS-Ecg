const PractitionerService = require('../service/PractitionerService');
const PatientService = require('../service/PatientService')

class PractitionerController {

    async createPractitioner(req, res) {
        try {
            const result = await PractitionerService.createPractitioner(req.body);
            res.json(result);
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async getPractitionerById(req, res) {
        const id = req.params.id;
        try {
            const result = await PractitionerService.getPractitionerById(req.params.id);
            res.status(200).json(result);
        } catch (e) {
            console.log(e);
            res.status(e.statusCode || 500).json(e.message);
        }
    }

    async deletePractitioner(req, res) {
        try {
            const id = req.params.id;
            const result = await PractitionerService.delete(id);
            if (result == null)
                res.status(404).send('Practitioner não encontrado');
            else
                res.json("Practitioner deletado");
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async updatePractitioner(req, res) {
        const id = req.params.id;
        const practitioner = req.body;
        try {
            const result = await PractitionerService.update(id, practitioner);
            if (result == null)
                res.status(404).send('Practitioner não encontrado');
            else
                res.json("Practitioner atualizado");
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async getPractitionerPatients(req, res) {
        try {
            const id = req.params.id;
            const patients = await PatientService.getPatientsByPractitionerId(id);

            if (!patients || patients.length === 0) {
                res.status(404).send('Nenhum Patient encontrado para este Practitioner.');
            } else {
                res.status(200).json(patients);
            }
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    }

}

module.exports = new PractitionerController();