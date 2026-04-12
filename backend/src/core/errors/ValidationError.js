const AppError = require("./AppError");

/**
 * Validation error for invalid request data
 */
class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, "VALIDATION_ERROR");
        this.details = details;
    }

    toJSON() {
        const json = super.toJSON();
        if (this.details) {
            json.error.details = this.details;
        }
        return json;
    }
}

module.exports = ValidationError;
