import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import nodemailer from "nodemailer";

const JWT_SECRET: string = "chloe&lucifer"; // JWT Secret key

// Signup controller logic
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, dob, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return; // No further code should run after sending the response
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await User.createUser(
      firstName,
      lastName,
      dob,
      email,
      phoneNumber,
      hashedPassword
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Login controller logic
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return; // No further code should run after sending the response
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return; // No further code should run after sending the response
    }

    // Sign JWT Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Generate a 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// 📌 Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// 📌 Send OTP via Email
const sendEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

// 📌 Send OTP to User
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    // Store OTP in DB
    await User.storeOTP(email, otp, expiresAt);

    // Send OTP via Email
    await sendEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Verify OTP & Reset Password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findByEmail(email);

    if (!user || user.otp !== otp || new Date(user.OtpExpiresAt) < new Date()) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(email, hashedPassword);

    // Clear OTP after successful reset
    await User.clearOTP(email);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
