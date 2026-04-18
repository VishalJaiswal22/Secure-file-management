const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    access: { type: [String], enum: ["view", "edit", "share"], default: ["view"] }
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    encryptedPath: { type: String, required: true },
    iv: { type: String, required: true },
    sharedWith: [permissionSchema],
    isEncrypted: { type: Boolean, default: true },
    malwareScanStatus: { type: String, enum: ["clean", "flagged"], default: "clean" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
