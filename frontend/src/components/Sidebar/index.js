import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Zap,
  Folder,
  Menu,
  X,
  Map,
} from "lucide-react";
import "./styles.css";

const Sidebar = ({ stats, isCollapsed, onToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Don't show sidebar on player page
  if (location.pathname.startsWith("/player")) {
    return null;
  }

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/library", icon: Library, label: "Library" },
    { path: "/collections", icon: Folder, label: "Collections" },
    { path: "/progress-map", icon: Map, label: "Progress Map" },
    { path: "/manage", icon: Settings, label: "Manage" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={`sidebar-nav ${isCollapsed ? "collapsed" : ""}`}
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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
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
          <motion.div className="sidebar-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="stat-row">
              <BookOpen size={16} />
              <span>{stats.total} items</span>
            </div>
            <div className="stat-row">
              <span className="stat-completed">{stats.completed} completed</span>
            </div>
            <div className="sidebar-progress">
              <div className="sidebar-progress-fill" style={{ width: `${stats.avgProgress}%` }} />
            </div>
            <span className="progress-label">{stats.avgProgress}% overall</span>
          </motion.div>
        )}

        {/* Toggle Button */}
        <button className="sidebar-toggle" onClick={onToggle}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              className="mobile-menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-header">
                <div className="logo-icon">
                  <Zap size={24} />
                </div>
                <span className="logo-text">LearnTrack</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <nav className="mobile-menu-nav">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `mobile-menu-item ${isActive ? "active" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              {stats && (
                <div className="mobile-menu-stats">
                  <div className="stat-row">
                    <BookOpen size={16} />
                    <span>{stats.total} items</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-completed">{stats.completed} completed</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
