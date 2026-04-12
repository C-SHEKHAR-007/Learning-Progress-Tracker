/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const config = require("./config");
const { MAX_FILE_SIZE } = require("./config/constants");
const { errorHandler, notFoundHandler, requestLogger } = require("./core/middleware");
const logger = require("./core/utils/logger");

// Import module routes
const collectionRoutes = require("./modules/collections").routes;
const itemRoutes = require("./modules/items").routes;
const analyticsRoutes = require("./modules/analytics").routes;
const pdfRoutes = require("./modules/pdf").routes;
const healthRoutes = require("./modules/health").routes;

// Create Express app
const app = express();

// ===========================================
// MIDDLEWARE
// ===========================================

// Request logging (development)
if (config.env === "development") {
    app.use(requestLogger);
}

// CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_FILE_SIZE }));

// ===========================================
// SWAGGER DOCUMENTATION
// ===========================================

// Load Swagger spec dynamically (supports both old and new locations)
const loadSwaggerSpec = () => {
    try {
        // Try new location first
        const newSwaggerPath = path.join(__dirname, "docs", "swagger.js");
        if (fs.existsSync(newSwaggerPath)) {
            return require(newSwaggerPath);
        }

        // Fall back to old location
        const oldSwaggerPath = path.join(__dirname, "..", "swagger");
        if (fs.existsSync(oldSwaggerPath)) {
            return require(oldSwaggerPath);
        }

        logger.warn("Swagger spec not found, API docs will not be available");
        return null;
    } catch (error) {
        logger.error("Failed to load Swagger spec", { error: error.message });
        return null;
    }
};

const swaggerSpec = loadSwaggerSpec();

if (swaggerSpec) {
    // Load custom Swagger theme
    let swaggerThemeCss = "";
    const themePaths = [
        path.join(__dirname, "docs", "swagger-theme.css"),
        path.join(__dirname, "..", "swagger", "swagger-theme.css"),
    ];

    for (const themePath of themePaths) {
        if (fs.existsSync(themePath)) {
            swaggerThemeCss = fs.readFileSync(themePath, "utf8");
            break;
        }
    }

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customCss: swaggerThemeCss,
            customSiteTitle: "Learning Progress Tracker API",
            customfavIcon:
                "https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png",
            swaggerOptions: {
                docExpansion: "list",
                filter: true,
                showRequestDuration: true,
                tryItOutEnabled: true,
                persistAuthorization: true,
                displayRequestDuration: true,
            },
        }),
    );

    // Swagger JSON spec endpoint
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
}

// ===========================================
// API ROUTES
// ===========================================

// Health check (at root for easy access)
app.use("/health", healthRoutes);

// API routes - maintain backward compatibility with old routes
// Collections are now at /api/collections but also accessible via /api/items/collections
app.use("/api/collections", collectionRoutes);
app.use("/api/items/collections", collectionRoutes); // Backward compatibility

// Items
app.use("/api/items", itemRoutes);

// Analytics
app.use("/api/analytics", analyticsRoutes);

// PDF
app.use("/api/pdf", pdfRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
