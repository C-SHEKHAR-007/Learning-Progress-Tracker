/**
 * Analytics Routes
 * API endpoints for analytics and progress tracking
 */
const express = require("express");
const router = express.Router();
const controller = require("./analytics.controller");
const { validateBody } = require("../../core/middleware");
const { logProgressSchema } = require("./analytics.validation");

// GET /api/analytics/dashboard - Combined dashboard data
router.get("/dashboard", controller.getDashboard);

// GET /api/analytics/heatmap - Activity heatmap (last N days)
router.get("/heatmap", controller.getHeatmap);

// GET /api/analytics/streak - Current learning streak
router.get("/streak", controller.getStreak);

// GET /api/analytics/today - Today's stats
router.get("/today", controller.getTodayStats);

// GET /api/analytics/daily - Daily stats for date range
router.get("/daily", controller.getDailyStats);

// GET /api/analytics/weekly - Weekly summary
router.get("/weekly", controller.getWeeklySummary);

// GET /api/analytics/monthly - Monthly summary
router.get("/monthly", controller.getMonthlySummary);

// GET /api/analytics/completions - Recent completions
router.get("/completions", controller.getRecentCompletions);

// GET /api/analytics/weekday-pattern - Learning pattern by day of week
router.get("/weekday-pattern", controller.getWeekdayPattern);

// POST /api/analytics/log - Manually log progress
router.post("/log", validateBody(logProgressSchema), controller.logProgress);

module.exports = router;
