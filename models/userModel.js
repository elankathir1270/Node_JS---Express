const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "please enter your name"],
  },
  email: {
    type: String,
    require: [true, "please enter an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please enter a valid email"],
  },
  photo: String,
  password: {
    type: String,
    require: [true, "please enter a password"],
    minlength: 6,
  },
  confirmPassword: {
    type: String,
    require: [true, "please confirm your password"],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
