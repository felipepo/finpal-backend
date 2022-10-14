const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    type: {
        required: true,
        type: String
    },    
    value: {
        required: true,
        type: Number
    },
    date: {
        required: true,
        type: Date
    },
    category: {
        required: true,
        type: String
    },
    comment: {
        required: false,
        type: String
    },
    isInvestment: {
        required: true,
        type: Boolean
    },
})

module.exports = mongoose.model('Data', dataSchema)