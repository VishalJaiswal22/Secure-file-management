const express = require("express");
const validateRequest = require("../middleware/validationMiddleware");
const { protect } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.registerValidation, validateRequest, authController.register);
router.post("/login", authController.loginValidation, validateRequest, authController.login);
router.post("/verify-otp", authController.otpValidation, validateRequest, authController.verifyOtp);
router.get("/me", protect, authController.getProfile);
router.post("/logout", protect, authController.logout);

module.exports = router;
