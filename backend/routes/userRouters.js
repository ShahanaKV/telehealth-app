const express = require("express");
const {
  signup,
  verifyAccount,
  login,
  logout,
} = require("../controller/authController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify", isAuthenticated, verifyAccount);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;