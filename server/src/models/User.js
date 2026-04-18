const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    twoFactorEnabled: { type: Boolean, default: true },
    storageUsed: { type: Number, default: 0 },
    storageLimit: { type: Number, default: 50 * 1024 * 1024 },
    lastLoginAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
