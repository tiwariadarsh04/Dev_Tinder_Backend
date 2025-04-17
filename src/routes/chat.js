const express = require("express");
const chatRouter = express.Router();
const Chat = require("../models/chat");
const { userAuth } = require("../middlewares/auth");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;


  let chat = await Chat.findOne({
    participant: { $all: [userId, targetUserId] },
  });

  if (!chat) {
    console.log("No chat exit in Between this two user......from routes");
    chat = new Chat({
      participant: [userId, targetUserId],
      message: [],
    });
    await chat.save();
  } else {
    console.log("chat exit in Between this two user......from routes");
  }

  res.send(chat);
});

module.exports = chatRouter;
