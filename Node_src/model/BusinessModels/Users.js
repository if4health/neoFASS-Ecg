const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['patient', 'practitioner', 'admin'],
        required: true,
    },
    fhirReference: {
        type: String,
        required: true,
    },
    meta: {
        createdAt: {
            type: Date,
            default: Date.now,
        },
        lastAccess: {
            type: Date,
        },
    },
});

module.exports = mongoose.model('Users', UsersSchema);