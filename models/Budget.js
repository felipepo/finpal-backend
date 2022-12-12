const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    category: {
        required: true,
        type: String
    },    
    value: {
        required: true,
        type: Number
    },
    userID: {
        required: true,
        type: String
    },
})

dataSchema.index({ category: 1, userID: 1 }, { unique: true });

module.exports = mongoose.model('Budget', dataSchema)