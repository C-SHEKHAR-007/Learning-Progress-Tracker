require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const itemRoutes = require("./routes/itemRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const { createTables } = require("./db/schema");

const app = express();
const PORT = process.env.PORT || 5000;

// Load custom Swagger theme
const swaggerThemeCss = fs.readFileSync(
  path.join(__dirname, "swagger", "swagger-theme.css"),
  "utf8",
);

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Swagger API Documentation with custom theme
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: swaggerThemeCss,
    customSiteTitle: "Learning Progress Tracker API",
    customfavIcon: "https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png",
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

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/pdf", pdfRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Learning Progress Tracker API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database tables
    await createTables();
    console.log("✅ Database initialized");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
