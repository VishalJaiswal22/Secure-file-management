const { validationResult } = require("express-validator");

module.exports = function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = errors.array();
    return next(error);
  }
  next();
};
