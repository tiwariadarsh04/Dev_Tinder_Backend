const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

const cloudinary = require("../utils/cloudinary");
var upload = require("../utils/multer");

profileRouter.patch(
  "/profile/edit",
  userAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!validateEditProfileData(req)) {
        throw new Error("Invalid Edit Request");
      }

      console.log("Request file is :", req.file);

      const loggedInUser = req.user;

      Object.keys(req.body).forEach(
        (key) => (loggedInUser[key] = req.body[key])
      );

      // const optional = {
      //   folder: "/Raghuveer",
      //   transformation: [{ width: 1000, height: 1000, crop: "limit" }],
      //   timeout: 120000, // 60 seconds
      // };

      if (req.file) {
        const res = await cloudinary.uploader.upload(req.file.path);
        loggedInUser.photoUrl=res.secure_url;
        console.log("cloudinary response is :", res);
      }

      await loggedInUser.save();

      res.json({
        message: `${loggedInUser.firstName}, your profile updated successfuly`,
        data: loggedInUser,
      });
    } catch (err) {
      console.log("Error is here :", err);
      res.status(400).send("ERROR : " + err.message);
    }
  }
);

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
