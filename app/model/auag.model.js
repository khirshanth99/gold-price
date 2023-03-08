const mongoose = require('mongoose');

const RateDeatils = mongoose.model(
    'RateDeatils',
    new mongoose.Schema({
        ts: Number,
        xauClose: Number,
        xagClose: Number,
        items: [{
            curr: String,
            src: String,
            xrate: Number,
            xauXrate: Number,
            xagXrate: Number,
            xauClose: Number,
            xagClose: Number
        }]
    })
)

module.exports = RateDeatils;