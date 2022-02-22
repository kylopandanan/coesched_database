const mongoose = require("mongoose");

const AuthScheduleScheme = new mongoose.Schema({
  dayIndex: { type: Number, required: true },
  timeslotIndex: { type: Number, required: true },
  course: { type: String, required: true },
  section: { type: String, required: true },
  room: { type: String, required: true },
  day: { type: String, required: true },
  timeslot: { type: String, required: true },
  subject: { type: String, required: true },
  instructor: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("schedule", AuthScheduleScheme);
