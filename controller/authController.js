const asyncErrorHandler = require("../utils/asyncErrorHandler");
const User = require("./../models/userModel");

//router handler
exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
});
