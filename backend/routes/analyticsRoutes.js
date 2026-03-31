const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// GET /api/analytics/dashboard - Combined dashboard data
router.get("/dashboard", analyticsController.getDashboard);

// GET /api/analytics/heatmap - Activity heatmap (last N days)
router.get("/heatmap", analyticsController.getHeatmap);

// GET /api/analytics/streak - Current learning streak
router.get("/streak", analyticsController.getStreak);

// GET /api/analytics/today - Today's stats
router.get("/today", analyticsController.getTodayStats);

// GET /api/analytics/daily - Daily stats for date range
router.get("/daily", analyticsController.getDailyStats);

// GET /api/analytics/weekly - Weekly summary
router.get("/weekly", analyticsController.getWeeklySummary);

// GET /api/analytics/monthly - Monthly summary
router.get("/monthly", analyticsController.getMonthlySummary);

// GET /api/analytics/completions - Recent completions
router.get("/completions", analyticsController.getRecentCompletions);

// GET /api/analytics/weekday-pattern - Learning pattern by day of week
router.get("/weekday-pattern", analyticsController.getWeekdayPattern);

// POST /api/analytics/log - Manually log progress
router.post("/log", analyticsController.logProgress);

module.exports = router;
