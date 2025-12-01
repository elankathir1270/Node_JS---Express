const User = require("./../models/userModel");
const CustomError = require("../utils/customError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const authController = require("../controller/authController");

const filteredReqObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((prop) => {
    if (allowedFields.includes(prop)) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();

  authController.createSendResponse(users, 200, res);
});

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  //Get the current user from database
  const user = await User.findById(req.user._id).select("+password");
  //Check if the supplied current password is correct
  if (
    !(await user.comparePasswordInDb(req.body.currentPassword, user.password))
  ) {
    return next(new CustomError("Current password you provided is wrong", 401));
  }
  //If supplied password is correct update the password with new value
  user.password = req.body.password;
  user.confirmPassword = req.body.password;
  await user.save();
  //Login user & send JWT
  authController.createSendResponse(user, 200, res);
});

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
  // Check If request body contains password | confirmPassword
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new CustomError(
        "You cannot update your password using this endpoint",
        400
      )
    );
  }

  //Update user details
  const filteredObj = filteredReqObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    runValidators: true,
    new: true,
  });

  // 4. Send response
  authController.createSendResponse(updatedUser, 200, res);
});

//Soft Delete(204)
exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
