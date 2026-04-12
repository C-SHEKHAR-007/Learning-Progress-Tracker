const AppError = require("./AppError");

/**
 * Database error for database-related failures
 */
class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, "DATABASE_ERROR");
    this.originalError = originalError;

    // Handle PostgreSQL specific error codes
    if (originalError?.code) {
      this.pgCode = originalError.code;

      // Map common PG error codes to user-friendly messages
      switch (originalError.code) {
        case "23505": // unique_violation
          this.statusCode = 409;
          this.code = "DUPLICATE_ENTRY";
          this.message = "Resource already exists";
          break;
        case "23503": // foreign_key_violation
          this.statusCode = 400;
          this.code = "INVALID_REFERENCE";
          this.message = "Referenced resource does not exist";
          break;
        case "23502": // not_null_violation
          this.statusCode = 400;
          this.code = "MISSING_REQUIRED_FIELD";
          break;
        case "22P02": // invalid_text_representation
          this.statusCode = 400;
          this.code = "INVALID_INPUT";
          this.message = "Invalid input format";
          break;
      }
    }
  }
}

module.exports = DatabaseError;
