const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  typeOfClimb: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  attempts: {
    type: String,
    required: true,
  },
  top: {
    type: Boolean,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  usersWhoLike: {
    type: String,
    required: true,
  },
  deleted: {
    type: Boolean,
    required: true,
  },
  image: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  tags: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", SessionSchema);