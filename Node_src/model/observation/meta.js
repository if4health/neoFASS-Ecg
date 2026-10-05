const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    profile: {
      type: [String],
      default: void 0,
    },
  },
  {
    _id: false,
  }
);
