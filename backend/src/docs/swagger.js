/**
 * Swagger API Documentation
 * Re-exports the swagger spec from the original location for backward compatibility
 * 
 * The actual YAML modules and schemas remain in backend/swagger/ 
 * This file provides the entry point from the new src/docs location
 */
const path = require("path");
const fs = require("fs");

// Load from the original swagger directory for now
// This maintains backward compatibility while the restructuring is in progress
const swaggerPath = path.join(__dirname, "..", "..", "swagger");

if (fs.existsSync(swaggerPath)) {
  module.exports = require(swaggerPath);
} else {
  // Fallback: create minimal spec if swagger folder doesn't exist
  const swaggerJsdoc = require("swagger-jsdoc");
  
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Learning Progress Tracker API",
        version: "1.0.0",
        description: "API for tracking learning progress with videos and PDFs",
      },
      servers: [
        {
          url: "http://localhost:5000/api",
          description: "Development server",
        },
      ],
    },
    apis: [],
  };
  
  module.exports = swaggerJsdoc(options);
}
