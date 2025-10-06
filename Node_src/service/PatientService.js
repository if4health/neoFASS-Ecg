const PatientSchema = require("../model/patient/Patient");
const mongoose = require('mongoose');

class PatientService {

    async createPatient(patient) {
        const result = await PatientSchema.create(patient);
        return result;
    }

    async getPatientById(id) {
        const result = await this.findById(id);
        return result;
    }

    async findById(id) {
        if (mongoose.Types.ObjectId.isValid(id)) {
            const patient = await PatientSchema.findById(id).exec();
            if (!patient) {
                throw new HttpError('Patient not found!', 404);
            }
            return patient;
        } else {
            throw new HttpError('Patient not found!', 404);
        }
    }

    async update(id, patient) {
        const updated = await PatientSchema.findByIdAndUpdate({ _id: id }, patient).exec();
        return updated;
    }

    async delete(id) {
        const deleted = await PatientSchema.findByIdAndDelete(id).exec();
        return deleted;
    }

    async search(params) {
        let query = {};

        if (params.name) {
            query["name.text"] = { $regex: params.name, $options: "i" };
        }

        if (params.identifier) {
            query["identifier.value"] = params.identifier;
        }

        if (params.birthdate) {
            query.birthDate = params.birthdate;
        }

        if (params["general-practitioner"]) {
            query["generalPractitioner.reference"] = params["general-practitioner"];
        }

        const patients = await PatientSchema.find(query).exec();

        return {
            resourceType: "Bundle",
            type: "searchset",
            total: patients.length,
            entry: patients.map(p => ({
                resource: p.toObject()
            }))
        };
    }
}

class HttpError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = new PatientService();