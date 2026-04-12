/**
 * Health Routes
 * Health check and status endpoints
 */
const express = require("express");
const router = express.Router();
const prisma = require("../../core/database/prisma");

// GET /health - Basic health check
router.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Learning Progress Tracker API is running",
        timestamp: new Date().toISOString(),
    });
});

// GET /health/detailed - Detailed health check with database status
router.get("/detailed", async (req, res) => {
    let dbHealthy = false;
    let dbError = null;

    try {
        await prisma.$queryRaw`SELECT 1`;
        dbHealthy = true;
    } catch (error) {
        dbError = error.message;
    }

    const status = dbHealthy ? "healthy" : "degraded";

    res.status(dbHealthy ? 200 : 503).json({
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
            database: {
                status: dbHealthy ? "ok" : "error",
                error: dbError,
            },
            memory: {
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
            },
        },
    });
});

module.exports = router;
