const express = require("express");
const {
  signup,
  login,
} = require("../../BackEnd/src/controllers/middleware/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
