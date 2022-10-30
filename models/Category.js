const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    color: {
        required: true,
        type: String
    },
    userID: {
        required: true,
        type: String
    },
})

categorySchema.index({ name: 1, userID: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema)