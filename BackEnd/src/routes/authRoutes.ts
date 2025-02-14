import express from "express";
import {
  signup,
  login,
  sendOTP,
  resetPassword,
} from "../controllers/authController";

const router = express.Router();

// User Signup route
router.post("/signup", signup);

// User Login route
router.post("/login", login);

router.post("/send-otp", sendOTP);

router.post("/reset-password", resetPassword);

export default router;
