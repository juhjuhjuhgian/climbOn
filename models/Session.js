const mongoose = require("mongoose");
const IndividualClimb = require('../models/Individual');


const ClimbingSessionSchema = new mongoose.Schema({
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type:mongoose.Schema.Types.ObjectId,
      required: true
    },
    username: {
      type: String,
      required: true,
    },
    climbs: [IndividualClimb.schema],

    likes: {
      type: Number,
      default: 0,
      required: true
    }
  });
  
  module.exports = mongoose.model("ClimbingSession", ClimbingSessionSchema);