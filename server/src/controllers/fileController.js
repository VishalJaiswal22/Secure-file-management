const fs = require("fs");
const path = require("path");
const { body, param } = require("express-validator");
const File = require("../models/File");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { logActivity } = require("../services/activityService");
const { safeMimeTypes, encryptBuffer, decryptBuffer, simulateMalwareDetection } = require("../utils/security");

exports.renameValidation = [body("fileName").trim().isLength({ min: 1, max: 120 })];
exports.shareValidation = [
  body("email").isEmail(),
  body("access").isArray({ min: 1 }),
  body("access.*").isIn(["view", "edit", "share"])
];
exports.idValidation = [param("id").isMongoId()];

function canAccessFile(file, userId, requiredPermission = "view") {
  if (String(file.owner) === String(userId)) return true;
  // Shared file access is resolved per file so we can support different permissions for each recipient.
  return file.sharedWith.some(
    (entry) =>
      String(entry.user) === String(userId) &&
      (entry.access.includes(requiredPermission) || entry.access.includes("share"))
  );
}

exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("File is required");
    error.statusCode = 400;
    throw error;
  }
  if (!safeMimeTypes.includes(req.file.mimetype)) {
    const error = new Error("Unsafe or unsupported file type");
    error.statusCode = 400;
    throw error;
  }

  const scanStatus = simulateMalwareDetection(req.file.originalname, req.file.buffer);
  if (scanStatus === "flagged") {
    const error = new Error("File blocked by malware detection");
    error.statusCode = 400;
    throw error;
  }

  const { encrypted, iv } = encryptBuffer(req.file.buffer);
  const storageName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.bin`;
  const uploadPath = path.join(__dirname, "..", "..", "uploads", storageName);
  fs.writeFileSync(uploadPath, encrypted);

  const file = await File.create({
    owner: req.user._id,
    originalName: req.file.originalname,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    encryptedPath: uploadPath,
    iv,
    malwareScanStatus: scanStatus
  });

  req.user.storageUsed += req.file.size;
  await req.user.save();

  await logActivity({
    userId: req.user._id,
    action: "File uploaded",
    targetType: "file",
    targetId: file._id,
    details: `${req.file.originalname} uploaded and encrypted`,
    ipAddress: req.ip
  });

  res.status(201).json({ message: "File uploaded successfully", file });
});

exports.listFiles = asyncHandler(async (req, res) => {
  const myFiles = await File.find({ owner: req.user._id }).sort({ createdAt: -1 });
  const sharedFiles = await File.find({ "sharedWith.user": req.user._id })
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res.json({ myFiles, sharedFiles });
});

exports.downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file || !canAccessFile(file, req.user._id, "view")) {
    const error = new Error("File not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const encryptedBuffer = fs.readFileSync(file.encryptedPath);
  const decrypted = decryptBuffer(encryptedBuffer, file.iv);

  await logActivity({
    userId: req.user._id,
    action: "File downloaded",
    targetType: "file",
    targetId: file._id,
    details: `${file.fileName} decrypted for download`,
    ipAddress: req.ip
  });

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`);
  res.send(decrypted);
});

exports.deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file || String(file.owner) !== String(req.user._id)) {
    const error = new Error("File not found or owner access required");
    error.statusCode = 404;
    throw error;
  }

  if (fs.existsSync(file.encryptedPath)) {
    fs.unlinkSync(file.encryptedPath);
  }

  req.user.storageUsed = Math.max(0, req.user.storageUsed - file.fileSize);
  await req.user.save();
  await File.findByIdAndDelete(file._id);

  await logActivity({
    userId: req.user._id,
    action: "File deleted",
    targetType: "file",
    targetId: file._id,
    details: `${file.fileName} removed from storage`,
    ipAddress: req.ip
  });

  res.json({ message: "File deleted successfully" });
});

exports.renameFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file || !canAccessFile(file, req.user._id, "edit")) {
    const error = new Error("File not found or edit permission required");
    error.statusCode = 404;
    throw error;
  }

  file.fileName = req.body.fileName;
  await file.save();

  await logActivity({
    userId: req.user._id,
    action: "File renamed",
    targetType: "file",
    targetId: file._id,
    details: `Renamed to ${req.body.fileName}`,
    ipAddress: req.ip
  });

  res.json({ message: "File renamed", file });
});

exports.shareFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file || !canAccessFile(file, req.user._id, "share")) {
    const error = new Error("File not found or share permission required");
    error.statusCode = 404;
    throw error;
  }

  const targetUser = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!targetUser) {
    const error = new Error("Target user not found");
    error.statusCode = 404;
    throw error;
  }

  const existing = file.sharedWith.find((entry) => String(entry.user) === String(targetUser._id));
  if (existing) {
    existing.access = req.body.access;
  } else {
    file.sharedWith.push({ user: targetUser._id, access: req.body.access });
  }

  await file.save();
  await logActivity({
    userId: req.user._id,
    action: "File shared",
    targetType: "share",
    targetId: file._id,
    details: `${file.fileName} shared with ${targetUser.email}`,
    ipAddress: req.ip
  });

  res.json({ message: "File shared successfully", file });
});
