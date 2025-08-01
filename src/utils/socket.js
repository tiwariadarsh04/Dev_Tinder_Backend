const socket = require("socket.io"); // it help us to make bi-directional and real time communication
const Chat = require("../models/chat");

// This means the Socket.io server will use the same HTTP server to handle WebSocket connections.
const initilizeSocket = (server) => {
  const io = socket(server, {
   cors: {
  origin: [
    "https://dev-tinder-web-eight.vercel.app",
    "https://devtinder-web-ncza.onrender.com",
  ],

  // http://localhost:3000

  // In simple terms, this line waits for a new client to connect, and when a connection happens, it executes the provided function, allowing you to define what should happen for that specific client (e.g., joining a chat room, sending or receiving messages).
  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("$");
      // console.log(`${firstName} created this room : ${roomId}`);
      socket.join(roomId);
      // The socket.join(roomId) line makes the client join the specific room identified by roomId. This allows the server to send messages to all clients in the same room, which is useful for private chats.
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        const roomId = [userId, targetUserId].sort().join("$");
        console.log(firstName + ": " + text);

        let chat = await Chat.findOne({
          participant: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          console.log(
            "No chat exit in Between this two user.......from socket"
          );
          chat = new Chat({
            participant: [userId, targetUserId],
            message: [],
          });
        } else {
          console.log("chat exit in Between this two user.......from socket");
          console.log("chat is......from socket :", chat);
        }

        chat.message.push({
          senderId: userId,
          text,
        });

        const savedChat = await chat.save();
        console.log("Saved chat is...from socket :", savedChat);
        io.to(roomId).emit("messageRecived", {
          senderId: userId,
          firstName,
          lastName,
          text,
        });
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initilizeSocket;
