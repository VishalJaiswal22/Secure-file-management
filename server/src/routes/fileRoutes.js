const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");
const fileController = require("../controllers/fileController");

const router = express.Router();

router.use(protect);
router.get("/", fileController.listFiles);
router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/:id/download", fileController.idValidation, validateRequest, fileController.downloadFile);
router.delete("/:id", fileController.idValidation, validateRequest, fileController.deleteFile);
router.patch(
  "/:id/rename",
  [...fileController.idValidation, ...fileController.renameValidation],
  validateRequest,
  fileController.renameFile
);
router.post(
  "/:id/share",
  [...fileController.idValidation, ...fileController.shareValidation],
  validateRequest,
  fileController.shareFile
);

module.exports = router;
