import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Play,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  ArrowRight,
  Video,
  FileText
} from 'lucide-react';
import './styles.css';

const Dashboard = ({ items, subjects, stats, onItemSelect, fileMap }) => {
  // Get recently accessed items (last 5)
  const recentItems = [...items]
    .filter(item => item.progress > 0 && !item.is_completed)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  // Get completed items count by subject
  const subjectStats = subjects.map(subject => {
    const subjectItems = items.filter(i => i.subject_id === subject.id);
    const completed = subjectItems.filter(i => i.is_completed).length;
    const total = subjectItems.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...subject, completed, total, progress };
  }).filter(s => s.total > 0);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back!</h1>
        <p>Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.avgProgress}%</span>
            <span className="stat-label">Avg Progress</span>
          </div>
        </motion.div>
      </div>

      {/* Continue Watching */}
      {recentItems.length > 0 && (
        <motion.section 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <h2><Zap size={20} /> Continue Learning</h2>
            <Link to="/library" className="section-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="continue-grid">
            {recentItems.map(item => (
              <Link 
                key={item.id} 
                to={`/player/${item.id}`}
                className="continue-card"
                onClick={() => onItemSelect(item)}
              >
                <div className="continue-thumbnail">
                  {item.type === 'video' ? (
                    <Video size={32} />
                  ) : (
                    <FileText size={32} />
                  )}
                </div>
                <div className="continue-info">
                  <h3>{item.name}</h3>
                  <div className="continue-meta">
                    <span className="progress-text">{Math.round(item.progress)}% complete</span>
                    {item.duration > 0 && (
                      <span className="duration-text">{formatDuration(item.last_position)} / {formatDuration(item.duration)}</span>
                    )}
                  </div>
                  <div className="continue-progress">
                    <div 
                      className="continue-progress-fill" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <div className="continue-play">
                  <Play size={20} />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Subject Progress */}
      {subjectStats.length > 0 && (
        <motion.section 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="section-header">
            <h2><BookOpen size={20} /> Subject Progress</h2>
          </div>
          <div className="subjects-progress-grid">
            {subjectStats.map(subject => (
              <div key={subject.id} className="subject-progress-card">
                <div className="subject-header">
                  <div 
                    className="subject-color-dot" 
                    style={{ background: subject.color }}
                  />
                  <h3>{subject.name}</h3>
                </div>
                <div className="subject-stats">
                  <span>{subject.completed} / {subject.total} completed</span>
                </div>
                <div className="subject-progress-bar">
                  <div 
                    className="subject-progress-fill"
                    style={{ 
                      width: `${subject.progress}%`,
                      background: subject.color 
                    }}
                  />
                </div>
                <span className="subject-progress-percent">{subject.progress}%</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Quick Actions */}
      <motion.section 
        className="dashboard-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="section-header">
          <h2><Zap size={20} /> Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <Link to="/manage" className="quick-action-btn">
            <BookOpen size={20} />
            Upload New Content
          </Link>
          <Link to="/library" className="quick-action-btn">
            <Video size={20} />
            Browse Library
          </Link>
          <Link to="/manage" className="quick-action-btn">
            <TrendingUp size={20} />
            Manage Subjects
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
