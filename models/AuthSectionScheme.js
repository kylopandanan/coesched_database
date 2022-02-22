const mongoose = require("mongoose");

const AuthSectionScheme = new mongoose.Schema({
  section: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("section", AuthSectionScheme);
