const mongoose = require("mongoose");

const AuthRoomScheme = new mongoose.Schema({
  room: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("room", AuthRoomScheme);
