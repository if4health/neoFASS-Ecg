const PractitionerSchema = require("../model/practitioner/Practitioner");
const ObservationSchema = require("../model/observation/Observation");
const mongoose = require('mongoose');

class PractitionerService {

    async createPractitioner(practitioner) {
        const result = await PractitionerSchema.create(practitioner);
        return result;
    }

    async getPractitionerById(id) {
        const result = await this.findById(id);
        return result;
    }

    async findById(id) {
        if (mongoose.Types.ObjectId.isValid(id)) {
            const practitioner = await PractitionerSchema.findById(id).exec();
            if (!practitioner) {
                throw new HttpError('Practitioner not found!', 404);
            }
            return practitioner;
        } else {
            throw new HttpError('Practitioner not found!', 404);
        }
    }

    async update(id, practitioner) {
        const updated = await PractitionerSchema.findByIdAndUpdate({ _id: id }, practitioner).exec();
        return updated;
    }

    async delete(id) {
        const deleted = await PractitionerSchema.findByIdAndDelete(id).exec();
        return deleted;
    }
}

class HttpError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = new PractitionerService();