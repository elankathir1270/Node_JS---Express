const { token } = require("morgan");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const util = require("util");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user: user },
  });
};

exports.createSendResponse = createSendResponse;

//router handler
exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createSendResponse(newUser, 201, res);
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

  createSendResponse(user, 200, res);
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
  ); //event it's a async function it wont return promise so we have to promisify
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
  req.user = user; //here we set (req.user) user to req object as a new property intentionally, for some other purposes.
  next();
});

/**
  since we cannot pass any arguments other than (req,res,next) in middleware function here we use 
  a wrapper function to use userRole
 */
exports.restrict = (userRole) => {
  return (req, res, next) => {
    if (req.user.role !== userRole) {
      const error = new CustomError(
        "You don't have permission to perform this action",
        403 //403 forbidden error, means not permitted to perform this action
      );
      next(error);
    }
    next();
  };
};

/**
//if we have multiple role to perform some crucial actions(delete) use "Rest parameter"
exports.restrict = (...userRole) => {
  //use (...role) "rest" parameter means is has multiple values and ll be an array in this case
  return (req, res, next) => {
    if (!userRole.includes(req.user.role)) {
      const error = new CustomError(
        "You don't have permission to perform this action",
        403 //403 forbidden error, means not permitted to perform this action
      );
      next(error);
    }
    next();
  };
};
 */

exports.forgetPassword = asyncErrorHandler(async (req, res, next) => {
  //Get the user based on the posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new CustomError(
      "we could not find the user with given email",
      404
    );
    return next(error);
  }
  //Generate a random reset token
  const resetToken = await user.createResetpasswordToken();

  await user.save({ validateBeforeSave: false });

  //Send the token back to the user email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `We have received a password reset request. Please use the below link to reset your password \n\n ${resetUrl}\n\n This password reset link will be valid for only 10 minutes`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password change request received",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "password reset link send to the user email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetToken = undefined;
    user.save({ validateBeforeSave: false });

    return new CustomError(
      "There was an error sending password reset email, please try again later",
      500
    );
  }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  //If the user exist with the given token & token has not expired
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("Token is invalid or has expired", 400);
    next(error);
  }

  //Resetting the user password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();

  user.save(); //this time save with validations

  //Login the user
  createSendResponse(user, 200, res);
});
