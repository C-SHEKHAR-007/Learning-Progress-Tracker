import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Play,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  ArrowRight,
  Video,
  FileText,
} from "lucide-react";
import "./styles.css";

const Dashboard = ({ items, collections, stats, onItemSelect, fileMap }) => {
  // Get recently accessed items (last 5)
  const recentItems = [...items]
    .filter((item) => item.progress > 0 && !item.is_completed)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  // Get completed items count by collection
  const collectionStats = collections
    .map((collection) => {
      const collectionItems = items.filter((i) => i.collection_id === collection.id);
      const completed = collectionItems.filter((i) => i.is_completed).length;
      const total = collectionItems.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...collection, completed, total, progress };
    })
    .filter((s) => s.total > 0);

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <div
            className="stat-icon"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
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
          <div
            className="stat-icon"
            style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
          >
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
          <div
            className="stat-icon"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
          >
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
          <div
            className="stat-icon"
            style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}
          >
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
            <h2>
              <Zap size={20} /> Continue Learning
            </h2>
            <Link to="/library" className="section-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="continue-grid">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                to={`/player/${item.id}`}
                className="continue-card"
                onClick={() => onItemSelect(item)}
              >
                <div className="continue-thumbnail">
                  {item.type === "video" ? <Video size={32} /> : <FileText size={32} />}
                </div>
                <div className="continue-info">
                  <h3>{item.name}</h3>
                  <div className="continue-meta">
                    <span className="progress-text">{Math.round(item.progress)}% complete</span>
                    {item.duration > 0 && (
                      <span className="duration-text">
                        {formatDuration(item.last_position)} / {formatDuration(item.duration)}
                      </span>
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

      {/* Collection Progress */}
      {collectionStats.length > 0 && (
        <motion.section
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="section-header">
            <h2>
              <BookOpen size={20} /> Collection Progress
            </h2>
          </div>
          <div className="collections-progress-grid">
            {collectionStats.map((collection) => (
              <div key={collection.id} className="collection-progress-card">
                <div className="collection-header">
                  <div className="collection-color-dot" style={{ background: collection.color }} />
                  <h3>{collection.name}</h3>
                </div>
                <div className="collection-stats">
                  <span>
                    {collection.completed} / {collection.total} completed
                  </span>
                </div>
                <div className="collection-progress-bar">
                  <div
                    className="collection-progress-fill"
                    style={{
                      width: `${collection.progress}%`,
                      background: collection.color,
                    }}
                  />
                </div>
                <span className="collection-progress-percent">{collection.progress}%</span>
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
          <h2>
            <Zap size={20} /> Quick Actions
          </h2>
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
            Manage Collections
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
