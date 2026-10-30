const { Schema, model } = require('mongoose');

const Identifier = require('../patient/Identifier');
const Coding = require('../patient/Coding');
const CodeableConcept = require('../patient/CodeableConcept');
const Reference = require('../patient/Reference');
const Period = require('../patient/Period');

// Metadados do recurso
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

// Estágio da condição
const StageSchema = new Schema(
  {
    summary: {
      type: CodeableConcept,
      required: true,
    },
    assessment: {
      type: [Reference],
      default: undefined,
    },
    type: CodeableConcept,
  },
  { _id: false }
);

// Evidências relacionadas à condição
const EvidenceSchema = new Schema(
  {
    code: {
      type: [CodeableConcept],
      default: undefined,
    },
    detail: {
      type: [Reference],
      default: undefined,
    },
  },
  { _id: false }
);

// Anotações da condição
const NoteSchema = new Schema(
  {
    authorReference: Reference,
    authorString: String,
    time: Date,
    text: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ConditionSchema = new Schema(
  {
    id: String,

    resourceType: {
      type: String,
      required: true,
      default: 'Condition',
      enum: ['Condition'],
    },

    meta: {
      type: MetaSchema,
      default: undefined,
    },

    identifier: {
      type: [Identifier],
      default: undefined,
    },

    clinicalStatus: CodeableConcept,

    verificationStatus: CodeableConcept,

    category: {
      type: [CodeableConcept],
      default: undefined,
    },

    severity: CodeableConcept,

    code: CodeableConcept,

    bodySite: {
      type: [CodeableConcept],
      default: undefined,
    },

    subject: {
      type: Reference,
      required: true,
    },

    encounter: Reference,

    // Choice type: onset[x]
    onsetDateTime: String,
    onsetAge: Schema.Types.Mixed,
    onsetPeriod: Period,
    onsetRange: Schema.Types.Mixed,
    onsetString: String,

    // Choice type: abatement[x]
    abatementDateTime: String,
    abatementAge: Schema.Types.Mixed,
    abatementPeriod: Period,
    abatementRange: Schema.Types.Mixed,
    abatementString: String,

    recordedDate: String,

    recorder: Reference,

    asserter: Reference,

    stage: {
      type: [StageSchema],
      default: undefined,
    },

    evidence: {
      type: [EvidenceSchema],
      default: undefined,
    },

    note: {
      type: [NoteSchema],
      default: undefined,
    },

    text: Schema.Types.Mixed,

    extension: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },

    modifierExtension: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
  },
  {
    versionKey: false,
    minimize: false,
  }
).set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

module.exports = model('condition', ConditionSchema);
