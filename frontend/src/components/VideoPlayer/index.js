import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Check,
  Rewind,
  FastForward,
  Heart,
  Film,
  Clock,
  Zap,
  Sparkles,
  Trophy
} from 'lucide-react';
import './styles.css';

const VideoPlayer = ({ item, file, onProgressUpdate, onComplete }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  // Generate video URL from file
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Initialize video with last position
  useEffect(() => {
    if (videoRef.current && item?.last_position) {
      videoRef.current.currentTime = item.last_position;
    }
  }, [item?.last_position, videoUrl]);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    if (isPlaying && !isHovering) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, isHovering]);

  // Keyboard shortcuts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'arrowleft':
          skip(-10);
          break;
        case 'arrowright':
          skip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'j':
          skip(-10);
          break;
        case 'l':
          skip(10);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          seekToPercent(parseInt(e.key) * 10);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const changeVolume = useCallback((delta) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, [volume]);

  const skip = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const seekToPercent = useCallback((percent) => {
    if (videoRef.current && duration) {
      videoRef.current.currentTime = (percent / 100) * duration;
    }
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      
      // Update progress periodically
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const progress = total > 0 ? (current / total) * 100 : 0;
        onProgressUpdate?.(progress, current);
      }, 1000);

      // Check for completion (90% watched)
      if (total > 0 && current / total >= 0.9 && !item?.is_completed) {
        setShowCompletionPopup(true);
      }
    }
  }, [item?.is_completed, onProgressUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      const bufferedRanges = videoRef.current.buffered;
      if (bufferedRanges.length > 0) {
        const bufferedEnd = bufferedRanges.end(bufferedRanges.length - 1);
        setBuffered((bufferedEnd / duration) * 100);
      }
    }
  }, [duration]);

  const handleProgressClick = useCallback((e) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  }, [duration]);

  const handleProgressHover = useCallback((e) => {
    if (progressRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      setHoverTime(percent * duration);
      setHoverPosition(e.clientX - rect.left);
    }
  }, [duration]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`video-player ${isFullscreen ? 'fullscreen' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowSettings(false);
        setShowVolumeSlider(false);
      }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Header */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="video-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="video-title-section">
              <Film size={20} />
              <div className="video-info">
                <h2 className="video-title">{item?.name || 'Untitled Video'}</h2>
                <div className="video-meta">
                  <span className="video-duration">
                    <Clock size={14} />
                    {formatTime(duration)}
                  </span>
                  <span className="video-progress-text">
                    <Zap size={14} />
                    {Math.round(progress)}% completed
                  </span>
                </div>
              </div>
            </div>
            <div className="video-header-actions">
              <motion.button
                className={`action-btn ${isLiked ? 'liked' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Element */}
      <div className="video-wrapper" onClick={togglePlay}>
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="video-element"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onProgress={handleProgress}
            onEnded={() => {
              setIsPlaying(false);
              onComplete?.();
            }}
          />
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-content">
              <Film size={64} />
              <p>Select a video file to watch</p>
              <span>Supported formats: MP4, WebM, OGG</span>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay */}
        <AnimatePresence>
          {!isPlaying && videoUrl && (
            <motion.div
              className="play-overlay"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="play-button-large"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={48} fill="white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Indicators */}
        <div className="skip-zone skip-zone-left" onDoubleClick={() => skip(-10)}>
          <AnimatePresence>
            <motion.div
              className="skip-indicator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <Rewind size={24} />
              <span>10s</span>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="skip-zone skip-zone-right" onDoubleClick={() => skip(10)}>
          <AnimatePresence>
            <motion.div
              className="skip-indicator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <FastForward size={24} />
              <span>10s</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="video-controls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="progress-container"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="progress-bar">
                <div
                  className="progress-buffered"
                  style={{ width: `${buffered}%` }}
                />
                <div
                  className="progress-played"
                  style={{ width: `${progress}%` }}
                >
                  <div className="progress-thumb" />
                </div>
              </div>
              {isHovering && (
                <div
                  className="progress-tooltip"
                  style={{ left: `${hoverPosition}px` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="controls-row">
              <div className="controls-left">
                {/* Play/Pause */}
                <motion.button
                  className="control-btn play-pause-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                </motion.button>

                {/* Skip Back */}
                <motion.button
                  className="control-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => skip(-10)}
                  title="Skip back 10s (J)"
                >
                  <SkipBack size={20} />
                </motion.button>

                {/* Skip Forward */}
                <motion.button
                  className="control-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => skip(10)}
                  title="Skip forward 10s (L)"
                >
                  <SkipForward size={20} />
                </motion.button>

                {/* Volume */}
                <div
                  className="volume-control"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <motion.button
                    className="control-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </motion.button>
                  <AnimatePresence>
                    {showVolumeSlider && (
                      <motion.div
                        className="volume-slider-container"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 80 }}
                        exit={{ opacity: 0, width: 0 }}
                      >
                        <input
                          type="range"
                          className="volume-slider"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            const newVolume = parseFloat(e.target.value);
                            setVolume(newVolume);
                            if (videoRef.current) {
                              videoRef.current.volume = newVolume;
                              setIsMuted(newVolume === 0);
                            }
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Time Display */}
                <div className="time-display">
                  <span className="current-time">{formatTime(currentTime)}</span>
                  <span className="time-separator">/</span>
                  <span className="total-time">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="controls-right">
                {/* Playback Speed */}
                <div className="settings-container">
                  <motion.button
                    className="control-btn speed-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings size={20} />
                    <span className="speed-label">{playbackRate}x</span>
                  </motion.button>
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        className="settings-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      >
                        <div className="settings-header">
                          <Sparkles size={16} />
                          Playback Speed
                        </div>
                        {playbackRates.map((rate) => (
                          <button
                            key={rate}
                            className={`settings-option ${playbackRate === rate ? 'active' : ''}`}
                            onClick={() => {
                              setPlaybackRate(rate);
                              if (videoRef.current) {
                                videoRef.current.playbackRate = rate;
                              }
                              setShowSettings(false);
                            }}
                          >
                            <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                            {playbackRate === rate && <Check size={16} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Fullscreen */}
                <motion.button
                  className="control-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  title="Toggle fullscreen (F)"
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Popup */}
      <AnimatePresence>
        {showCompletionPopup && (
          <motion.div
            className="completion-popup"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="completion-content">
              <motion.div
                className="completion-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy size={48} />
              </motion.div>
              <h3>Great Progress!</h3>
              <p>You've watched 90% of this video</p>
              <div className="completion-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onComplete?.();
                    setShowCompletionPopup(false);
                  }}
                >
                  <Check size={18} />
                  Mark as Complete
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCompletionPopup(false)}
                >
                  Continue Watching
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Hint */}
      <div className="keyboard-hint">
        <span>Space: Play/Pause</span>
        <span>←→: Skip 10s</span>
        <span>F: Fullscreen</span>
        <span>M: Mute</span>
      </div>
    </div>
  );
};

export default VideoPlayer;
