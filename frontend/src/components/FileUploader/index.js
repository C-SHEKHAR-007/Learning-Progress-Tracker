import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FolderOpen, Sparkles, ChevronDown, Folder } from 'lucide-react';

const FileUploader = ({ onFilesSelected, subjects = [], selectedSubjectId, onSubjectChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const inputRef = useRef(null);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files = [];

    const processEntry = async (entry) => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file) => {
            files.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        return new Promise((resolve) => {
          reader.readEntries(async (entries) => {
            for (const subEntry of entries) {
              await processEntry(subEntry);
            }
            resolve();
          });
        });
      }
    };

    const processItems = async () => {
      const entries = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          entries.push(entry);
        }
      }

      for (const entry of entries) {
        await processEntry(entry);
      }

      if (files.length > 0) {
        onFilesSelected(files);
      }
    };

    processItems();
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input
    e.target.value = '';
  }, [onFilesSelected]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="uploader">
      {/* Subject Selector */}
      {subjects.length > 0 && (
        <div className="subject-selector" style={{ marginBottom: '1rem', position: 'relative' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Upload to Subject
          </label>
          <button
            className="subject-select-btn"
            onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {selectedSubject ? (
                <>
                  <span style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: selectedSubject.color 
                  }} />
                  {selectedSubject.name}
                </>
              ) : (
                <>
                  <Folder size={16} style={{ opacity: 0.5 }} />
                  <span style={{ color: 'var(--text-muted)' }}>Uncategorized</span>
                </>
              )}
            </span>
            <ChevronDown size={16} style={{ 
              transform: showSubjectDropdown ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          
          {showSubjectDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.25rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              zIndex: 10,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <button
                onClick={() => {
                  onSubjectChange(null);
                  setShowSubjectDropdown(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: selectedSubjectId === null ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s ease'
                }}
              >
                <Folder size={14} style={{ opacity: 0.5 }} />
                Uncategorized
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => {
                    onSubjectChange(subject.id);
                    setShowSubjectDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: selectedSubjectId === subject.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <span style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: subject.color 
                  }} />
                  {subject.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <motion.div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={inputRef}
          type="file"
          className="upload-input"
          multiple
          webkitdirectory=""
          directory=""
          onChange={handleFileSelect}
          accept="video/*,.pdf"
        />
        
        <motion.div
          className="upload-icon"
          animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        >
          {isDragging ? <Sparkles size={32} /> : <FolderOpen size={32} />}
        </motion.div>
        
        <p className="upload-text">
          {isDragging ? 'Drop your files here!' : 'Select a folder to import'}
        </p>
        <p className="upload-hint">
          Videos & PDFs supported
        </p>
      </motion.div>

      <div style={{ 
        marginTop: '1rem', 
        display: 'flex', 
        gap: '0.5rem',
        justifyContent: 'center'
      }}>
        <motion.button
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'video/*,.pdf';
            input.onchange = (ev) => {
              const files = Array.from(ev.target.files);
              if (files.length > 0) {
                onFilesSelected(files);
              }
            };
            input.click();
          }}
        >
          <Upload size={16} />
          Select Files
        </motion.button>
      </div>
    </div>
  );
};

export default FileUploader;
