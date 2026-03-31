import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Trophy, TrendingUp, Sparkles } from "lucide-react";

const Header = ({ stats }) => {
  return (
    <header className="header">
      <div className="header-content">
        <motion.div
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-icon">
            <GraduationCap size={28} color="white" />
          </div>
          <div>
            <h1 className="logo-text">Learning Tracker</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Track your progress, achieve your goals
            </p>
          </div>
        </motion.div>

        <motion.div
          className="header-stats"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="stat-item">
            <motion.div
              className="stat-value"
              key={stats.total}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              <BookOpen size={16} style={{ display: "inline", marginRight: "4px" }} />
              {stats.total}
            </motion.div>
            <div className="stat-label">Total Items</div>
          </div>

          <div className="stat-item">
            <motion.div
              className="stat-value"
              style={{ color: "var(--success)" }}
              key={stats.completed}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              <Trophy size={16} style={{ display: "inline", marginRight: "4px" }} />
              {stats.completed}
            </motion.div>
            <div className="stat-label">Completed</div>
          </div>

          <div className="stat-item">
            <motion.div
              className="stat-value"
              style={{ color: "var(--warning)" }}
              key={stats.inProgress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              <TrendingUp size={16} style={{ display: "inline", marginRight: "4px" }} />
              {stats.inProgress}
            </motion.div>
            <div className="stat-label">In Progress</div>
          </div>

          <div className="stat-item">
            <motion.div
              className="stat-value"
              key={stats.avgProgress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              <Sparkles size={16} style={{ display: "inline", marginRight: "4px" }} />
              {stats.avgProgress}%
            </motion.div>
            <div className="stat-label">Avg Progress</div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
