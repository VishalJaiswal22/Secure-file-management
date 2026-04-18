const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    const error = new Error("Authentication token missing");
    error.statusCode = 401;
    throw error;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "super-secret-jwt-key");
  const session = await Session.findOne({ tokenId: decoded.tokenId, status: "active" });
  if (!session) {
    const error = new Error("Session expired or revoked");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  req.session = session;
  next();
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
}

module.exports = { protect, authorize };
