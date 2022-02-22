const mongoose = require("mongoose");

const AuthSubjectScheme = new mongoose.Schema({
  s_code: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("subject", AuthSubjectScheme);
