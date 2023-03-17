const mongoose = require("mongoose");

const IndividualClimbSchema = new mongoose.Schema({
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
    type: String,
    required: true,
  },
  image: {
    type: String,
    require: false,
  },
  cloudinaryId: {
    type: String,
    require: false,
  },
  tags: {
    type: Array,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    ref: "User",
    required: true,
  }

});

module.exports = mongoose.model("IndividualClimb", IndividualClimbSchema);