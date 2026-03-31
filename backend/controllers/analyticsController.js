const analyticsService = require("../services/analyticsService");

const analyticsController = {
  // Get activity heatmap data
  async getHeatmap(req, res) {
    try {
      const days = parseInt(req.query.days) || 365;
      const heatmap = await analyticsService.getActivityHeatmap(days);
      res.json(heatmap);
    } catch (error) {
      console.error("Error fetching heatmap:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get current streak
  async getStreak(req, res) {
    try {
      const streak = await analyticsService.getStreak();
      res.json(streak);
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get today's stats
  async getTodayStats(req, res) {
    try {
      const stats = await analyticsService.getTodayStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today stats:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get daily stats for a date range
  async getDailyStats(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const stats = await analyticsService.getDailyStats(days);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get weekly summary
  async getWeeklySummary(req, res) {
    try {
      const summary = await analyticsService.getWeeklySummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get monthly summary
  async getMonthlySummary(req, res) {
    try {
      const summary = await analyticsService.getMonthlySummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get recent completions
  async getRecentCompletions(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const completions = await analyticsService.getRecentCompletions(limit);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching recent completions:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get weekday learning pattern
  async getWeekdayPattern(req, res) {
    try {
      const pattern = await analyticsService.getWeekdayPattern();
      res.json(pattern);
    } catch (error) {
      console.error("Error fetching weekday pattern:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get combined dashboard analytics
  async getDashboard(req, res) {
    try {
      const dashboard = await analyticsService.getDashboardAnalytics();
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Log progress (manual endpoint, usually called internally)
  async logProgress(req, res) {
    try {
      const { itemId, progress, timeSpent } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "itemId is required" });
      }
      const entry = await analyticsService.logProgress(itemId, progress || 0, timeSpent || 0);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error logging progress:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = analyticsController;
