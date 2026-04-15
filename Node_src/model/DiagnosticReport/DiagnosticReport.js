const { Schema, model } = require('mongoose');
const Identifier = require('../observation/Identifier');
const Reference = require('../observation/Reference');
const CodeableConcept = require('../observation/CodeableConcept');
const Period = require('../observation/Period');

const DiagnosticReportSchema = new Schema(
  {
    id: {
      type: String,
    },
    resourceType: {
      type: String,
      required: true
    },
    identifier: {
      type: [Identifier],
      default: void 0,
    },
    basedOn: {
      type: [Reference],
      default: void 0,
    },
    status: {
      type: String,
      required: true,
    },
    category: {
      type: [CodeableConcept],
      default: void 0,
    },
    code: {
      type: CodeableConcept,
      required: true,
    },
    subject: {
      type: Reference,
      default: void 0,
    },
    encounter: {
      type: Reference,
      default: void 0,
    },
    effectiveDateTime: {
      type: String,
      default: void 0,
    },
    effectivePeriod: {
      type: Period,
      default: void 0,
    },
    issued: {
      type: Date,
      default: void 0,
    },
    performer: {
      type: [Reference],
      default: void 0,
    },
    resultsInterpreter: {
      type: [Reference],
      default: void 0,
    },
    result: {
      type: [Reference],
      default: void 0,
    },
    imagingStudy: {
      type: [Reference],
      default: void 0,
    },
    media: [{
        comment: String,
        link: Reference
    }],
    conclusion: {
      type: String,
      default: void 0,
    },
    conclusionCode: {
      type: [CodeableConcept],
      default: void 0,
    },
    presentedForm: {
      type: [Schema.Types.Mixed],
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

module.exports = model('DiagnosticReport', DiagnosticReportSchema);