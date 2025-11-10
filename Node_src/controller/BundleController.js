const PatientSchema = require('../model/patient/Patient');
const PractitionerSchema = require('../model/practitioner/Practitioner');
const ObservationSchema = require('../model/observation/Observation');

const RESOURCE_MAP = {
  Patient: PatientSchema,
  Practitioner: PractitionerSchema,
  Observation: ObservationSchema,
};

async function saveResource(resource) {
  const Model = RESOURCE_MAP[resource.resourceType];
  if (!Model) {
    throw new Error(`ResourceType ${resource.resourceType} not supported.`);
  }
  const document = new Model(resource);
  const result = await document.save();
  return result._id;
}

const BundleController = {
  async processBundle(req, res) {
    const { type, entry } = req.body;

    if (!['collection', 'batch'].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Only collection and batch bundles are supported.' });
    }

    if (!Array.isArray(entry)) {
      return res
        .status(400)
        .json({ message: 'Invalid or missing entry array in bundle.' });
    }

    const results = [];

    if (type === 'collection') {
      for (const item of entry) {
        try {
          const insertedId = await saveResource(item.resource);
          results.push({
            id: insertedId,
            resourceType: item.resource.resourceType,
            status: 'created',
          });
        } catch (error) {
          results.push({
            resourceType: item.resource?.resourceType,
            status: 'error',
            message: error.message,
          });
        }
      }
      return res
        .status(201)
        .json({ message: 'Collection bundle processed', results });
    }

    if (type === 'batch') {
      for (const item of entry) {
        const { resource, request } = item;
        if (!request?.method || !request?.url) {
          results.push({
            resourceType: resource?.resourceType,
            status: 'error',
            message: 'Missing request.method or request.url',
          });
          continue;
        }

        try {
          const method = request.method.toUpperCase();
          let result;

          if (method === 'POST') {
            delete resource.id;
            result = await saveResource(resource);
          } else {
            throw new Error(`Unsupported method in batch: ${method}`);
          }

          results.push({
            id: result,
            resourceType: resource.resourceType,
            status: 'success',
          });
        } catch (error) {
          results.push({
            resourceType: resource?.resourceType,
            status: 'error',
            message: error.message,
          });
        }
      }

      return res
        .status(200)
        .json({ message: 'Batch bundle processed', results });
    }
  },
};

module.exports = BundleController;
