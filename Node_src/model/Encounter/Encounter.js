const { Schema, model } = require('mongoose');

const Identifier = require('../patient/Identifier');
const Coding = require('../patient/Coding');
const CodeableConcept = require('../patient/CodeableConcept');
const Reference = require('../patient/Reference');
const Period = require('../patient/Period');
const Quantity = require('../observation/Quantity');

const MetaSchema = new Schema(
  {
    versionId: String,
    lastUpdated: Date,
    profile: [String],
    security: [Schema.Types.Mixed],
    tag: [Schema.Types.Mixed],
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        'planned',
        'arrived',
        'triaged',
        'in-progress',
        'onleave',
        'finished',
        'cancelled',
        'entered-in-error',
        'unknown',
      ],
    },
    period: Period,
  },
  { _id: false }
);

const ClassHistorySchema = new Schema(
  {
    class: Coding,
    period: Period,
  },
  { _id: false }
);

const ParticipantSchema = new Schema(
  {
    type: {
      type: [CodeableConcept],
      default: undefined,
    },
    extension: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    period: Period,
    individual: Reference,
  },
  { _id: false }
);

const DiagnosisSchema = new Schema(
  {
    condition: {
      type: Reference,
      required: true,
    },
    use: CodeableConcept,
    rank: Number,
  },
  { _id: false }
);

const HospitalizationSchema = new Schema(
  {
    extension: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },

    preAdmissionIdentifier: Identifier,
    origin: Reference,
    admitSource: CodeableConcept,
    reAdmission: CodeableConcept,
    dietPreference: [CodeableConcept],
    specialCourtesy: [CodeableConcept],
    specialArrangement: [CodeableConcept],
    destination: Reference,
    dischargeDisposition: CodeableConcept,
  },
  { _id: false }
);
const EncounterLocationSchema = new Schema(
  {
    location: {
      type: Reference,
      required: true,
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'reserved', 'completed'],
    },
    physicalType: CodeableConcept,
    period: Period,
  },
  { _id: false }
);

const EncounterSchema = new Schema(
  {
    id: String,

    resourceType: {
      type: String,
      required: true,
      default: 'Encounter',
      enum: ['Encounter'],
    },

    meta: {
      type: MetaSchema,
      default: undefined,
    },

    identifier: {
      type: [Identifier],
      default: undefined,
    },

    status: {
      type: String,
      required: true,
      enum: [
        'planned',
        'arrived',
        'triaged',
        'in-progress',
        'onleave',
        'finished',
        'cancelled',
        'entered-in-error',
        'unknown',
      ],
    },

    statusHistory: {
      type: [StatusHistorySchema],
      default: undefined,
    },

    class: {
      type: Coding,
      required: true,
    },

    classHistory: {
      type: [ClassHistorySchema],
      default: undefined,
    },

    type: {
      type: [CodeableConcept],
      default: undefined,
    },

    serviceType: {
      type: CodeableConcept,
      default: undefined,
    },

    priority: {
      type: CodeableConcept,
      default: undefined,
    },

    subject: {
      type: Reference,
      default: undefined,
    },

    episodeOfCare: {
      type: [Reference],
      default: undefined,
    },

    basedOn: {
      type: [Reference],
      default: undefined,
    },

    participant: {
      type: [ParticipantSchema],
      default: undefined,
    },

    appointment: {
      type: [Reference],
      default: undefined,
    },

    period: {
      type: Period,
      default: undefined,
    },

    length: {
      type: Quantity,
      default: undefined,
    },

    reasonCode: {
      type: [CodeableConcept],
      default: undefined,
    },

    reasonReference: {
      type: [Reference],
      default: undefined,
    },

    diagnosis: {
      type: [DiagnosisSchema],
      default: undefined,
    },

    account: {
      type: [Reference],
      default: undefined,
    },

    hospitalization: {
      type: HospitalizationSchema,
      default: undefined,
    },

    location: {
      type: [EncounterLocationSchema],
      default: undefined,
    },

    serviceProvider: {
      type: Reference,
      default: undefined,
    },

    partOf: {
      type: Reference,
      default: undefined,
    },
  },
  {
    versionKey: false,
  }
).set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

module.exports = model('encounter', EncounterSchema);
