const mongoose = require("mongoose");

async function connectDb() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/secure-file-manager";
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = connectDb;
