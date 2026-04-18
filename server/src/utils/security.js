const crypto = require("crypto");

const safeMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4"
];

function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET || "12345678901234567890123456789012";
  return Buffer.from(secret.slice(0, 32).padEnd(32, "0"));
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKey(), iv);
  // The IV is stored alongside file metadata so the encrypted payload can be decrypted on download.
  return {
    iv: iv.toString("hex"),
    encrypted: Buffer.concat([cipher.update(buffer), cipher.final()])
  };
}

function decryptBuffer(buffer, ivHex) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );
  return Buffer.concat([decipher.update(buffer), decipher.final()]);
}

function simulateMalwareDetection(originalName, buffer) {
  const lower = originalName.toLowerCase();
  if ([".exe", ".bat", ".cmd", ".js"].some((ext) => lower.endsWith(ext))) {
    return "flagged";
  }
  const sample = buffer.toString("utf8", 0, Math.min(buffer.length, 200)).toLowerCase();
  return sample.includes("<script") ? "flagged" : "clean";
}

module.exports = {
  safeMimeTypes,
  encryptBuffer,
  decryptBuffer,
  simulateMalwareDetection
};
