/**
 * Request logging middleware
 * Logs incoming requests with timing information
 */
const logger = require("../utils/logger");

/**
 * Request logger middleware
 * Logs request details and response time
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request
    logger.info(`→ ${req.method} ${req.path}`, {
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
    });

    // Log response on finish
    res.on("finish", () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? "warn" : "info";

        logger[level](`← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });

    next();
};

module.exports = requestLogger;
