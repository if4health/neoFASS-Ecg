const { Schema, model } = require('mongoose');

const Identifier = require('../observation/Identifier');
const Reference = require('../observation/Reference');
const CodeableConcept = require('../observation/CodeableConcept');
const Period = require('../observation/Period');
const Annotation = require('../observation/Annotation');

const ProcedureSchema = new Schema(
  {
    id: {
      type: String,
    },

    resourceType: {
      type: String,
      required: true,
    },

    identifier: {
      type: [Identifier],
      default: void 0,
    },

    instantiatesCanonical: {
      type: [String],
      default: void 0,
    },

    instantiatesUri: {
      type: [String],
      default: void 0,
    },

    basedOn: {
      type: [Reference],
      default: void 0,
    },

    partOf: {
      type: [Reference],
      default: void 0,
    },

    status: {
      type: String,
      required: true,
    },

    statusReason: {
      type: CodeableConcept,
      default: void 0,
    },

    category: {
      type: CodeableConcept,
      default: void 0,
    },

    code: {
      type: CodeableConcept,
      default: void 0,
    },

    subject: {
      type: Reference,
      default: void 0,
    },

    encounter: {
      type: Reference,
      default: void 0,
    },

    performedDateTime: {
      type: String,
      default: void 0,
    },

    performedPeriod: {
      type: Period,
      default: void 0,
    },

    performedString: {
      type: String,
      default: void 0,
    },

    performedAge: {
      type: Schema.Types.Mixed,
      default: void 0,
    },

    performedRange: {
      type: Schema.Types.Mixed,
      default: void 0,
    },

    recorder: {
      type: Reference,
      default: void 0,
    },

    asserter: {
      type: Reference,
      default: void 0,
    },

    performer: {
      type: [Schema.Types.Mixed],
      default: void 0,
    },

    location: {
      type: Reference,
      default: void 0,
    },

    reasonCode: {
      type: [CodeableConcept],
      default: void 0,
    },

    reasonReference: {
      type: [Reference],
      default: void 0,
    },

    bodySite: {
      type: [CodeableConcept],
      default: void 0,
    },

    outcome: {
      type: CodeableConcept,
      default: void 0,
    },

    report: {
      type: [Reference],
      default: void 0,
    },

    complication: {
      type: [CodeableConcept],
      default: void 0,
    },

    complicationDetail: {
      type: [Reference],
      default: void 0,
    },

    followUp: {
      type: [CodeableConcept],
      default: void 0,
    },

    note: {
      type: [Annotation],
      default: void 0,
    },

    focalDevice: {
      type: [Schema.Types.Mixed],
      default: void 0,
    },

    usedReference: {
      type: [Reference],
      default: void 0,
    },

    usedCode: {
      type: [CodeableConcept],
      default: void 0,
    },
  },
  {
    versionKey: false,
  }
).set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
  },
});

module.exports = model('Procedure', ProcedureSchema);
