const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Session = require("../models/Session");
const asyncHandler = require("../utils/asyncHandler");
const { logActivity } = require("../services/activityService");

const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 80 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }).matches(/[A-Z]/).matches(/[a-z]/).matches(/[0-9]/)
];

const loginValidation = [
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 })
];

const otpValidation = [
  body("sessionId").isString().isLength({ min: 10 }),
  body("otp").isString().isLength({ min: 6, max: 6 })
];

function signToken(userId, tokenId) {
  return jwt.sign(
    { userId, tokenId },
    process.env.JWT_SECRET || "super-secret-jwt-key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

exports.registerValidation = registerValidation;
exports.loginValidation = loginValidation;
exports.otpValidation = otpValidation;

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10)
  });

  await logActivity({
    userId: user._id,
    action: "User registered",
    targetType: "auth",
    details: `${user.email} created an account`,
    ipAddress: req.ip
  });

  res.status(201).json({
    message: "Registration successful",
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const session = await Session.create({
    user: user._id,
    tokenId: uuidv4(),
    userAgent: req.headers["user-agent"] || "unknown",
    ipAddress: req.ip,
    status: user.twoFactorEnabled ? "pending_2fa" : "active",
    otpCode: process.env.DEMO_OTP || "123456",
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
  });

  await logActivity({
    userId: user._id,
    action: "User login attempt",
    targetType: "auth",
    details: user.twoFactorEnabled ? "OTP verification required" : "Login successful",
    ipAddress: req.ip
  });

  if (user.twoFactorEnabled) {
    return res.json({
      message: "OTP required",
      requiresTwoFactor: true,
      sessionId: session._id,
      demoOtp: process.env.DEMO_OTP || "123456"
    });
  }

  const token = signToken(user._id, session.tokenId);
  user.lastLoginAt = new Date();
  await user.save();

  return res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { sessionId, otp } = req.body;
  const session = await Session.findById(sessionId).populate("user");
  if (!session || session.status !== "pending_2fa") {
    const error = new Error("Invalid session");
    error.statusCode = 401;
    throw error;
  }
  if (session.otpCode !== otp) {
    const error = new Error("Invalid OTP");
    error.statusCode = 401;
    throw error;
  }

  session.status = "active";
  await session.save();
  session.user.lastLoginAt = new Date();
  await session.user.save();

  await logActivity({
    userId: session.user._id,
    action: "2FA verified",
    targetType: "auth",
    details: "Two-factor authentication completed",
    ipAddress: req.ip
  });

  res.json({
    message: "OTP verified",
    token: signToken(session.user._id, session.tokenId),
    user: {
      id: session.user._id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      twoFactorEnabled: session.user.twoFactorEnabled
    }
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

exports.logout = asyncHandler(async (req, res) => {
  req.session.status = "revoked";
  await req.session.save();
  await logActivity({
    userId: req.user._id,
    action: "Logout",
    targetType: "auth",
    details: "Session revoked",
    ipAddress: req.ip
  });
  res.json({ message: "Logged out successfully" });
});
