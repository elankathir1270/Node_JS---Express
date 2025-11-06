const { token } = require("morgan");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const util = require("util");

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

  //check if the user exist and password matches
  if (!user) {
    const error = new CustomError("Incorrect password or email", 400);
    return next(error);
  }

  const isMatch = await user.comparePasswordInDb(password);

  if (!isMatch) {
    const error = new CustomError("Incorrect password or email", 400);
    return next(error);
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    //user,
  });
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  //read the token & check if its exist//
  const testToken = req.headers.authorization;

  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new CustomError("You are not logged in", 401));
  }

  //validate the token//
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  ); //event is async function it wont return promise so we have to promisify
  //console.log(decodedToken);

  //if the user exist//
  const user = await User.findById(decodedToken.id);
  if (!user) {
    next(new CustomError("The user with given token does not exist", 401));
  }

  //if the user changed password after the token was issued//
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    const error = new CustomError(
      "Password has been changed ,Please login again",
      401
    );
    next(error);
  }

  //allow the user to access the route//
  req.user = user;
  next();
});
