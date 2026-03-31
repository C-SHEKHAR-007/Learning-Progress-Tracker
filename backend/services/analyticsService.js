const pool = require("../db");

const analyticsService = {
  /**
   * Log a progress update to history
   */
  async logProgress(itemId, progress, timeSpent = 0) {
    const query = `
      INSERT INTO progress_history (item_id, progress, time_spent, session_date)
      VALUES ($1, $2, $3, CURRENT_DATE)
      RETURNING *
    `;
    const result = await pool.query(query, [itemId, progress, timeSpent]);
    return result.rows[0];
  },

  /**
   * Get activity data for heatmap (last N days)
   */
  async getActivityHeatmap(days = 365) {
    const query = `
      SELECT 
        session_date as date,
        COUNT(*) as sessions,
        SUM(time_spent) as total_time,
        COUNT(DISTINCT item_id) as items_worked
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY session_date
      ORDER BY session_date ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Get daily stats for a specific date range
   */
  async getDailyStats(startDate, endDate) {
    const query = `
      SELECT 
        session_date as date,
        SUM(time_spent) as total_time,
        COUNT(*) as sessions,
        COUNT(DISTINCT item_id) as unique_items,
        MAX(progress) as max_progress_gained
      FROM progress_history
      WHERE session_date BETWEEN $1 AND $2
      GROUP BY session_date
      ORDER BY session_date DESC
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  },

  /**
   * Get current streak (consecutive days with activity)
   */
  async getStreak() {
    const query = `
      WITH dates AS (
        SELECT DISTINCT session_date as date
        FROM progress_history
        ORDER BY session_date DESC
      ),
      streak AS (
        SELECT 
          date,
          date - (ROW_NUMBER() OVER (ORDER BY date DESC))::int AS grp
        FROM dates
      )
      SELECT 
        COUNT(*) as streak_days,
        MIN(date) as streak_start,
        MAX(date) as streak_end
      FROM streak
      WHERE grp = (SELECT grp FROM streak WHERE date = CURRENT_DATE OR date = CURRENT_DATE - 1 LIMIT 1)
    `;
    const result = await pool.query(query);

    // Check if streak is current (includes today or yesterday)
    const streak = result.rows[0];
    if (streak && streak.streak_end) {
      const endDate = new Date(streak.streak_end);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (endDate >= yesterday) {
        return {
          days: parseInt(streak.streak_days) || 0,
          start: streak.streak_start,
          end: streak.streak_end,
          isActive: endDate >= today,
        };
      }
    }

    return { days: 0, start: null, end: null, isActive: false };
  },

  /**
   * Get weekly summary
   */
  async getWeeklySummary() {
    const query = `
      SELECT 
        SUM(time_spent) as total_time,
        COUNT(*) as total_sessions,
        COUNT(DISTINCT item_id) as items_worked,
        COUNT(DISTINCT session_date) as active_days,
        ROUND(AVG(time_spent)::numeric, 0) as avg_session_time
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  /**
   * Get monthly summary
   */
  async getMonthlySummary() {
    const query = `
      SELECT 
        SUM(time_spent) as total_time,
        COUNT(*) as total_sessions,
        COUNT(DISTINCT item_id) as items_worked,
        COUNT(DISTINCT session_date) as active_days,
        ROUND(AVG(time_spent)::numeric, 0) as avg_session_time
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  /**
   * Get recent completions with completion date
   */
  async getRecentCompletions(limit = 10) {
    const query = `
      SELECT 
        li.id,
        li.name,
        li.type,
        li.progress,
        li.is_completed,
        li.updated_at as completed_at,
        c.name as collection_name,
        c.color as collection_color
      FROM learning_items li
      LEFT JOIN collections c ON li.collection_id = c.id
      WHERE li.is_completed = true
      ORDER BY li.updated_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  /**
   * Get today's stats
   */
  async getTodayStats() {
    const query = `
      SELECT 
        COALESCE(SUM(time_spent), 0) as total_time,
        COUNT(*) as sessions,
        COUNT(DISTINCT item_id) as items_worked
      FROM progress_history
      WHERE session_date = CURRENT_DATE
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  /**
   * Get progress by day of week (for pattern analysis)
   */
  async getWeekdayPattern() {
    const query = `
      SELECT 
        EXTRACT(DOW FROM session_date) as day_of_week,
        TO_CHAR(session_date, 'Day') as day_name,
        COUNT(*) as sessions,
        COALESCE(SUM(time_spent), 0) as total_time,
        ROUND(AVG(time_spent)::numeric, 0) as avg_time
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY EXTRACT(DOW FROM session_date), TO_CHAR(session_date, 'Day')
      ORDER BY day_of_week
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics() {
    const [
      heatmap,
      streak,
      todayStats,
      weeklySummary,
      monthlySummary,
      recentCompletions,
      weekdayPattern,
    ] = await Promise.all([
      this.getActivityHeatmap(180), // 6 months
      this.getStreak(),
      this.getTodayStats(),
      this.getWeeklySummary(),
      this.getMonthlySummary(),
      this.getRecentCompletions(5),
      this.getWeekdayPattern(),
    ]);

    return {
      heatmap,
      streak,
      today: todayStats,
      weekly: weeklySummary,
      monthly: monthlySummary,
      recentCompletions,
      weekdayPattern,
    };
  },
};

module.exports = analyticsService;
