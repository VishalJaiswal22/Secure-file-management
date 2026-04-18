const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["auth", "file", "share", "system"], default: "system" },
    targetId: mongoose.Schema.Types.ObjectId,
    details: { type: String, default: "" },
    ipAddress: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
