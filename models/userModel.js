const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
  role: {
    type: String,
    enum: ["user", "admin"], //add here if u have many user role "test1","test2"
    default: "user",
  },
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
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  //this property will be available in user document when user change their password, else it will be undefined so property wont be there in doc.
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  //unless user modified the password below logic wont execute, to avoid redundant.
  if (!this.isModified("password")) return next();

  //encrypt the password before saving it
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

//this function calls when any find query executed
userSchema.pre(/^find/, async function (next) {
  //regular function has its own "this" keyword
  //here "this" key will point to current query which is executing
  //whenever user calls "getAllUsers" User.find() query

  this.find({ active: { $ne: false } }); //filter active property
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

userSchema.methods.createResetpasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); //size | type
  //note: Its not encrypted token, its a plain token to send user

  //encrypt for saving in DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //"sha256" is a algorithm and "hex" format encryption

  //console.log(resetToken, this.passwordResetToken);

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
