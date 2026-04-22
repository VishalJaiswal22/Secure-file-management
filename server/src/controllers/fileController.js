const fs = require("fs");
const path = require("path");
const { body, param } = require("express-validator");
const File = require("../models/File");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { logActivity } = require("../services/activityService");
const { canSendEmail, sendSharedFileEmail } = require("../services/mailService");
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
      entry.user &&
      String(entry.user) === String(userId) &&
      (entry.access.includes(requiredPermission) || entry.access.includes("share"))
  );
}

function canAccessFileByIdentity(file, user, requiredPermission = "view") {
  if (String(file.owner) === String(user._id)) return true;
  return file.sharedWith.some((entry) => {
    const matchesUser = entry.user && String(entry.user) === String(user._id);
    const matchesEmail = entry.email && entry.email === user.email;
    return (matchesUser || matchesEmail) &&
      (entry.access.includes(requiredPermission) || entry.access.includes("share"));
  });
}

function getAttachmentLimitBytes() {
  return Number(process.env.EMAIL_ATTACHMENT_LIMIT_MB || 20) * 1024 * 1024;
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
  const sharedFiles = await File.find({
    $or: [{ "sharedWith.user": req.user._id }, { "sharedWith.email": req.user.email }]
  })
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res.json({ myFiles, sharedFiles });
});

exports.downloadFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file || !canAccessFileByIdentity(file, req.user, "view")) {
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
  if (!file || !canAccessFileByIdentity(file, req.user, "edit")) {
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
  if (!file || !canAccessFileByIdentity(file, req.user, "share")) {
    const error = new Error("File not found or share permission required");
    error.statusCode = 404;
    throw error;
  }

  const shareEmail = req.body.email.toLowerCase();
  const targetUser = await User.findOne({ email: shareEmail });

  const existing = file.sharedWith.find(
    (entry) => entry.email === shareEmail || (targetUser && entry.user && String(entry.user) === String(targetUser._id))
  );
  if (existing) {
    existing.access = req.body.access;
    existing.email = shareEmail;
    if (targetUser) {
      existing.user = targetUser._id;
    }
  } else {
    file.sharedWith.push({
      user: targetUser?._id,
      email: shareEmail,
      access: req.body.access
    });
  }

  await file.save();

  let emailStatus = {
    sent: false,
    reason: "smtp_not_configured"
  };

  if (canSendEmail()) {
    if (file.fileSize > getAttachmentLimitBytes()) {
      emailStatus = {
        sent: false,
        reason: "attachment_too_large"
      };
    } else {
      const encryptedBuffer = fs.readFileSync(file.encryptedPath);
      const decrypted = decryptBuffer(encryptedBuffer, file.iv);
      emailStatus = await sendSharedFileEmail({
        to: shareEmail,
        senderName: req.user.name,
        fileName: file.fileName,
        fileBuffer: decrypted,
        mimeType: file.mimeType
      });
    }
  }

  await logActivity({
    userId: req.user._id,
    action: "File shared",
    targetType: "share",
    targetId: file._id,
    details: `${file.fileName} shared with ${shareEmail}${emailStatus.sent ? " and emailed as attachment" : ""}`,
    ipAddress: req.ip
  });

  let message = "File shared successfully.";
  if (emailStatus.sent) {
    message = "File shared successfully and emailed as an attachment.";
  } else if (emailStatus.reason === "attachment_too_large") {
    message = `File shared in the app, but not emailed because it is larger than ${process.env.EMAIL_ATTACHMENT_LIMIT_MB || 20} MB.`;
  } else if (emailStatus.reason === "email_send_failed") {
    message = "File shared in the app, but sending the email attachment failed. Check SMTP settings and the server terminal.";
  } else if (!targetUser) {
    message = "File shared successfully. The recipient can also see it in the app after signing up with that email.";
  }

  res.json({
    message,
    emailStatus,
    file
  });
});
