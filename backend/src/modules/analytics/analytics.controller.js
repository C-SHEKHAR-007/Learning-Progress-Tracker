/**
 * Analytics Controller
 * HTTP request handlers for analytics endpoints
 */
const analyticsService = require("./analytics.service");
const { asyncHandler } = require("../../core/middleware");
const { DEFAULT_HEATMAP_DAYS, DEFAULT_DAILY_STATS_DAYS, DEFAULT_COMPLETIONS_LIMIT } = require("../../config/constants");

const analyticsController = {
  /**
   * GET /analytics/dashboard - Combined dashboard data
   */
  getDashboard: asyncHandler(async (req, res) => {
    const dashboard = await analyticsService.getDashboardAnalytics();
    res.json(dashboard);
  }),

  /**
   * GET /analytics/heatmap - Activity heatmap data
   */
  getHeatmap: asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || DEFAULT_HEATMAP_DAYS;
    const heatmap = await analyticsService.getActivityHeatmap(days);
    res.json(heatmap);
  }),

  /**
   * GET /analytics/streak - Current learning streak
   */
  getStreak: asyncHandler(async (req, res) => {
    const streak = await analyticsService.getStreak();
    res.json(streak);
  }),

  /**
   * GET /analytics/today - Today's stats
   */
  getTodayStats: asyncHandler(async (req, res) => {
    const stats = await analyticsService.getTodayStats();
    res.json(stats);
  }),

  /**
   * GET /analytics/daily - Daily stats for date range
   */
  getDailyStats: asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || DEFAULT_DAILY_STATS_DAYS;
    const stats = await analyticsService.getDailyStats(days);
    res.json(stats);
  }),

  /**
   * GET /analytics/weekly - Weekly summary
   */
  getWeeklySummary: asyncHandler(async (req, res) => {
    const summary = await analyticsService.getWeeklySummary();
    res.json(summary);
  }),

  /**
   * GET /analytics/monthly - Monthly summary
   */
  getMonthlySummary: asyncHandler(async (req, res) => {
    const summary = await analyticsService.getMonthlySummary();
    res.json(summary);
  }),

  /**
   * GET /analytics/completions - Recent completions
   */
  getRecentCompletions: asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || DEFAULT_COMPLETIONS_LIMIT;
    const completions = await analyticsService.getRecentCompletions(limit);
    res.json(completions);
  }),

  /**
   * GET /analytics/weekday-pattern - Learning pattern by day of week
   */
  getWeekdayPattern: asyncHandler(async (req, res) => {
    const pattern = await analyticsService.getWeekdayPattern();
    res.json(pattern);
  }),

  /**
   * POST /analytics/log - Manually log progress
   */
  logProgress: asyncHandler(async (req, res) => {
    const { itemId, progress, timeSpent } = req.body;
    const entry = await analyticsService.logProgress(itemId, progress || 0, timeSpent || 0);
    res.status(201).json(entry);
  }),
};

module.exports = analyticsController;
