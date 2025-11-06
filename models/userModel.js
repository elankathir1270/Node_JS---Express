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
  passwordChangedAt: Date,
  //this property will be available in user document when user change their password, else it will be undefined so property wont be there in doc
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

userSchema.methods.isPasswordChanged = async function (jswTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(passwordChangedTimeStamp, jswTimeStamp);

    return jswTimeStamp < passwordChangedTimeStamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
