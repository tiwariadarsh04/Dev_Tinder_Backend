const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect("mongodb+srv://tiwariadarsh0428:<p8teOuZ7FuCNe695>@cluster0.np1md.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
};

//process.env.MONGO_URL

module.exports = connectDB;


