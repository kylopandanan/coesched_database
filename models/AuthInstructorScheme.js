const mongoose = require("mongoose");

const AuthInstructorScheme = new mongoose.Schema({
  instructor: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("instructor", AuthInstructorScheme);
