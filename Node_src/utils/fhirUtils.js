const mongoose = require('mongoose');
const PatientSchema = require('../model/patient/Patient');
const PractitionerSchema = require('../model/practitioner/Practitioner');

const defaultScopesByRole = {
  patient: ['openid', 'profile', 'patient/*.rs', 'patient/Observation.rs', 'patient/Patient.rs', 'launch/patient'],
  practitioner: ['openid', 'profile', 'user/*.crudsh', 'user/Observation.crudsh', 'user/Patient.crudsh', 'launch'],
};

function getFhirResourceModel(type) {
  const models = {
    Patient: PatientSchema,
    Practitioner: PractitionerSchema,
  };
  const model = models[type];
  if (!model) {
    throw new Error(`Unknown FHIR resource type: ${type}`);
  }
  return model;
}

function parseFhirReference(reference) {
  const [type, id] = reference.split('/');
  if (!type || !id) {
    throw new Error(`Invalid FHIR reference: ${reference}`);
  }
  return type;
}

async function linkFhirResource(type, userData) {
  const Model = getFhirResourceModel(type);
  const givenParts = userData.name.split(/\s+/);
  let fhirResource = await Model.findOne({
    name: {
      $elemMatch: {
        family: userData.surname,
        given: { $all: givenParts },
      },
    },
  });

  if (fhirResource) {
    fhirResource.identifier[0].value = userData._id.toString();
    await fhirResource.save();
    return fhirResource;
  }

  const newFhirResource = new Model({
    resourceType: type,
    identifier: [
      {
        system: 'IF4Health',
        value: userData._id.toString(),
      },
    ],
    name: [
      {
        use: 'official',
        family: userData.surname,
        given: [userData.name],
      },
    ],
    birthDate: userData.birthDate,
    telecom: [
      {
        system: 'phone',
        value: userData.phone,
        use: 'mobile',
      },
      {
        system: 'email',
        value: userData.email,
        use: 'home',
      },
    ],
  });
  return await newFhirResource.save();
}

async function findExistingFhirResource(type, userId) {
  const Model = getFhirResourceModel(type);
  return await Model.findOne({
    identifier: {
      $elemMatch: {
        value: userId.toString(),
      },
    },
  });
}

async function createBlankFhirPerson(type, user) {
  const Model = getFhirResourceModel(type);
  const resource = new Model({
    resourceType: type,
    identifier: [
      {
        system: 'IF4Health',
        value: user._id.toString(),
      },
    ],
    name: [
      {
        use: 'official',
        family: user.username,
        given: ['User'],
      },
    ],
  });
  return await resource.save();
}

module.exports = {
  getFhirResourceModel,
  findExistingFhirResource,
  createBlankFhirPerson,
  parseFhirReference,
  linkFhirResource,
  defaultScopesByRole,
};
