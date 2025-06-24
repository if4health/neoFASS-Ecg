const { Schema, model } = require('mongoose');

const ChunkSchema = new Schema({
    id: {
        type: String
    },
    reference: {
        type: String
    },
    position: {
        type: Number
    },
    data: {
        type: String
    }
});

module.exports = model('chunk', ChunkSchema);