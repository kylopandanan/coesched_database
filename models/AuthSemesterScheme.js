const mongoose = require("mongoose");

const AuthSemesterScheme = new mongoose.Schema({
  semester: { type: String, required: true },
  year: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("semester", AuthSemesterScheme);
