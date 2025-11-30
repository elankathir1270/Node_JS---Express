const express = require("express");
const app = express();
const authController = require("./../controller/authController");

app.use(express.json());

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgetPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

module.exports = router;
