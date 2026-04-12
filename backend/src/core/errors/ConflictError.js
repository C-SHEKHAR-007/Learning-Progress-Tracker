const AppError = require("./AppError");

/**
 * Conflict error for resource conflicts (e.g., duplicate entries)
 */
class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409, "CONFLICT");
    }
}

module.exports = ConflictError;
