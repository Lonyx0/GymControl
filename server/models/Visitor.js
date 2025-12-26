const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        unique: true
    },
    lastVisit: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
