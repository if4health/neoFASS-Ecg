const { Schema, model } = require('mongoose');
const Identifier = require('../Identifier');
const CodeableConcept = require('../CodeableConcept');
const ContactPoint = require('../ContactPoint');
const Address = require('../Address');
const Reference = require('../Reference');

const PositionSchema = new Schema(
  {
    longitude: Number,
    latitude: Number,
    altitude: {
      type: Number,
      default: undefined,
    },
  },
  { _id: false }
);

const HoursOfOperationSchema = new Schema(
  {
    daysOfWeek: {
      type: [String],
      default: undefined,
    },
    allDay: {
      type: Boolean,
      default: undefined,
    },
    openingTime: {
      type: String,
      default: undefined,
    },
    closingTime: {
      type: String,
      default: undefined,
    },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    id: String,

    resourceType: {
      type: String,
      required: true,
      default: 'Location',
      enum: ['Location'],
    },

    identifier: {
      type: [Identifier],
      default: undefined,
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: undefined,
    },

    operationalStatus: {
      system: String,
      version: String,
      code: String,
      display: String,
      userSelected: Boolean,
    },

    name: {
      type: String,
      default: undefined,
    },

    alias: {
      type: [String],
      default: undefined,
    },

    description: {
      type: String,
      default: undefined,
    },

    mode: {
      type: String,
      enum: ['instance', 'kind'],
      default: undefined,
    },

    type: {
      type: [CodeableConcept],
      default: undefined,
    },

    telecom: {
      type: [ContactPoint],
      default: undefined,
    },

    address: {
      type: Address,
      default: undefined,
    },

    physicalType: {
      type: CodeableConcept,
      default: undefined,
    },

    position: {
      type: PositionSchema,
      default: undefined,
    },

    managingOrganization: {
      type: Reference,
      default: undefined,
    },

    partOf: {
      type: Reference,
      default: undefined,
    },

    hoursOfOperation: {
      type: [HoursOfOperationSchema],
      default: undefined,
    },

    availabilityExceptions: {
      type: String,
      default: undefined,
    },

    endpoint: {
      type: [Reference],
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

module.exports = model('location', LocationSchema);
