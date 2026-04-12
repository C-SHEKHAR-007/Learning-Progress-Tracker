/**
 * Error classes index
 * Export all error types for easy imports
 */
const AppError = require("./AppError");
const ValidationError = require("./ValidationError");
const NotFoundError = require("./NotFoundError");
const DatabaseError = require("./DatabaseError");
const ConflictError = require("./ConflictError");

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  ConflictError,
};
