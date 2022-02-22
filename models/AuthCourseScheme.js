const mongoose = require("mongoose");

const AuthCourseScheme = new mongoose.Schema({
  course: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("course", AuthCourseScheme);
