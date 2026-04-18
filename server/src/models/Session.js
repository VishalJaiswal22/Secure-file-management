const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenId: { type: String, required: true, unique: true },
    userAgent: String,
    ipAddress: String,
    status: { type: String, enum: ["pending_2fa", "active", "revoked"], default: "pending_2fa" },
    otpCode: String,
    expiresAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
