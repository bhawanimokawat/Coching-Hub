
const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || "Internal server error";

  if (err.code === 11000) {
    statusCode = 409;
    message = "An account with this email already exists.";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed.";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  console.error(err.message);

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? statusCode >= 500
          ? "Internal server error"
          : message
        : message,
  });
};

module.exports = errorMiddleware;
