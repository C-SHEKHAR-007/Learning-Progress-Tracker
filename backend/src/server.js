/**
 * Server Entry Point
 * Initializes database and starts the Express server
 */
require("dotenv").config();

const app = require("./app");
const config = require("./config");
const prisma = require("./core/database/prisma");
const logger = require("./core/utils/logger");

const PORT = config.port;

/**
 * Start the server
 */
const startServer = async () => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        logger.info("Database connected via Prisma");

        // Start HTTP server
        app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
            logger.info(`API Docs available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        logger.error("Failed to start server", { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", { reason: String(reason) });
    process.exit(1);
});

// Start the server
startServer();
