require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http=require("http");

app.use(express.json({
  limit:"20mb"
}));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "", 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and credentials
  })
);


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter=require("./routes/payment");
const chatRouter=require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/",paymentRouter);
app.use("/",chatRouter);

const server=http.createServer(app);
const initilizeSocket=require('./utils/socket');
initilizeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(process.env.PORT, () => {
      console.log("Server is successfully listening on port... ",process.env.PORT);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
    console.log("Error in Database connections");
  });


// 1.Hoisting ✅
// 2.Cloudinary ✅
// 3.Edit profie all Bug fix
// 4.SignUp Login Bug Fixed
// 5.SignUp by google