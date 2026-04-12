/**
 * Analytics Service
 * Business logic for analytics and progress tracking using Prisma
 */
const prisma = require("../../core/database/prisma");
const { DEFAULT_HEATMAP_DAYS, DEFAULT_COMPLETIONS_LIMIT, WEEKDAY_PATTERN_DAYS } = require("../../config/constants");

const analyticsService = {
  /**
   * Log a progress update to history
   */
  async logProgress(itemId, progress, timeSpent = 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return prisma.progressHistory.create({
      data: {
        itemId: parseInt(itemId),
        progress,
        timeSpent,
        sessionDate: today,
      },
    });
  },

  /**
   * Get activity data for heatmap (last N days)
   */
  async getActivityHeatmap(days = DEFAULT_HEATMAP_DAYS) {
    const result = await prisma.$queryRaw`
      SELECT 
        session_date as date,
        COUNT(*)::int as sessions,
        COALESCE(SUM(time_spent), 0)::int as total_time,
        COUNT(DISTINCT item_id)::int as items_worked
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - ${days}::int
      GROUP BY session_date
      ORDER BY session_date ASC
    `;
    return result;
  },

  /**
   * Get daily stats for a specific date range
   */
  async getDailyStats(days = 30) {
    const result = await prisma.$queryRaw`
      SELECT 
        session_date as date,
        COALESCE(SUM(time_spent), 0)::int as total_time,
        COUNT(*)::int as sessions,
        COUNT(DISTINCT item_id)::int as unique_items,
        MAX(progress)::int as max_progress_gained
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - ${days}::int
      GROUP BY session_date
      ORDER BY session_date DESC
    `;
    return result;
  },

  /**
   * Get current streak (consecutive days with activity)
   */
  async getStreak() {
    const result = await prisma.$queryRaw`
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
        COUNT(*)::int as streak_days,
        MIN(date) as streak_start,
        MAX(date) as streak_end
      FROM streak
      WHERE grp = (SELECT grp FROM streak WHERE date = CURRENT_DATE OR date = CURRENT_DATE - 1 LIMIT 1)
    `;

    const streak = result[0];
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
    const result = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(time_spent), 0)::int as total_time,
        COUNT(*)::int as total_sessions,
        COUNT(DISTINCT item_id)::int as items_worked,
        COUNT(DISTINCT session_date)::int as active_days,
        ROUND(AVG(time_spent)::numeric, 0)::int as avg_session_time
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - 7
    `;
    return result[0];
  },

  /**
   * Get monthly summary
   */
  async getMonthlySummary() {
    const result = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(time_spent), 0)::int as total_time,
        COUNT(*)::int as total_sessions,
        COUNT(DISTINCT item_id)::int as items_worked,
        COUNT(DISTINCT session_date)::int as active_days,
        ROUND(AVG(time_spent)::numeric, 0)::int as avg_session_time
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - 30
    `;
    return result[0];
  },

  /**
   * Get recent completions with completion date
   */
  async getRecentCompletions(limit = DEFAULT_COMPLETIONS_LIMIT) {
    const items = await prisma.learningItem.findMany({
      where: { isCompleted: true },
      select: {
        id: true,
        name: true,
        type: true,
        progress: true,
        isCompleted: true,
        updatedAt: true,
        collection: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      progress: item.progress,
      is_completed: item.isCompleted,
      completed_at: item.updatedAt,
      collection_name: item.collection?.name || null,
      collection_color: item.collection?.color || null,
    }));
  },

  /**
   * Get today's stats
   */
  async getTodayStats() {
    const result = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(time_spent), 0)::int as total_time,
        COUNT(*)::int as sessions,
        COUNT(DISTINCT item_id)::int as items_worked
      FROM progress_history
      WHERE session_date = CURRENT_DATE
    `;
    return result[0];
  },

  /**
   * Get progress by day of week (for pattern analysis)
   */
  async getWeekdayPattern() {
    const result = await prisma.$queryRaw`
      SELECT 
        EXTRACT(DOW FROM session_date)::int as day_of_week,
        TRIM(TO_CHAR(session_date, 'Day')) as day_name,
        COUNT(*)::int as sessions,
        COALESCE(SUM(time_spent), 0)::int as total_time,
        ROUND(AVG(time_spent)::numeric, 0)::int as avg_time
      FROM progress_history
      WHERE session_date >= CURRENT_DATE - ${WEEKDAY_PATTERN_DAYS}::int
      GROUP BY EXTRACT(DOW FROM session_date), TRIM(TO_CHAR(session_date, 'Day'))
      ORDER BY day_of_week
    `;
    return result;
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
      this.getActivityHeatmap(180),
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
