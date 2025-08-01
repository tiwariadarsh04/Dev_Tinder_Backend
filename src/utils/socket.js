const socket = require("socket.io");
const Chat = require("../models/chat");

const initilizeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: [
        "https://dev-tinder-web-eight.vercel.app",
        "https://devtinder-web-ncza.onrender.com",
        "http://localhost:3000", // optional for local dev
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("$");
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
      const roomId = [userId, targetUserId].sort().join("$");
      console.log(`${firstName}: ${text}`);

      let chat = await Chat.findOne({
        participant: { $all: [userId, targetUserId] },
      });

      if (!chat) {
        console.log("No chat exists between these two users (from socket).");
        chat = new Chat({
          participant: [userId, targetUserId],
          message: [],
        });
      } else {
        console.log("Chat exists between these two users (from socket).");
        console.log("Existing chat:", chat);
      }

      chat.message.push({ senderId: userId, text });
      const savedChat = await chat.save();

      console.log("Saved chat (from socket):", savedChat);

      io.to(roomId).emit("messageRecived", {
        senderId: userId,
        firstName,
        lastName,
        text,
      });
    });

    socket.on("disconnect", () => {
      // Handle disconnect logic here if needed
    });
  });
};

module.exports = initilizeSocket;
