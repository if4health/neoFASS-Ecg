const mongoose = require('mongoose');
const PatientSchema = require('../model/patient/Patient');
const PractitionerSchema = require('../model/practitioner/Practitioner');

function getFhirResourceModel(type) {
    const models = {
        Patient: PatientSchema,
        Practitioner: PractitionerSchema,
    };
    const model = models[type];
    if (!model) {
        throw new Error(`Unknown FHIR resource type: ${type}`);
    }
    return model;;
}

function parseFhirReference(reference) {
  const [type, id] = reference.split('/');
  if (!type || !id) {
    throw new Error(`Invalid FHIR reference: ${reference}`);
  }
  return type;
}


async function linkFhirResource(type, User) {
    const Model = getFhirResourceModel(type);
    let fhirResource = await Model.findOne({
        name: {
            $elemMatch: {
                family: User.surname,
                given: User.name
            }
        }
    })

    if(fhirResource) return fhirResource;
    
    const newFhirResource = new Model({
        resourceType: type,
        identifier: [
            {
                system: 'IF4Health',
            },
        ],
        name: [
            {
                use: 'official',
                family: User.surname,
                given: User.name,
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
    linkFhirResource
};
