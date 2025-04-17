const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { main } = require("../utils/nodemailer");

// Generate a 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    //   Creating a new instance of the User model
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

    main(emailId, otp);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // Set expiration time
      httpOnly: true, // Make the cookie inaccessible to JavaScript
      secure: true, // Send cookie over HTTPS only
      sameSite: "None", // Allow cross-site requests
    });

    res.json({
      message: `${firstName} Registered Successfully!!`,
      data: savedUser,
    });
  } catch (err) {
    res.status(400).send({
      message: "Error in User Registration",
      error: err,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // Set expiration time
        httpOnly: true, // Make the cookie inaccessible to JavaScript
        secure: true, // Send cookie over HTTPS only
        sameSite: "None", // Allow cross-site requests
      });

      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

      user.otp = otp;
      user.otpExpires = otpExpires;

      const updatedUser = await user.save();

      main(emailId, otp);

      res.send({
        message: "Email has been send on you email",
        user: updatedUser,
      });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    // Check if OTP is valid
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "None", // Allow cross-site usage
  });
  res.status(200).send("Logged out successfully");
});

module.exports = authRouter;
