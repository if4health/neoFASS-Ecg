const { Schema, model } = require('mongoose');

const CompositionSchema = new Schema(
  {
    id: { type: String },
    resourceType: {
      type: String,
      required: true,
      default: 'Composition',
      enum: ['Composition'],
    },
    meta: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    identifier: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    status: {
      type: String,
      required: true,
      enum: ['preliminary', 'final', 'amended', 'entered-in-error'],
    },
    type: {
      type: Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    subject: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    encounter: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    date: {
      type: String,
      required: true,
    },
    author: {
      type: [Schema.Types.Mixed],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1,
        message: 'Composition.author deve possuir pelo menos um elemento',
      },
    },
    title: {
      type: String,
      required: true,
    },
    confidentiality: {
      type: String,
      default: undefined,
    },
    attester: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    custodian: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    relatesTo: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    event: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    section: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
  },
  {
    versionKey: false,
    strict: true,
  }
);

CompositionSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret.id || ret._id.toString();
    delete ret._id;
  },
});

module.exports = model('Composition', CompositionSchema);
