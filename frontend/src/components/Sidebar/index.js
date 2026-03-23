import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Zap,
  Folder
} from 'lucide-react';
import './styles.css';

const Sidebar = ({ stats }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Don't show sidebar on player page
  if (location.pathname.startsWith('/player')) {
    return null;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/subjects', icon: Folder, label: 'Subjects' },
    { path: '/manage', icon: Settings, label: 'Manage' },
  ];

  return (
    <motion.aside 
      className={`sidebar-nav ${isCollapsed ? 'collapsed' : ''}`}
      animate={{ width: isCollapsed ? 70 : 240 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={24} />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span 
              className="logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              LearnTrack
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Stats */}
      {!isCollapsed && stats && (
        <motion.div 
          className="sidebar-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="stat-row">
            <BookOpen size={16} />
            <span>{stats.total} items</span>
          </div>
          <div className="stat-row">
            <span className="stat-completed">{stats.completed} completed</span>
          </div>
          <div className="sidebar-progress">
            <div 
              className="sidebar-progress-fill" 
              style={{ width: `${stats.avgProgress}%` }}
            />
          </div>
          <span className="progress-label">{stats.avgProgress}% overall</span>
        </motion.div>
      )}

      {/* Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
