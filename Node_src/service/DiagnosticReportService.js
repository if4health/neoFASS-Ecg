const DiagnosticReportSchema = require('../model/DiagnosticReport/DiagnosticReport');
const ObservationService = require('./ObservationService');
const PatientService = require('./PatientService');
const mongoose = require('mongoose');

class DiagnosticReportService {

    async getDiagnosticReportById(query) {
        const { _include, id } = query;

        if (!mongoose.Types.ObjectId.isValid(id))
            return null;

        const report = await DiagnosticReportSchema.findById(id).lean();

        if (!report)
            return null;

        let entries = [
            {
                resource: report
            }
        ];

        if (_include === 'DiagnosticReport:result' && report.result) {
            const obsIds = report.result.map(r => r.reference.split('/')[1]);

            const observations = await Promise.all(
                obsIds.map(obsId => ObservationService.getObservationById(obsId))
            );

            observations.forEach(obs => {
                if (obs) {
                    entries.push({
                        resource: obs
                    });
                }
            });
        }

        return {
            resourceType: "Bundle",
            type: "searchset",
            total: entries.length,
            entry: entries
        };
    }

    async getDiagnosticReports(query) {
        const { _include, ...filters } = query;

        return await DiagnosticReportSchema.find(filters).lean();
    }

    async create(data) {
        if (!data.subject)
            throw new Error("No subject");

        if (!data.subject.reference)
            throw new Error("No subject reference");

        const patientId = data.subject.reference.split('/')[1];
        const patient = await PatientService.getPatientById(patientId);

        if (!patient)
            throw new Error("Patient not found");

        if (!data.id) {
            const _id = new mongoose.Types.ObjectId();
            data._id = _id;
            data.id = _id.toString();
        }

        return await DiagnosticReportSchema.create(data);
    }

    async update(id, data) {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new Error("Invalid ID format");

        const updated = await DiagnosticReportSchema.findByIdAndUpdate(
            { _id: id },
            { $set: data },
            { new: true }
        ).exec();

        if (!updated)
            throw new Error("DiagnosticReport not found");

        return updated;
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id))
            return null;

        return await DiagnosticReportSchema.findByIdAndDelete(id).exec();
    }
}

module.exports = new DiagnosticReportService();