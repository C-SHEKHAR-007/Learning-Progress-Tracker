import React, { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  Eye,
  Bookmark,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  StickyNote,
  X,
  Clock,
  BarChart3,
  List,
  Edit3,
  Trash2,
  Download,
  RotateCcw,
  Loader,
} from "lucide-react";
import { pdfApi } from "../../services/api";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./styles.css";

// Set up PDF.js worker using cdnjs (more reliable)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({
  item,
  file,
  fileUrl: propFileUrl,
  onComplete,
  isCompleted,
  onProgressUpdate,
}) => {
  // Core state
  const [pdfUrl, setPdfUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);

  // Feature state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);

  // Note input state
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  // Reading time tracking
  const [readingTime, setReadingTime] = useState(0);

  // Refs
  const containerRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const pageRefs = useRef({});
  const saveTimeoutRef = useRef(null);
  const sessionStartTimeRef = useRef(Date.now());
  const currentPageRef = useRef(currentPage);
  const scrollDebounceRef = useRef(null);
  const lastSavedPageRef = useRef(currentPage);

  // Keep ref in sync with state
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  const observerRef = useRef(null);

  // Progress calculation
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  // Load PDF URL
  useEffect(() => {
    if (item?.file_path) {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      setPdfUrl(`${apiUrl}/items/${item.id}/file`);
    } else if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (propFileUrl) {
      setPdfUrl(propFileUrl);
    }
  }, [file, item?.id, item?.file_path, propFileUrl]);

  // Load saved reading state
  useEffect(() => {
    const loadReadingState = async () => {
      if (!item?.id) return;

      try {
        const state = await pdfApi.getReadingState(item.id);
        if (state) {
          setCurrentPage(state.current_page || 1);
          // Don't set totalPages from DB - let PDF.js detect it
          setBookmarks(state.bookmarks || []);
          setNotes(state.notes || []);
          setReadingTime(state.reading_time || 0);
        }
      } catch (error) {
        console.error("Error loading reading state:", error);
        if (item.current_page) setCurrentPage(item.current_page);
      }
    };

    loadReadingState();
    sessionStartTimeRef.current = Date.now();
  }, [item?.id, item?.current_page]);

  // PDF load success handler - automatically gets total pages
  const onDocumentLoadSuccess = ({ numPages }) => {
    setTotalPages(numPages);
    setIsLoading(false);
    setPdfError(null);
    // Note: Don't save here - let scroll debounce handle saves to avoid duplicate calls
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
    setPdfError("Failed to load PDF. Please try again.");
    setIsLoading(false);
  };

  // Set up Intersection Observer for scroll-based page tracking
  useEffect(() => {
    if (totalPages === 0) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: pdfContainerRef.current,
      rootMargin: "-40% 0px -40% 0px", // Consider page "current" when it's in the middle 20%
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.dataset.pageNumber, 10);
          if (pageNum && pageNum !== currentPageRef.current) {
            setCurrentPage(pageNum);
          }
        }
      });
    }, options);

    // Observe all page elements
    Object.values(pageRefs.current).forEach((ref) => {
      if (ref) observerRef.current.observe(ref);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [totalPages]);

  // Auto-save progress (called after scroll stops)
  const saveProgress = useCallback(async () => {
    if (!item?.id || totalPages === 0) return;

    // Only save if page actually changed since last save
    if (currentPageRef.current === lastSavedPageRef.current) return;

    const sessionTime = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);

    try {
      await pdfApi.updatePageProgress(item.id, currentPageRef.current, totalPages, sessionTime);
      sessionStartTimeRef.current = Date.now();
      lastSavedPageRef.current = currentPageRef.current;

      if (onProgressUpdate) {
        const currentProgress = Math.round((currentPageRef.current / totalPages) * 100);
        onProgressUpdate({
          progress: currentProgress,
          currentPage: currentPageRef.current,
          totalPages,
        });
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, [item?.id, totalPages, onProgressUpdate]);

  // Debounced scroll handler - syncs to backend only after scroll stops
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container || totalPages === 0) return;

    const handleScroll = () => {
      // Clear previous timeout
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }

      // Set new timeout - save after 1.5s of no scrolling
      scrollDebounceRef.current = setTimeout(() => {
        saveProgress();
      }, 1500);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, [totalPages, saveProgress]);

  // Save on unmount using sendBeacon for reliability
  useEffect(() => {
    const itemId = item?.id;
    return () => {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      // Use sendBeacon for reliable save on page unload/unmount
      if (itemId && totalPages > 0 && currentPageRef.current !== lastSavedPageRef.current) {
        const sessionTime = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const data = JSON.stringify({
          currentPage: currentPageRef.current,
          totalPages,
          readingTime: sessionTime,
        });
        // sendBeacon ensures request completes even if page is closing
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            `${apiUrl}/pdf/${itemId}/page`,
            new Blob([data], { type: "application/json" }),
          );
        } else {
          // Fallback for older browsers
          pdfApi
            .updatePageProgress(itemId, currentPageRef.current, totalPages, sessionTime)
            .catch(console.error);
        }
      }
    };
  }, [item?.id, totalPages]);

  // Scroll to specific page
  const scrollToPage = useCallback((pageNum) => {
    const pageElement = pageRefs.current[pageNum];
    if (pageElement && pdfContainerRef.current) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Page navigation
  const goToPage = useCallback(
    (page) => {
      const maxPage = totalPages > 0 ? totalPages : 9999;
      const newPage = Math.max(1, Math.min(page, maxPage));
      setCurrentPage(newPage);
      scrollToPage(newPage);
    },
    [totalPages, scrollToPage],
  );

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const resetZoom = () => setZoom(100);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          nextPage();
          break;
        case "ArrowLeft":
        case "PageUp":
          prevPage();
          break;
        case "Home":
          goToPage(1);
          break;
        case "End":
          goToPage(totalPages);
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "0":
          resetZoom();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "b":
          handleAddBookmark();
          break;
        case "d":
          setIsDarkMode((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [currentPage, totalPages]); // eslint-disable-line

  // Bookmark functions
  const handleAddBookmark = async () => {
    if (!item?.id) return;

    const existingBookmark = bookmarks.find((b) => b.page === currentPage);
    if (existingBookmark) {
      await handleRemoveBookmark(existingBookmark.id);
      return;
    }

    try {
      const result = await pdfApi.addBookmark(item.id, currentPage, `Page ${currentPage}`);
      setBookmarks(result.bookmarks || []);
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    if (!item?.id) return;

    try {
      const result = await pdfApi.removeBookmark(item.id, bookmarkId);
      setBookmarks(result.bookmarks || []);
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const isCurrentPageBookmarked = bookmarks.some((b) => b.page === currentPage);

  // Note functions
  const handleAddNote = async () => {
    if (!item?.id || !newNote.trim()) return;

    try {
      const result = await pdfApi.addNote(item.id, currentPage, newNote.trim());
      setNotes(result.notes || []);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleUpdateNote = async (noteId, content) => {
    if (!item?.id) return;

    try {
      const result = await pdfApi.updateNote(item.id, noteId, content);
      setNotes(result.notes || []);
      setEditingNote(null);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleRemoveNote = async (noteId) => {
    if (!item?.id) return;

    try {
      const result = await pdfApi.removeNote(item.id, noteId);
      setNotes(result.notes || []);
    } catch (error) {
      console.error("Error removing note:", error);
    }
  };

  // Load stats
  const loadStats = async () => {
    if (!item?.id) return;

    try {
      const data = await pdfApi.getStats(item.id);
      setStats(data);
      setShowStats(true);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Format reading time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Download PDF
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = item?.name || "document.pdf";
      link.click();
    }
  };

  // Scroll to saved page after PDF loads
  useEffect(() => {
    if (totalPages > 0 && currentPage > 1) {
      // Small delay to ensure pages are rendered
      setTimeout(() => scrollToPage(currentPage), 500);
    }
  }, [totalPages]); // eslint-disable-line

  // Placeholder when no PDF selected
  if (!item?.file_path && !file && !pdfUrl) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-placeholder">
          <div className="placeholder-content">
            <FileText size={64} />
            <p>Select a PDF file to view</p>
            <span>Supported format: PDF</span>
          </div>
        </div>
      </div>
    );
  }

  const currentPageNotes = notes.filter((n) => n.page === currentPage);

  return (
    <div
      ref={containerRef}
      className={`pdf-viewer ${isDarkMode ? "dark-mode" : ""} ${isFullscreen ? "fullscreen" : ""}`}
    >
      {/* Header */}
      <div className="pdf-header">
        <div className="pdf-title-section">
          <FileText size={20} />
          <div className="pdf-info">
            <h2 className="pdf-title">{item?.name || "Untitled PDF"}</h2>
            <div className="pdf-meta">
              <span>
                <Eye size={14} />
                PDF Document
              </span>
              {totalPages > 0 && (
                <span className="progress-badge">
                  <BarChart3 size={14} />
                  {progress}% completed
                </span>
              )}
              {isCompleted && (
                <span className="completed-badge">
                  <CheckCircle size={14} />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pdf-header-actions">
          {!isCompleted && (
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
            >
              <CheckCircle size={18} />
              Mark as Complete
            </motion.button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="pdf-toolbar">
        {/* Page Navigation */}
        <div className="toolbar-group page-navigation">
          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevPage}
            disabled={currentPage <= 1}
            title="Previous page (←)"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div className="page-input-group">
            <input
              type="number"
              className="page-input"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              min={1}
              max={totalPages || 999}
            />
            <span className="page-separator">/</span>
            <span className="total-pages-display">{totalPages || "..."}</span>
          </div>

          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage}
            disabled={totalPages > 0 && currentPage >= totalPages}
            title="Next page (→)"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="toolbar-group progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>

        {/* Zoom Controls */}
        <div className="toolbar-group zoom-controls">
          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="Zoom out (-)"
          >
            <ZoomOut size={18} />
          </motion.button>
          <span className="zoom-label" onClick={resetZoom} title="Reset zoom (0)">
            {zoom}%
          </span>
          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Zoom in (+)"
          >
            <ZoomIn size={18} />
          </motion.button>
        </div>

        {/* Feature Controls */}
        <div className="toolbar-group feature-controls">
          <motion.button
            className={`control-btn ${isCurrentPageBookmarked ? "active" : ""}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddBookmark}
            title="Toggle bookmark (B)"
          >
            {isCurrentPageBookmarked ? <Bookmark size={18} /> : <BookmarkPlus size={18} />}
          </motion.button>

          <motion.button
            className={`control-btn ${showBookmarks ? "active" : ""}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowBookmarks(!showBookmarks);
              setShowNotes(false);
              setShowStats(false);
            }}
            title="View bookmarks"
          >
            <List size={18} />
            {bookmarks.length > 0 && <span className="badge">{bookmarks.length}</span>}
          </motion.button>

          <motion.button
            className={`control-btn ${showNotes ? "active" : ""}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowNotes(!showNotes);
              setShowBookmarks(false);
              setShowStats(false);
            }}
            title="View notes"
          >
            <StickyNote size={18} />
            {notes.length > 0 && <span className="badge">{notes.length}</span>}
          </motion.button>

          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={loadStats}
            title="View statistics"
          >
            <BarChart3 size={18} />
          </motion.button>

          <motion.button
            className={`control-btn ${isDarkMode ? "active" : ""}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle dark mode (D)"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </motion.button>

          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            title="Download PDF"
          >
            <Download size={18} />
          </motion.button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pdf-main-content">
        {/* Side Panels */}
        <AnimatePresence>
          {showBookmarks && (
            <motion.div
              className="pdf-side-panel"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
            >
              <div className="panel-header">
                <h3>
                  <Bookmark size={18} /> Bookmarks
                </h3>
                <motion.button
                  className="close-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBookmarks(false)}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <div className="panel-content">
                {bookmarks.length === 0 ? (
                  <p className="empty-message">
                    No bookmarks yet. Press B to bookmark current page.
                  </p>
                ) : (
                  <ul className="bookmark-list">
                    {bookmarks
                      .sort((a, b) => a.page - b.page)
                      .map((bookmark) => (
                        <li key={bookmark.id} className="bookmark-item">
                          <button className="bookmark-link" onClick={() => goToPage(bookmark.page)}>
                            <Bookmark size={14} style={{ color: bookmark.color }} />
                            <span>{bookmark.title}</span>
                            <span className="page-num">p.{bookmark.page}</span>
                          </button>
                          <motion.button
                            className="delete-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveBookmark(bookmark.id)}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}

          {showNotes && (
            <motion.div
              className="pdf-side-panel"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
            >
              <div className="panel-header">
                <h3>
                  <StickyNote size={18} /> Notes
                </h3>
                <motion.button
                  className="close-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotes(false)}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <div className="panel-content">
                <div className="add-note-form">
                  <textarea
                    placeholder={`Add note for page ${currentPage}...`}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <motion.button
                    className="btn btn-primary btn-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    Add Note
                  </motion.button>
                </div>

                {notes.length === 0 ? (
                  <p className="empty-message">No notes yet. Add your first note above.</p>
                ) : (
                  <ul className="notes-list">
                    {notes
                      .sort((a, b) => a.page - b.page)
                      .map((note) => (
                        <li key={note.id} className="note-item">
                          <div className="note-header">
                            <button className="page-link" onClick={() => goToPage(note.page)}>
                              Page {note.page}
                            </button>
                            <div className="note-actions">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditingNote(note)}
                              >
                                <Edit3 size={14} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveNote(note.id)}
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </div>
                          {editingNote?.id === note.id ? (
                            <div className="edit-note-form">
                              <textarea
                                value={editingNote.content}
                                onChange={(e) =>
                                  setEditingNote({
                                    ...editingNote,
                                    content: e.target.value,
                                  })
                                }
                                rows={3}
                              />
                              <div className="edit-actions">
                                <motion.button
                                  className="btn btn-sm"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setEditingNote(null)}
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  className="btn btn-primary btn-sm"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleUpdateNote(note.id, editingNote.content)}
                                >
                                  Save
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <p className="note-content">{note.content}</p>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF Content */}
        <div className="pdf-content" ref={pdfContainerRef}>
          {pdfError ? (
            <div className="pdf-error">
              <FileText size={48} />
              <p>{pdfError}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="pdf-loading">
                  <Loader className="spinner" size={32} />
                  <p>Loading PDF...</p>
                </div>
              }
              className="pdf-document"
            >
              {Array.from(new Array(totalPages), (el, index) => (
                <div
                  key={`page_container_${index + 1}`}
                  ref={(el) => (pageRefs.current[index + 1] = el)}
                  data-page-number={index + 1}
                  className={`pdf-page-wrapper ${currentPage === index + 1 ? "current-page" : ""}`}
                >
                  <div className="page-number-label">Page {index + 1}</div>
                  <Page
                    pageNumber={index + 1}
                    scale={zoom / 100}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    loading={
                      <div className="page-loading">
                        <Loader className="spinner" size={24} />
                      </div>
                    }
                  />
                </div>
              ))}
            </Document>
          )}

          {currentPageNotes.length > 0 && (
            <div className="page-notes-indicator">
              <StickyNote size={16} />
              <span>{currentPageNotes.length} note(s) on this page</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStats && stats && (
          <motion.div
            className="stats-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStats(false)}
          >
            <motion.div
              className="stats-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stats-header">
                <h3>
                  <BarChart3 size={20} /> Reading Statistics
                </h3>
                <motion.button
                  className="close-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowStats(false)}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <div className="stats-content">
                <div className="stat-item">
                  <div className="stat-icon">
                    <Eye size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {stats.current_page} / {stats.total_pages || totalPages}
                    </span>
                    <span className="stat-label">Pages Read</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <BarChart3 size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{Math.round(stats.progress)}%</span>
                    <span className="stat-label">Progress</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{formatTime(stats.reading_time || 0)}</span>
                    <span className="stat-label">Reading Time</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <Bookmark size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.bookmark_count || 0}</span>
                    <span className="stat-label">Bookmarks</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <StickyNote size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.note_count || 0}</span>
                    <span className="stat-label">Notes</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.is_completed ? "Yes" : "No"}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
              </div>

              <div className="stats-footer">
                <motion.button
                  className="btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    goToPage(1);
                    setShowStats(false);
                  }}
                >
                  <RotateCcw size={16} />
                  Restart from Beginning
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Overlay */}
      {isCompleted && (
        <div className="completed-overlay">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="completed-badge-large"
          >
            <CheckCircle size={24} />
            Completed
          </motion.div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="keyboard-shortcuts-hint">
        <span>← → Navigate</span>
        <span>+/- Zoom</span>
        <span>B Bookmark</span>
        <span>D Dark</span>
        <span>F Fullscreen</span>
      </div>
    </div>
  );
};

export default PDFViewer;
