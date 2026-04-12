/**
 * Centralized error handling middleware
 * Processes all errors and returns consistent JSON responses
 */
const { AppError, DatabaseError } = require("../errors");
const logger = require("../utils/logger");

/**
 * Error handler middleware
 * Should be registered last in the middleware chain
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error("Request error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    code: err.code,
  });

  // Handle known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle PostgreSQL errors
  if (err.code && err.code.match(/^[0-9A-Z]{5}$/)) {
    const dbError = new DatabaseError("Database operation failed", err);
    return res.status(dbError.statusCode).json(dbError.toJSON());
  }

  // Handle JSON parsing errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        message: "Invalid JSON in request body",
        code: "INVALID_JSON",
      },
    });
  }

  // Handle unknown errors (programming errors, etc.)
  const isDev = process.env.NODE_ENV === "development";

  res.status(500).json({
    error: {
      message: isDev ? err.message : "Internal server error",
      code: "INTERNAL_ERROR",
      ...(isDev && { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found handler
 * Should be registered after all routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "ROUTE_NOT_FOUND",
    },
  });
};

module.exports = { errorHandler, notFoundHandler };
