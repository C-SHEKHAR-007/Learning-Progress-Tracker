/**
 * Base application error class
 * All custom errors should extend this
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Distinguishes operational errors from programming errors

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            error: {
                message: this.message,
                code: this.code,
                ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
            },
        };
    }
}

module.exports = AppError;
