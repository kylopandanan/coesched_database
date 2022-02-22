const mongoose = require("mongoose");

const AuthYearScheme = new mongoose.Schema({
  year: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("year", AuthYearScheme);
