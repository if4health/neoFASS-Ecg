const CompositionSchema = require('../model/Composition/Composition');
const PatientService = require('./PatientService');
const mongoose = require('mongoose');
const BRRegistroAtendimentoClinicoValidator = require('./validator/profiles/BRRegistroAtendimentoClinicoValidator');

const BR_REGISTRO_ATENDIMENTO_CLINICO =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRRegistroAtendimentoClinico';
class CompositionService {
  async getCompositionById(query) {
    const { id } = query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const composition = await CompositionSchema.findById(id).lean();

    if (!composition) {
      return null;
    }

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [
        {
          resource: composition,
        },
      ],
    };
  }

  async getCompositions(query) {
    return await CompositionSchema.find(query).lean();
  }

  async create(data) {
    // Valida a referência ao paciente, caso informada.
    if (this.hasProfile(data, BR_REGISTRO_ATENDIMENTO_CLINICO)) {
      BRRegistroAtendimentoClinicoValidator.validate(data);

      if (data.subject) {
        const isValidPatient = await this.isValidPatientByIdentifier(
          data.subject
        );

        if (!isValidPatient) {
          throw new Error('Patient not found');
        }
      }
    } else {
      // Mantenha aqui o fluxo atual para Composition sem o perfil RAC.
      if (data.subject?.reference) {
        const patientId = data.subject.reference.split('/')[1];
        const patient = await PatientService.getPatientById(patientId);

        if (!patient) {
          throw new Error('Patient not found');
        }
      }
    }
    if (data.subject && data.subject.reference) {
      const patientId = data.subject.reference.split('/')[1];

      const patient = await PatientService.getPatientById(patientId);

      if (!patient) {
        throw new Error('Patient not found');
      }
    }

    // Gera o identificador interno, seguindo o padrão de Procedure.
    if (!data.id) {
      const _id = new mongoose.Types.ObjectId();

      data._id = _id;
      data.id = _id.toString();
    }

    return await CompositionSchema.create(data);
  }
  hasProfile(composition, profileUrl) {
    return composition.meta?.profile?.includes(profileUrl);
  }

  async isValidPatientByIdentifier(subject) {
    if (!subject?.identifier?.value || !subject?.identifier?.system) {
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

    const updated = await CompositionSchema.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      throw new Error('Composition not found');
    }

    return updated;
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await CompositionSchema.findByIdAndDelete(id).exec();
  }
}

module.exports = new CompositionService();
