const EncounterSchema = require('../model/Encounter/Encounter');
const mongoose = require('mongoose');

const BRContatoAssistencialValidator = require('./validator/profiles/BRContatoAssistencialValidator');

const BR_CONTATO_ASSISTENCIAL_PROFILE =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRContatoAssistencial-1.0';

class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class EncounterService {
  /**
   * Cria um Encounter.
   * Aplica a validação RNDS somente quando o perfil
   * BRContatoAssistencial-1.0 estiver declarado.
   */
  async createEncounter(encounter) {
    const data = {
      ...encounter,
      resourceType: 'Encounter',
    };

    if (data.meta?.profile?.includes(BR_CONTATO_ASSISTENCIAL_PROFILE)) {
      BRContatoAssistencialValidator.validate(data);
    }

    return await EncounterSchema.create(data);
  }

  async getEncounterById(id) {
    return await this.findById(id);
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('Encounter not found!', 404);
    }

    const encounter = await EncounterSchema.findById(id).exec();

    if (!encounter) {
      throw new HttpError('Encounter not found!', 404);
    }

    return encounter;
  }

  async getEncounterByIdentifier(identifier) {
    const query = {
      'identifier.value': identifier.value,
    };

    if (identifier.system) {
      query['identifier.system'] = identifier.system;
    }

    return await EncounterSchema.findOne(query).exec();
  }

  /**
   * Atualiza um Encounter.
   * A validação RNDS é aplicada quando o perfil está declarado.
   *
   * Este método considera que o objeto recebido contém
   * o recurso completo, e não apenas os campos alterados.
   */
  async update(id, encounter) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('Encounter not found!', 404);
    }

    const data = {
      ...encounter,
      resourceType: 'Encounter',
    };

    delete data._id;
    delete data.id;

    if (data.meta?.profile?.includes(BR_CONTATO_ASSISTENCIAL_PROFILE)) {
      BRContatoAssistencialValidator.validate(data);
    }

    const updated = await EncounterSchema.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    ).exec();

    if (!updated) {
      throw new HttpError('Encounter not found!', 404);
    }

    return updated;
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('Encounter not found!', 404);
    }

    const deleted = await EncounterSchema.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new HttpError('Encounter not found!', 404);
    }

    return deleted;
  }

  async search(params = {}) {
    const query = {};

    if (params.status) {
      query.status = params.status;
    }

    if (params.class) {
      query['class.code'] = params.class;
    }

    if (params.identifier) {
      query['identifier.value'] = params.identifier;
    }

    if (params.subject) {
      query['subject.reference'] = params.subject;
    }

    if (params.patient) {
      query['subject.reference'] = params.patient;
    }

    if (params.location) {
      query['location.location.reference'] = params.location;
    }

    if (params.date) {
      const date = new Date(params.date);

      if (!Number.isNaN(date.getTime())) {
        query['period.start'] = { $lte: date };
        query['period.end'] = { $gte: date };
      }
    }

    const encounters = await EncounterSchema.find(query).exec();

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: encounters.length,
      entry: encounters.map((encounter) => ({
        resource: encounter.toObject(),
      })),
    };
  }
}

module.exports = new EncounterService();
