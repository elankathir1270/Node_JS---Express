const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    select: false,
  },
  confirmPassword: {
    type: String,
    require: [true, "please confirm your password"],
    validate: {
      //this validator will only work for save() & create()
      validator: function (val) {
        return val === this.password;
      },
      message: "Password and Confirm Password does not match",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  //encrypt the password before saving it
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.comparePasswordInDb = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
