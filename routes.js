const express = require("express");
const router = express.Router();
const { verifyJWT } = require("./middlewares/auth.middleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
} = require("./controller/user.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
//secured routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyJWT, changeCurrentPassword);

module.exports = router;
