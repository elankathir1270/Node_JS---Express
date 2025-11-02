const { token } = require("morgan");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

//router handler
exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: { user: newUser },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //check if user & password is present in the user
  if (!email || !password) {
    const error = new CustomError(
      "please provide email, password for login",
      400
    );
    return next(error);
  }

  //check if the user is exist with given email
  const user = await User.findOne({ email }).select("+password");

  //const isMatch = await user.comparePasswordInDb(password, user.password);
  //check if the user exist and password matches
  if (!user || !(await User.findOne({ email }).select("+password"))) {
    const error = new CustomError("Incorrect password or email", 400);
    return next(error);
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});
