function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
    errors: error.errors || null
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
