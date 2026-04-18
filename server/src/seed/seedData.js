const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const connectDb = require("../config/db");
const User = require("../models/User");
const File = require("../models/File");
const ActivityLog = require("../models/ActivityLog");
const Session = require("../models/Session");
const { encryptBuffer } = require("../utils/security");

require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

async function seed() {
  await connectDb();

  await Promise.all([User.deleteMany({}), File.deleteMany({}), ActivityLog.deleteMany({}), Session.deleteMany({})]);

  const uploadsDir = path.join(__dirname, "..", "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const [admin, user] = await User.create([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: "admin",
      storageUsed: 1024 * 1024 * 6
    },
    {
      name: "Regular User",
      email: "user@example.com",
      password: await bcrypt.hash("User@123", 10),
      role: "user",
      storageUsed: 1024 * 1024 * 2
    }
  ]);

  const sampleBuffer = Buffer.from("Secure project plan for Q2");
  const encrypted = encryptBuffer(sampleBuffer);
  const samplePath = path.join(uploadsDir, "sample-plan.bin");
  fs.writeFileSync(samplePath, encrypted.encrypted);

  const file = await File.create({
    owner: admin._id,
    originalName: "Project-Plan.pdf",
    fileName: "Project-Plan.pdf",
    mimeType: "application/pdf",
    fileSize: sampleBuffer.length,
    encryptedPath: samplePath,
    iv: encrypted.iv,
    sharedWith: [{ user: user._id, access: ["view", "share"] }]
  });

  await ActivityLog.create([
    {
      user: admin._id,
      action: "Seeded admin account",
      targetType: "system",
      details: "Sample administrator created"
    },
    {
      user: user._id,
      action: "Shared file received",
      targetType: "share",
      targetId: file._id,
      details: "Admin shared Project-Plan.pdf"
    }
  ]);

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
