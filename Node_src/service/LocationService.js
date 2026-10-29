const LocationSchema = require('../model/location/Location');
const mongoose = require('mongoose');
const BRLocalAtendimentoValidator = require('./validator/profiles/BRLocalAtendimentoValidator');

const BR_LOCAL_ATENDIMENTO_PROFILE =
  'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRLocalAtendimento-1.0';

class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class LocationService {
  async createLocation(location) {
    const data = {
      ...location,
      resourceType: 'Location',
    };

    if (data.meta?.profile?.includes(BR_LOCAL_ATENDIMENTO_PROFILE)) {
      BRLocalAtendimentoValidator.validate(data);
    }

    return await LocationSchema.create(data);
  }

  async getLocationById(id) {
    return await this.findById(id);
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('Location not found!', 404);
    }

    const location = await LocationSchema.findById(id).exec();

    if (!location) {
      throw new HttpError('Location not found!', 404);
    }

    return location;
  }

  async getLocationByIdentifier(identifier) {
    const query = {
      'identifier.value': identifier.value,
    };

    if (identifier.system) {
      query['identifier.system'] = identifier.system;
    }

    return await LocationSchema.findOne(query).exec();
  }

  async update(id, location) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('Location not found!', 404);
    }

    const data = {
      ...location,
      resourceType: 'Location',
    };

    delete data._id;
    delete data.id;

    if (data.meta?.profile?.includes(BR_LOCAL_ATENDIMENTO_PROFILE)) {
      BRLocalAtendimentoValidator.validate(data);
    }

    const updated = await LocationSchema.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      throw new HttpError('Location not found!', 404);
    }

    return updated;
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError('Location not found!', 404);
    }

    const deleted = await LocationSchema.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new HttpError('Location not found!', 404);
    }

    return deleted;
  }

  async search(params = {}) {
    const query = {};

    if (params.name) {
      query.name = {
        $regex: params.name,
        $options: 'i',
      };
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.identifier) {
      query['identifier.value'] = params.identifier;
    }

    if (params.address) {
      query['address.text'] = {
        $regex: params.address,
        $options: 'i',
      };
    }

    const locations = await LocationSchema.find(query).exec();

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: locations.length,
      entry: locations.map((location) => ({
        resource: location.toObject(),
      })),
    };
  }
}

module.exports = new LocationService();
