import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FolderOpen, Sparkles, ChevronDown, Folder, FileText, Video, Plus, X, AlertCircle } from 'lucide-react';

const FileUploader = ({ onFilesSelected, subjects = [], selectedSubjectId, onSubjectChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showPathInput, setShowPathInput] = useState(false);
  const [pathInput, setPathInput] = useState('');
  const [pathType, setPathType] = useState('video');
  const [pendingFiles, setPendingFiles] = useState([]); // Files waiting for path confirmation
  const [basePath, setBasePath] = useState(''); // Base folder path for selected files
  const [showPathConfirm, setShowPathConfirm] = useState(false);
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
        // Show path confirmation dialog
        const validFiles = files.filter(f => {
          const type = f.type || '';
          return type.includes('video') || type.includes('pdf') || 
                 f.name.toLowerCase().endsWith('.pdf') ||
                 f.name.toLowerCase().match(/\.(mp4|mkv|avi|mov|webm)$/);
        });
        if (validFiles.length > 0) {
          setPendingFiles(validFiles);
          setShowPathConfirm(true);
        }
      }
    };

    processItems();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Show path confirmation dialog
      const validFiles = files.filter(f => {
        const type = f.type || '';
        return type.includes('video') || type.includes('pdf') || 
               f.name.toLowerCase().endsWith('.pdf') ||
               f.name.toLowerCase().match(/\.(mp4|mkv|avi|mov|webm)$/);
      });
      if (validFiles.length > 0) {
        setPendingFiles(validFiles);
        setShowPathConfirm(true);
      }
    }
    // Reset input
    e.target.value = '';
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Handle adding file by local path (manual entry)
  const handleAddByPath = useCallback(() => {
    if (!pathInput.trim()) return;
    
    const filePath = pathInput.trim();
    const fileName = filePath.split(/[/\\]/).pop();
    const type = filePath.toLowerCase().endsWith('.pdf') ? 'pdf' : 'video';
    
    const fileInfo = {
      name: fileName,
      type,
      file_path: filePath,
      file_id: `path-${Date.now()}-${fileName}`,
    };
    
    onFilesSelected([fileInfo], true);
    setPathInput('');
    setShowPathInput(false);
  }, [pathInput, onFilesSelected]);

  // Confirm pending files with base path
  const handleConfirmWithPath = useCallback(() => {
    const fileInfos = pendingFiles.map(file => {
      const relativePath = file.webkitRelativePath || file.name;
      const fullPath = basePath.trim() 
        ? `${basePath.trim().replace(/[\\/]$/, '')}${basePath.includes('/') ? '/' : '\\'}${relativePath}`
        : relativePath;
      
      const type = (file.type || '').includes('video') ? 'video' : 
                   (file.type || '').includes('pdf') || file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'video';
      
      return {
        name: file.name,
        type,
        file_path: fullPath,
        file_id: `path-${Date.now()}-${file.name}-${file.size}`,
      };
    });

    if (fileInfos.length > 0) {
      onFilesSelected(fileInfos, true);
    }
    
    setPendingFiles([]);
    setBasePath('');
    setShowPathConfirm(false);
  }, [pendingFiles, basePath, onFilesSelected]);

  // Cancel pending files
  const handleCancelPending = useCallback(() => {
    setPendingFiles([]);
    setBasePath('');
    setShowPathConfirm(false);
  }, []);

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
        justifyContent: 'center',
        flexWrap: 'wrap'
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
                const validFiles = files.filter(f => {
                  const type = f.type || '';
                  return type.includes('video') || type.includes('pdf') || 
                         f.name.toLowerCase().endsWith('.pdf') ||
                         f.name.toLowerCase().match(/\.(mp4|mkv|avi|mov|webm)$/);
                });
                if (validFiles.length > 0) {
                  setPendingFiles(validFiles);
                  setShowPathConfirm(true);
                }
              }
            };
            input.click();
          }}
        >
          <Upload size={16} />
          Select Files
        </motion.button>
        
        <motion.button
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowPathInput(!showPathInput);
          }}
        >
          <Plus size={16} />
          Add by Path
        </motion.button>
      </div>

      {/* Path Input Section */}
      {showPathInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Add File by Local Path</span>
            <button
              onClick={() => setShowPathInput(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => setPathType('video')}
              style={{
                padding: '0.5rem 0.75rem',
                background: pathType === 'video' ? 'var(--primary)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: pathType === 'video' ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
              }}
            >
              <Video size={14} />
              Video
            </button>
            <button
              onClick={() => setPathType('pdf')}
              style={{
                padding: '0.5rem 0.75rem',
                background: pathType === 'pdf' ? 'var(--primary)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: pathType === 'pdf' ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
              }}
            >
              <FileText size={14} />
              PDF
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddByPath()}
              placeholder="C:\Videos\lecture.mp4 or /home/user/docs/file.pdf"
              style={{
                flex: 1,
                padding: '0.625rem 0.75rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            />
            <motion.button
              className="btn btn-primary"
              style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddByPath}
              disabled={!pathInput.trim()}
            >
              Add
            </motion.button>
          </div>
          
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Enter the full local file path. The file will be streamed from your local system.
          </p>
        </motion.div>
      )}

      {/* Path Confirmation Modal */}
      {showPathConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCancelPending}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Provide Folder Path</h3>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Browsers don't provide full file paths for security. Enter the folder path where these files are located:
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Base Folder Path
              </label>
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="C:\Users\YourName\Videos or /home/user/videos"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Files to add ({pendingFiles.length})
              </label>
              <div style={{
                maxHeight: '150px',
                overflow: 'auto',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
              }}>
                {pendingFiles.map((file, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0',
                    fontSize: '0.8rem',
                  }}>
                    {file.type?.includes('video') || file.name.match(/\.(mp4|mkv|avi|mov|webm)$/i) ? (
                      <Video size={14} style={{ color: 'var(--primary)' }} />
                    ) : (
                      <FileText size={14} style={{ color: 'var(--warning)' }} />
                    )}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {file.webkitRelativePath || file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {basePath && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Example full path: </span>
                <code style={{ color: 'var(--primary)' }}>
                  {basePath.replace(/[\\/]$/, '')}{basePath.includes('/') ? '/' : '\\'}{pendingFiles[0]?.webkitRelativePath || pendingFiles[0]?.name}
                </code>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <motion.button
                className="btn btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelPending}
              >
                Cancel
              </motion.button>
              <motion.button
                className="btn btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmWithPath}
                disabled={!basePath.trim()}
              >
                Add {pendingFiles.length} File{pendingFiles.length > 1 ? 's' : ''}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUploader;
