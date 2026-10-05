const ProcedureSchema = require('../model/Procedure/Procedure');
const PatientService = require('./PatientService');
const mongoose = require('mongoose');

class ProcedureService {
  async getProcedureById(query) {
    const { id } = query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const procedure = await ProcedureSchema.findById(id).lean();

    if (!procedure) {
      return null;
    }

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [
        {
          resource: procedure,
        },
      ],
    };
  }

  async getProcedures(query) {
    return await ProcedureSchema.find(query).lean();
  }

  async create(data) {
    if (data.subject && data.subject.reference) {
      const patientId = data.subject.reference.split('/')[1];

      const patient = await PatientService.getPatientById(patientId);

      if (!patient) {
        throw new Error('Patient not found');
      }
    }

    if (!data.id) {
      const _id = new mongoose.Types.ObjectId();

      data._id = _id;
      data.id = _id.toString();
    }

    return await ProcedureSchema.create(data);
  }

  async update(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }

    const updated = await ProcedureSchema.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    ).exec();

    if (!updated) {
      throw new Error('Procedure not found');
    }

    return updated;
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await ProcedureSchema.findByIdAndDelete(id).exec();
  }
}

module.exports = new ProcedureService();
