const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

// db.ratedetails = require("./auag.model");


module.exports = db;