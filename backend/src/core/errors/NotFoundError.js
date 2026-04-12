const AppError = require("./AppError");

/**
 * Not found error for missing resources
 */
class NotFoundError extends AppError {
    constructor(resource = "Resource", id = null) {
        const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
        super(message, 404, "NOT_FOUND");
        this.resource = resource;
    }
}

module.exports = NotFoundError;
