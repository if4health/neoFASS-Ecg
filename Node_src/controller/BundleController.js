const PatientSchema = require('../model/patient/Patient');
const PractitionerSchema = require("../model/practitioner/Practitioner");
const ObservationSchema = require('../model/observation/Observation');

const RESOURCE_MAP = {
    "Patient": PatientSchema,
    "Practitioner": PractitionerSchema,
    "Observation": ObservationSchema,
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

        if (type !== 'collection' && type !== 'transaction') {
            return res.status(400).json({ message: 'Only collection or transaction bundles are supported.' });
        }

        const results = [];
        for (const item of entry) {
            try {
                const insertedId = await saveResource(item.resource);
                results.push({ id: insertedId, resourceType: item.resource.resourceType, status: "created" });
            } catch (error) {
                console.error(error.message);
                results.push({ resourceType: item.resource.resourceType, status: "error", message: error.message });
            }
        }

        res.status(201).json({ message: 'Bundle processed', results });
    }
};

module.exports = BundleController;
