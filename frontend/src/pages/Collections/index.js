import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Video,
  FileText,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import "./styles.css";

const Collections = ({ items = [], collections = [], getItemsByCollection }) => {
  const navigate = useNavigate();
  const [expandedCollections, setExpandedCollections] = useState(new Set());

  // Initialize with all collections expanded
  React.useEffect(() => {
    if (collections.length > 0) {
      setExpandedCollections(new Set([...collections.map((c) => c.id), null]));
    }
  }, [collections]);

  const groupedItems = getItemsByCollection ? getItemsByCollection() : [];

  const toggleCollection = (collectionId) => {
    setExpandedCollections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item) => {
    navigate(`/player/${item.id}`);
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Separate items into videos and PDFs
  const segregateItems = (items) => {
    const videos = items.filter((item) => item.type === "video");
    const pdfs = items.filter((item) => item.type === "pdf");
    return { videos, pdfs };
  };

  return (
    <div className="collections-page">
      <div className="collections-header">
        <h1>Collections</h1>
        <p>Browse your learning materials organized by collection</p>
      </div>

      {groupedItems.length === 0 ? (
        <div className="collections-empty">
          <Folder size={64} />
          <h3>No collections yet</h3>
          <p>Go to Manage page to create collections and upload content</p>
        </div>
      ) : (
        <div className="collections-content">
          {groupedItems.map((group) => {
            const { videos, pdfs } = segregateItems(group.items);
            const hasContent = videos.length > 0 || pdfs.length > 0;

            return (
              <div key={group.id || "uncategorized"} className="collection-section">
                {/* Collection Header */}
                <div
                  className="collection-header"
                  style={{ borderLeftColor: group.color }}
                  onClick={() => toggleCollection(group.id)}
                >
                  <button className="expand-btn">
                    {expandedCollections.has(group.id) ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>

                  <div className="collection-icon" style={{ background: group.color }}>
                    <Folder size={18} />
                  </div>

                  <div className="collection-info">
                    <span className="collection-name">{group.name}</span>
                    <span className="collection-stats">
                      {videos.length > 0 && (
                        <span className="stat-item">
                          <Video size={14} /> {videos.length}
                        </span>
                      )}
                      {pdfs.length > 0 && (
                        <span className="stat-item">
                          <FileText size={14} /> {pdfs.length}
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="total-items">
                    {group.items.length} {group.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Collection Content */}
                <AnimatePresence>
                  {expandedCollections.has(group.id) && (
                    <motion.div
                      className="collection-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {!hasContent ? (
                        <div className="empty-section">
                          <BookOpen size={32} />
                          <p>No content in this collection</p>
                        </div>
                      ) : (
                        <div className="content-sections">
                          {/* Videos Section */}
                          {videos.length > 0 && (
                            <div className="content-type-section">
                              <div className="section-label">
                                <Video size={16} />
                                <span>Videos ({videos.length})</span>
                              </div>
                              <div className="items-grid">
                                {videos.map((item) => (
                                  <motion.div
                                    key={item.id}
                                    className={`content-item video-item ${item.is_completed ? "completed" : ""}`}
                                    onClick={() => handleItemClick(item)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <div className="item-thumbnail">
                                      <Video size={24} />
                                      <div className="play-overlay">
                                        <Play size={20} />
                                      </div>
                                    </div>
                                    <div className="item-details">
                                      <span className="item-name" title={item.name}>
                                        {item.name}
                                      </span>
                                      <div className="item-meta">
                                        {item.duration ? (
                                          <span className="meta-item">
                                            <Clock size={12} /> {formatDuration(item.duration)}
                                          </span>
                                        ) : null}
                                        {item.is_completed ? (
                                          <span className="meta-item completed">
                                            <CheckCircle size={12} /> Done
                                          </span>
                                        ) : item.progress > 0 ? (
                                          <span className="meta-item progress">
                                            <Circle size={12} /> {Math.round(item.progress)}%
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                    {item.file_path ? (
                                      <div className="stored-badge" title="File stored locally">
                                        <HardDrive size={14} />
                                      </div>
                                    ) : (
                                      <div className="warning-badge" title="No file path">
                                        <AlertCircle size={14} />
                                      </div>
                                    )}
                                    {/* Progress bar */}
                                    {item.progress > 0 && !item.is_completed && (
                                      <div className="item-progress-bar">
                                        <div
                                          className="progress-fill"
                                          style={{ width: `${item.progress}%` }}
                                        />
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* PDFs Section */}
                          {pdfs.length > 0 && (
                            <div className="content-type-section">
                              <div className="section-label">
                                <FileText size={16} />
                                <span>PDFs ({pdfs.length})</span>
                              </div>
                              <div className="items-grid">
                                {pdfs.map((item) => (
                                  <motion.div
                                    key={item.id}
                                    className={`content-item pdf-item ${item.is_completed ? "completed" : ""}`}
                                    onClick={() => handleItemClick(item)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <div className="item-thumbnail pdf">
                                      <FileText size={24} />
                                      <div className="play-overlay">
                                        <BookOpen size={20} />
                                      </div>
                                    </div>
                                    <div className="item-details">
                                      <span className="item-name" title={item.name}>
                                        {item.name}
                                      </span>
                                      <div className="item-meta">
                                        {item.is_completed ? (
                                          <span className="meta-item completed">
                                            <CheckCircle size={12} /> Done
                                          </span>
                                        ) : item.progress > 0 ? (
                                          <span className="meta-item progress">
                                            Page {Math.round(item.last_position || 0)}
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                    {item.file_path ? (
                                      <div className="stored-badge" title="File stored locally">
                                        <HardDrive size={14} />
                                      </div>
                                    ) : (
                                      <div className="warning-badge" title="No file path">
                                        <AlertCircle size={14} />
                                      </div>
                                    )}
                                    {/* Progress bar */}
                                    {item.progress > 0 && !item.is_completed && (
                                      <div className="item-progress-bar">
                                        <div
                                          className="progress-fill"
                                          style={{ width: `${item.progress}%` }}
                                        />
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Collections;
