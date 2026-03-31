import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Home,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import VideoPlayer from "../../components/VideoPlayer";
import PDFViewer from "../../components/PDFViewer";
import "./styles.css";

const Player = ({
  items,
  collections,
  fileMap,
  selectedItem,
  onItemSelect,
  onProgressUpdate,
  onComplete,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);
  const playerContainerRef = useRef(null);

  // Find the item
  const item = items.find((i) => i.id === parseInt(id)) || selectedItem;
  const file = item ? fileMap.get(item.file_id) : null;

  // Check if item has a local file path (streamed from backend)
  const hasFilePath = item?.file_path;

  // Get related items (same collection or all videos/pdfs)
  const relatedItems = useMemo(() => {
    if (!item) return [];
    // Get items from same collection, or all items of same type if no collection
    const sameCollection = item.collection_id
      ? items.filter((i) => i.collection_id === item.collection_id)
      : items.filter((i) => i.type === item.type);
    return sameCollection.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }, [items, item]);

  // Get collection name
  const collectionName = useMemo(() => {
    if (!item?.collection_id || !collections) return "All Items";
    const collection = collections.find((c) => c.id === item.collection_id);
    return collection?.name || "Uncategorized";
  }, [item, collections]);

  // Keep ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls when mouse stops moving (only in video area)
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    setIsIdle(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlayingRef.current) {
        setShowControls(false);
        setIsIdle(true);
      }
    }, 3000);
  }, []);

  // Handle mouse movement in video area only
  const handleVideoAreaMouseMove = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  // Handle play state change from VideoPlayer
  const handlePlayStateChange = useCallback(
    (playing) => {
      setIsPlaying(playing);
      isPlayingRef.current = playing;
      if (!playing) {
        setShowControls(true);
        setIsIdle(false);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      } else {
        resetHideTimer();
      }
    },
    [resetHideTimer],
  );

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (item && (!selectedItem || selectedItem.id !== item.id)) {
      onItemSelect(item);
    }
  }, [item, selectedItem, onItemSelect]);

  // Navigate to item
  const handleItemClick = (clickedItem) => {
    navigate(`/player/${clickedItem.id}`);
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!item) {
    return (
      <div className="player-page">
        <div className="player-not-found">
          <h2>Item not found</h2>
          <p>The requested item could not be found in your library.</p>
          <Link to="/library" className="back-link">
            <ArrowLeft size={18} />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`player-page ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {/* Sidebar - Hidden in fullscreen */}
      {!isFullscreen && (
        <>
          <div className={`player-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </button>
              <div className="sidebar-title">
                <h2>{collectionName}</h2>
                <span>{relatedItems.length} items</span>
              </div>
              <Link to="/" className="home-btn">
                <Home size={20} />
              </Link>
            </div>

            {/* Playlist */}
            <div className="playlist">
              {relatedItems.map((listItem, index) => (
                <div
                  key={listItem.id}
                  className={`playlist-item ${listItem.id === item.id ? "active" : ""} ${listItem.is_completed ? "completed" : ""}`}
                  onClick={() => handleItemClick(listItem)}
                >
                  <div className="playlist-item-number">
                    {listItem.is_completed ? (
                      <CheckCircle size={16} className="completed-icon" />
                    ) : listItem.id === item.id && isPlaying ? (
                      <div className="playing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="playlist-item-icon">
                    {listItem.type === "video" ? <Video size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="playlist-item-info">
                    <span className="playlist-item-name">{listItem.name}</span>
                    <div className="playlist-item-meta">
                      {listItem.type === "video" && listItem.duration && (
                        <span>
                          <Clock size={12} /> {formatDuration(listItem.duration)}
                        </span>
                      )}
                      {listItem.progress > 0 && !listItem.is_completed && (
                        <span className="progress-text">{Math.round(listItem.progress)}%</span>
                      )}
                    </div>
                  </div>
                  {listItem.id === item.id && (
                    <div className="now-playing-badge">
                      <Play size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Toggle - Outside sidebar so it's always visible */}
          <button
            className={`sidebar-toggle ${sidebarCollapsed ? "collapsed" : ""}`}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </>
      )}

      {/* Main Content Area */}
      <div
        ref={playerContainerRef}
        className={`player-main ${isIdle && isPlaying ? "cursor-hidden" : ""}`}
        onMouseMove={handleVideoAreaMouseMove}
      >
        {/* Video Area Header - Only visible on hover when playing */}
        <AnimatePresence>
          {(showControls || !isPlaying) && !isFullscreen && (
            <motion.div
              className="video-area-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="current-item-info">
                <h1>{item.name}</h1>
                <span className="item-type-badge">{item.type === "video" ? "Video" : "PDF"}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player Content */}
        <div className="player-content">
          {!file && !hasFilePath ? (
            <div className="player-no-file">
              <h3>File not available</h3>
              <p>Please re-upload this file or add it by path to continue watching.</p>
              <Link to="/manage" className="upload-link">
                Go to Manage
              </Link>
            </div>
          ) : item.type === "video" ? (
            <VideoPlayer
              item={item}
              file={file}
              onProgressUpdate={onProgressUpdate}
              onComplete={onComplete}
              onPlayStateChange={handlePlayStateChange}
              isIdle={isIdle}
            />
          ) : (
            <PDFViewer
              item={item}
              file={file}
              onComplete={onComplete}
              isCompleted={item.is_completed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
