const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

/**
 * Load all YAML files from the modules directory
 * @returns {Object} Combined paths object from all modules
 */
const loadModules = () => {
  const modulesDir = path.join(__dirname, "modules");
  const modules = {};

  const files = fs.readdirSync(modulesDir).filter((file) => file.endsWith(".yaml"));

  files.forEach((file) => {
    const filePath = path.join(modulesDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = yaml.load(content);

    if (parsed && parsed.paths) {
      Object.assign(modules, parsed.paths);
    }
  });

  return modules;
};

/**
 * Load schemas from schemas.yaml
 * @returns {Object} Schemas object
 */
const loadSchemas = () => {
  const schemasPath = path.join(__dirname, "schemas.yaml");
  const content = fs.readFileSync(schemasPath, "utf8");
  const parsed = yaml.load(content);
  return parsed?.components?.schemas || {};
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Learning Progress Tracker API",
      version: "1.0.0",
      description: `
A full-featured REST API for tracking learning progress with videos and PDFs.

## Features
- **Items Management** - CRUD operations for learning items (videos/PDFs)
- **Collections** - Organize items into custom collections
- **Progress Tracking** - Track learning progress automatically
- **PDF Features** - Bookmarks, notes, page tracking, reading time
- **Analytics** - Activity heatmaps, streaks, learning patterns

## Authentication
Currently, this API does not require authentication. All endpoints are publicly accessible.

## Base URL
All endpoints are prefixed with \`/api\`
      `,
      contact: {
        name: "Learning Progress Tracker",
        url: "https://github.com/C-SHEKHAR-007/Learning-Progress-Tracker",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Items",
        description: "Learning items management (videos and PDFs)",
      },
      {
        name: "Collections",
        description: "Collection management for organizing items",
      },
      {
        name: "PDF",
        description: "PDF-specific features (bookmarks, notes, page tracking)",
      },
      {
        name: "Analytics",
        description: "Learning analytics and statistics",
      },
      {
        name: "Health",
        description: "API health check",
      },
    ],
    paths: loadModules(),
    components: {
      schemas: loadSchemas(),
    },
  },
  apis: [], // We're loading from YAML files, not from JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
