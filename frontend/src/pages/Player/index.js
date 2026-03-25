import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import VideoPlayer from '../../components/VideoPlayer';
import PDFViewer from '../../components/PDFViewer';
import './styles.css';

const Player = ({ 
  items, 
  fileMap, 
  selectedItem,
  onItemSelect,
  onProgressUpdate, 
  onComplete 
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const hideTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Find the item
  const item = items.find(i => i.id === parseInt(id)) || selectedItem;
  const file = item ? fileMap.get(item.file_id) : null;
  
  // Check if item has a local file path (streamed from backend)
  const hasFilePath = item?.file_path;

  // Keep ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Auto-hide header and cursor when mouse stops moving
  const resetHideTimer = useCallback(() => {
    setShowHeader(true);
    setIsIdle(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Hide after 3 seconds of inactivity (when playing)
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlayingRef.current) {
        setShowHeader(false);
        setIsIdle(true);
      }
    }, 3000);
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  // Handle play state change from VideoPlayer
  const handlePlayStateChange = useCallback((playing) => {
    setIsPlaying(playing);
    isPlayingRef.current = playing;
    if (!playing) {
      setShowHeader(true);
      setIsIdle(false);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    } else {
      // Start hide timer when playing begins
      resetHideTimer();
    }
  }, [resetHideTimer]);

  // Start hide timer when playing starts
  useEffect(() => {
    if (isPlaying) {
      resetHideTimer();
    }
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPlaying, resetHideTimer]);

  useEffect(() => {
    if (item && (!selectedItem || selectedItem.id !== item.id)) {
      onItemSelect(item);
    }
  }, [item, selectedItem, onItemSelect]);

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
    <div className={`player-page ${isIdle ? 'cursor-hidden' : ''}`} onMouseMove={handleMouseMove}>
      {/* Header */}
      <AnimatePresence>
        {showHeader && (
          <motion.div 
            className="player-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <div className="player-title">
              <h1>{item.name}</h1>
              <span className="player-type">{item.type === 'video' ? 'Video' : 'PDF Document'}</span>
            </div>
            <Link to="/" className="home-btn">
              <Home size={20} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="player-content">
        {!file && !hasFilePath ? (
          <div className="player-no-file">
            <h3>File not available</h3>
            <p>Please re-upload this file or add it by path to continue watching.</p>
            <Link to="/manage" className="upload-link">
              Go to Manage
            </Link>
          </div>
        ) : item.type === 'video' ? (
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
  );
};

export default Player;
