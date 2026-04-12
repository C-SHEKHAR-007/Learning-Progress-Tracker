/**
 * Middleware index
 * Export all middleware for easy imports
 */
const asyncHandler = require("./asyncHandler");
const { errorHandler, notFoundHandler } = require("./errorHandler");
const { validate, validateBody, validateQuery, validateParams } = require("./validateRequest");
const requestLogger = require("./requestLogger");

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler,
  validate,
  validateBody,
  validateQuery,
  validateParams,
  requestLogger,
};
