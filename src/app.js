require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

// Middleware Setup
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());

// CORS setup
const allowedOrigins = ["http://localhost:3000", ""]; // Add valid origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes setup
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// Create server and initialize Socket
const server = http.createServer(app);
const initializeSocket = require("./utils/socket");
initializeSocket(server);

// Connect to Database
connectDB()
  .then(() => {
    console.log("Database connection established...");

    // Start the server after DB is connected
    server.listen(process.env.PORT, () => {
      console.log(`Server is successfully listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
    console.log("Error in Database connections");
  });
