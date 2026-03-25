import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle,
  Target,
  BarChart3,
  Award
} from 'lucide-react';
import { analyticsApi } from '../../services/api';
import './styles.css';

const ProgressMap = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [dashboard, heatmap] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getHeatmap(365)
        ]);
        setAnalytics(dashboard);
        setHeatmapData(heatmap);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || seconds < 60) return '< 1 min';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const getHeatmapColor = (count) => {
    if (!count || count === 0) return 'var(--heatmap-0)';
    if (count <= 2) return 'var(--heatmap-1)';
    if (count <= 5) return 'var(--heatmap-2)';
    if (count <= 10) return 'var(--heatmap-3)';
    return 'var(--heatmap-4)';
  };

  // Generate heatmap grid (last 365 days)
  const generateHeatmapGrid = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    
    // Adjust to start from Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const weeks = [];
    let currentDate = new Date(startDate);

    // Create a map for quick lookup
    const activityMap = {};
    heatmapData.forEach(item => {
      activityMap[item.session_date] = parseInt(item.session_count);
    });

    while (currentDate <= today || weeks.length < 53) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = activityMap[dateStr] || 0;
        const isToday = currentDate.toDateString() === today.toDateString();
        const isFuture = currentDate > today;
        
        week.push({
          date: new Date(currentDate),
          dateStr,
          count,
          isToday,
          isFuture
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
      if (weeks.length >= 53) break;
    }

    return weeks;
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) {
    return (
      <div className="progress-map">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const heatmapWeeks = generateHeatmapGrid();
  const { streak, today, weekly, recentCompletions, weekdayPattern } = analytics || {};

  return (
    <div className="progress-map">
      <div className="progress-map-header">
        <h1>Progress Map</h1>
        <p>Track your learning journey over time</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <motion.div 
          className="stat-card streak-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
            <Flame size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{streak?.current_streak || 0}</span>
            <span className="stat-label">Day Streak</span>
            {streak?.longest_streak > 0 && (
              <span className="stat-sub">Best: {streak.longest_streak} days</span>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatTime(today?.total_time_spent || 0)}</span>
            <span className="stat-label">Today</span>
            <span className="stat-sub">{today?.sessions || 0} sessions</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatTime(weekly?.avg_daily_time || 0)}</span>
            <span className="stat-label">Daily Average</span>
            <span className="stat-sub">This week</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{weekly?.total_sessions || 0}</span>
            <span className="stat-label">This Week</span>
            <span className="stat-sub">{formatTime(weekly?.total_time || 0)} total</span>
          </div>
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <motion.div 
        className="heatmap-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="section-header">
          <h2><Calendar size={20} /> Activity Heatmap</h2>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-squares">
              <div className="legend-square" style={{ background: 'var(--heatmap-0)' }}></div>
              <div className="legend-square" style={{ background: 'var(--heatmap-1)' }}></div>
              <div className="legend-square" style={{ background: 'var(--heatmap-2)' }}></div>
              <div className="legend-square" style={{ background: 'var(--heatmap-3)' }}></div>
              <div className="legend-square" style={{ background: 'var(--heatmap-4)' }}></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="heatmap-container">
          <div className="heatmap-weekdays">
            {weekdays.map((day, i) => (
              <span key={day} className={i % 2 === 0 ? '' : 'hidden-label'}>{day}</span>
            ))}
          </div>
          <div className="heatmap-grid-wrapper">
            <div className="heatmap-months">
              {heatmapWeeks.map((week, i) => {
                const firstDay = week[0];
                if (firstDay.date.getDate() <= 7 && i > 0) {
                  return <span key={i}>{months[firstDay.date.getMonth()]}</span>;
                }
                return <span key={i}></span>;
              })}
            </div>
            <div className="heatmap-grid">
              {heatmapWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="heatmap-week">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`heatmap-day ${day.isToday ? 'today' : ''} ${day.isFuture ? 'future' : ''}`}
                      style={{ background: day.isFuture ? 'transparent' : getHeatmapColor(day.count) }}
                      title={`${day.dateStr}: ${day.count} sessions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bottom-sections">
        {/* Weekday Pattern */}
        <motion.div 
          className="weekday-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="section-header">
            <h2><BarChart3 size={20} /> Learning Pattern</h2>
          </div>
          <div className="weekday-chart">
            {weekdayPattern?.map((day, index) => {
              const maxSessions = Math.max(...(weekdayPattern?.map(d => d.total_sessions) || [1]));
              const height = maxSessions > 0 ? (day.total_sessions / maxSessions) * 100 : 0;
              return (
                <div key={index} className="weekday-bar-container">
                  <div 
                    className="weekday-bar" 
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.day_name}: ${day.total_sessions} sessions`}
                  >
                    <span className="bar-value">{day.total_sessions}</span>
                  </div>
                  <span className="weekday-label">{day.day_name.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Completions */}
        <motion.div 
          className="completions-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="section-header">
            <h2><Award size={20} /> Recent Completions</h2>
          </div>
          <div className="completions-list">
            {recentCompletions?.length > 0 ? (
              recentCompletions.map((item, index) => (
                <div key={index} className="completion-item">
                  <div className="completion-icon">
                    <CheckCircle size={16} />
                  </div>
                  <div className="completion-info">
                    <span className="completion-title">{item.title}</span>
                    <span className="completion-date">
                      {new Date(item.completed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-completions">
                <p>No completions yet. Start learning!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressMap;
