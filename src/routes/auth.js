const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { main } = require("../utils/nodemailer");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const COOKIE_OPTIONS = {
  expires: new Date(Date.now() + 8 * 3600000),
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
};

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered. Please Sign In." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      otp,
      otpExpires,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    // Graceful Email sending - does not crash signup if nodemailer fails
    try {
      await main(emailId, otp);
    } catch (mailErr) {
      console.error("⚠️ Nodemailer Email Failed:", mailErr.message);
      console.log("🔑 [Fallback OTP]:", otp);
    }

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
      message: `${firstName} Registered Successfully!`,
      data: savedUser,
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(400).json({
      error: err.message || "Error in User Registration",
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({ error: "Email and Password are required." });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpires = otpExpires;
      const updatedUser = await user.save();

      try {
        await main(emailId, otp);
      } catch (mailErr) {
        console.error("⚠️ Nodemailer Email Failed:", mailErr.message);
        console.log("🔑 [Fallback OTP]:", otp);
      }

      res.cookie("token", token, COOKIE_OPTIONS);

      res.status(200).json({
        message: "OTP has been sent to your email",
        data: updatedUser,
      });
    } else {
      return res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    if (!emailId || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully!",
      data: user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = authRouter;