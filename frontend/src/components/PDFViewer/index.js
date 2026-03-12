import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  Eye
} from 'lucide-react';
import './styles.css';

const PDFViewer = ({ item, file, onComplete, isCompleted }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  if (!file && !pdfUrl) {
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

  return (
    <div className="pdf-viewer">
      {/* Header */}
      <div className="pdf-header">
        <div className="pdf-title-section">
          <FileText size={20} />
          <div className="pdf-info">
            <h2 className="pdf-title">{item?.name || 'Untitled PDF'}</h2>
            <div className="pdf-meta">
              <span>
                <Eye size={14} />
                PDF Document
              </span>
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

      {/* Controls */}
      <div className="pdf-controls">
        <div className="zoom-controls">
          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut size={18} />
          </motion.button>
          <span className="zoom-label">{zoom}%</span>
          <motion.button
            className="control-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn size={18} />
          </motion.button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="pdf-content">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="pdf-iframe"
            title={item?.name || 'PDF Viewer'}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          />
        ) : (
          <div className="pdf-loading">
            <div className="spinner" />
            <p>Loading PDF...</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default PDFViewer;
