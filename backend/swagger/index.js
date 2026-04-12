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
## Overview
A powerful REST API for tracking your learning journey with videos and PDFs. Built with Node.js, Express, and PostgreSQL.

## Key Features

- **📚 Items Management** — Create, read, update, and delete learning items
- **📁 Collections** — Organize your content into custom collections
- **📊 Progress Tracking** — Automatic progress tracking for all content types
- **📖 PDF Features** — Bookmarks, notes, page tracking, and reading time analytics
- **📈 Analytics** — Activity heatmaps, learning streaks, and performance insights

## Quick Start

1. Use the **Items** endpoints to add your learning materials
2. Organize with **Collections** 
3. Track progress automatically as you learn
4. View insights via **Analytics** endpoints

## Response Format

All responses follow a consistent JSON format:
\`\`\`json
{
  "data": { ... },
  "message": "Success message"
}
\`\`\`

Error responses include:
\`\`\`json
{
  "error": "Error description"
}
\`\`\`
      `,
            contact: {
                name: "Learning Progress Tracker",
                url: "https://github.com/C-SHEKHAR-007/Learning-Progress-Tracker",
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
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
