const multer = require("multer");

const storage = multer.memoryStorage();
const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 10);

module.exports = multer({
  storage,
  limits: { fileSize: maxFileSizeMb * 1024 * 1024 }
});
