const ProcedureSchema = require('../model/Procedure/Procedure');
const PatientService = require('./PatientService');
const BRProcedimentoRealizadoValidator = require('./validator/profiles/BRProcedimentoRealizadoValidator');
const mongoose = require('mongoose');

const BR_PROCEDIMENTO_REALIZADO =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRProcedimentoRealizado-1.0';

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
    if (this.hasProfile(data, BR_PROCEDIMENTO_REALIZADO)) {
      BRProcedimentoRealizadoValidator.validate(data);

      if (data.subject) {
        const isValidPatient = await this.isValidPatientByIdentifier(
          data.subject
        );

        if (!isValidPatient) {
          throw new Error('Patient not found');
        }
      }
    } else {
      if (data.subject && data.subject.reference) {
        const patientId = data.subject.reference.split('/')[1];

        const patient = await PatientService.getPatientById(patientId);

        if (!patient) {
          throw new Error('Patient not found');
        }
      }
    }

    if (!data.id) {
      const _id = new mongoose.Types.ObjectId();

      data._id = _id;
      data.id = _id.toString();
    }

    return await ProcedureSchema.create(data);
  }

  hasProfile(procedure, profileUrl) {
    return procedure.meta?.profile?.includes(profileUrl);
  }

  async isValidPatientByIdentifier(subject) {
    if (!subject?.identifier?.value) {
      return false;
    }

    const patient = await PatientService.getPatientByIdentifier(
      subject.identifier
    );

    return patient != null;
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
