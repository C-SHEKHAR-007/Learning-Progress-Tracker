import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Folder,
  FolderPlus,
  GripVertical,
  Video,
  FileText,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  X,
  Save,
  Plus,
  Check,
  AlertCircle,
  File,
  Files,
  FolderOpen,
  HardDrive
} from 'lucide-react';
import './styles.css';

const Manage = ({ 
  items = [], 
  subjects = [], 
  onFilesSelected, 
  onReorder, 
  onDelete,
  onBulkDelete,
  onMoveItem,
  onBulkMove,
  onCreateSubject,
  onUpdateSubject,
  onDeleteSubject,
  onUpdateItem,
  getItemsBySubject
}) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [editingItem, setEditingItem] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSubjectId, setUploadSubjectId] = useState(null);
  const [showMoveMenu, setShowMoveMenu] = useState(null);
  
  // Path confirmation state
  const [pendingFiles, setPendingFiles] = useState([]);
  const [basePath, setBasePath] = useState('');
  const [showPathConfirm, setShowPathConfirm] = useState(false);

  // File input refs
  const singleFileInputRef = useRef(null);
  const multipleFileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Initialize expanded subjects when subjects load
  React.useEffect(() => {
    if (subjects.length > 0) {
      setExpandedSubjects(new Set([...subjects.map(s => s.id), null])); // null for uncategorized
    }
  }, [subjects]);

  const groupedItems = getItemsBySubject ? getItemsBySubject() : [];

  const presetColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#6b7280'
  ];

  // File upload handling
  // Filter valid files (videos and PDFs)
  const filterValidFiles = (files) => {
    return files.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      return isVideo || isPdf;
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = filterValidFiles(Array.from(e.dataTransfer.files));
    if (files.length > 0) {
      // Show path confirmation modal
      setPendingFiles(files);
      setShowPathConfirm(true);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const files = filterValidFiles(Array.from(e.target.files));
    if (files.length > 0) {
      // Show path confirmation modal
      setPendingFiles(files);
      setShowPathConfirm(true);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Confirm files with path
  const handleConfirmWithPath = useCallback(() => {
    const fileInfos = pendingFiles.map(file => {
      const relativePath = file.webkitRelativePath || file.name;
      const separator = basePath.includes('/') ? '/' : '\\';
      const fullPath = basePath.trim() 
        ? `${basePath.trim().replace(/[\\/]$/, '')}${separator}${relativePath}`
        : relativePath;
      
      const type = (file.type || '').includes('video') ? 'video' : 
                   (file.type || '').includes('pdf') || file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'video';
      
      return {
        name: file.name,
        type,
        file_path: fullPath,
        file_id: `path-${Date.now()}-${file.name}-${file.size}`,
        file_size: file.size || 0,
      };
    });

    if (fileInfos.length > 0) {
      onFilesSelected(fileInfos, uploadSubjectId);
    }
    
    setPendingFiles([]);
    setBasePath('');
    setShowPathConfirm(false);
    setUploadSubjectId(null);
  }, [pendingFiles, basePath, onFilesSelected, uploadSubjectId]);

  // Cancel path confirmation
  const handleCancelPath = useCallback(() => {
    setPendingFiles([]);
    setBasePath('');
    setShowPathConfirm(false);
    setUploadSubjectId(null);
  }, []);

  // Click handlers for different upload types
  const handleSingleFileClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    singleFileInputRef.current?.click();
  };

  const handleMultipleFilesClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    multipleFileInputRef.current?.click();
  };

  const handleFolderClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    folderInputRef.current?.click();
  };

  // Selection handling
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (window.confirm(`Delete ${selectedItems.size} item(s)?`)) {
      await onBulkDelete(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
  };

  const handleBulkMove = async (subjectId) => {
    await onBulkMove(Array.from(selectedItems), subjectId);
    setSelectedItems(new Set());
    setShowMoveMenu(null);
  };

  // Subject handling
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await onCreateSubject(newSubjectName.trim(), newSubjectColor);
      setNewSubjectName('');
      setNewSubjectColor('#6366f1');
      setShowSubjectModal(false);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handleUpdateSubjectName = async (subject) => {
    if (!editingSubject || editingSubject.name === subject.name) {
      setEditingSubject(null);
      return;
    }
    try {
      await onUpdateSubject(subject.id, { name: editingSubject.name });
      setEditingSubject(null);
    } catch (error) {
      // Error handled by parent
    }
  };

  // Drag and drop for reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Handle reordering within same subject
    if (source.droppableId === destination.droppableId) {
      const subjectId = source.droppableId === 'uncategorized' ? null : parseInt(source.droppableId.replace('subject-', ''));
      // Get items for this subject and sort by order_index to match visual order
      const subjectItems = items
        .filter(i => i.subject_id === subjectId)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      const [removed] = subjectItems.splice(source.index, 1);
      subjectItems.splice(destination.index, 0, removed);
      
      const reorderedItems = subjectItems.map((item, index) => ({
        id: item.id,
        order_index: index
      }));
      
      await onReorder(reorderedItems);
    } else {
      // Moving to different subject
      const itemId = parseInt(draggableId.replace('item-', ''));
      const newSubjectId = destination.droppableId === 'uncategorized' 
        ? null 
        : parseInt(destination.droppableId.replace('subject-', ''));
      await onMoveItem(itemId, newSubjectId);
    }
  };

  // Item editing
  const handleUpdateItemName = async (item) => {
    if (!editingItem || editingItem.name === item.name) {
      setEditingItem(null);
      return;
    }
    try {
      await onUpdateItem(item.id, { name: editingItem.name });
      setEditingItem(null);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <div className="manage">
      {/* Hidden file inputs - placed outside upload zone to avoid event conflicts */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept="video/*,.pdf,application/pdf"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <input
        ref={multipleFileInputRef}
        type="file"
        multiple
        accept="video/*,.pdf,application/pdf"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      <div className="manage-header">
        <h1>Manage Content</h1>
        <p>Upload, organize, and manage your learning materials</p>
      </div>

      {/* Upload Zone */}
      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="upload-icon">
          <Upload size={48} />
        </div>
        <h3>Drop files here to upload</h3>
        <p>Supports videos (MP4, WebM, etc.) and PDFs</p>

        {/* Upload buttons */}
        <div className="upload-buttons">
          <button 
            className="upload-btn"
            onClick={handleSingleFileClick}
            type="button"
          >
            <File size={18} />
            Single File
          </button>
          <button 
            className="upload-btn"
            onClick={handleMultipleFilesClick}
            type="button"
          >
            <Files size={18} />
            Multiple Files
          </button>
          <button 
            className="upload-btn"
            onClick={handleFolderClick}
            type="button"
          >
            <FolderOpen size={18} />
            Folder
          </button>
        </div>

        <div className="upload-target">
          <label>Upload to:</label>
          <select 
            value={uploadSubjectId || ''} 
            onChange={(e) => setUploadSubjectId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">No Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Toolbar */}
      <div className="manage-toolbar">
        <div className="toolbar-left">
          <button 
            className="select-all-btn"
            onClick={selectAll}
          >
            {selectedItems.size === items.length ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select All'}
          </button>
        </div>

        <div className="toolbar-right">
          {selectedItems.size > 0 && (
            <>
              <div className="move-menu-container">
                <button 
                  className="toolbar-btn"
                  onClick={() => setShowMoveMenu(showMoveMenu ? null : 'bulk')}
                >
                  <ArrowRight size={18} />
                  Move to
                </button>
                {showMoveMenu === 'bulk' && (
                  <div className="move-dropdown">
                    <button onClick={() => handleBulkMove(null)}>No Subject</button>
                    {subjects.map(subject => (
                      <button 
                        key={subject.id}
                        onClick={() => handleBulkMove(subject.id)}
                      >
                        <span 
                          className="color-dot"
                          style={{ background: subject.color }} 
                        />
                        {subject.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                className="toolbar-btn danger"
                onClick={handleBulkDelete}
              >
                <Trash2 size={18} />
                Delete ({selectedItems.size})
              </button>
            </>
          )}
          <button 
            className="toolbar-btn primary"
            onClick={() => setShowSubjectModal(true)}
          >
            <FolderPlus size={18} />
            New Subject
          </button>
        </div>
      </div>

      {/* Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="manage-content">
          {/* Subjects */}
          {groupedItems.map(group => (
            <div key={group.id || 'uncategorized'} className="subject-group">
              <div 
                className="subject-group-header"
                style={{ borderLeftColor: group.color }}
              >
                <button 
                  className="expand-btn"
                  onClick={() => toggleSubject(group.id)}
                >
                  {expandedSubjects.has(group.id) ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
                
                {editingSubject?.id === group.id ? (
                  <input
                    className="edit-input"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    onBlur={() => handleUpdateSubjectName(group)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateSubjectName(group)}
                    autoFocus
                  />
                ) : (
                  <span className="subject-name">{group.name}</span>
                )}
                
                <span className="item-count">{group.items.length} items</span>
                
                {group.id && (
                  <div className="subject-actions">
                    <button onClick={() => setEditingSubject({ id: group.id, name: group.name })}>
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="danger"
                      onClick={() => {
                        if (window.confirm(`Delete subject "${group.name}"? Items will be moved to uncategorized.`)) {
                          onDeleteSubject(group.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {expandedSubjects.has(group.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <Droppable droppableId={group.id ? `subject-${group.id}` : 'uncategorized'}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`items-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        >
                          {group.items.length === 0 ? (
                            <div className="empty-subject">
                              <p>No items in this subject</p>
                            </div>
                          ) : (
                            group.items.map((item, index) => (
                              <Draggable 
                                key={item.id} 
                                draggableId={`item-${item.id}`} 
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`manage-item ${snapshot.isDragging ? 'dragging' : ''} ${selectedItems.has(item.id) ? 'selected' : ''}`}
                                  >
                                    <button
                                      className="select-btn"
                                      onClick={() => toggleSelectItem(item.id)}
                                    >
                                      {selectedItems.has(item.id) ? (
                                        <CheckSquare size={18} />
                                      ) : (
                                        <Square size={18} />
                                      )}
                                    </button>
                                    
                                    <div {...provided.dragHandleProps} className="drag-handle">
                                      <GripVertical size={18} />
                                    </div>
                                    
                                    <div className="item-icon">
                                      {item.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                                    </div>
                                    
                                    <div className="item-info">
                                      {editingItem?.id === item.id ? (
                                        <input
                                          className="edit-input"
                                          value={editingItem.name}
                                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                          onBlur={() => handleUpdateItemName(item)}
                                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateItemName(item)}
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="item-name">{item.name}</span>
                                      )}
                                      <div className="item-meta">
                                        <span className="type-badge">{item.type}</span>
                                        {item.file_path ? (
                                          <span className="path-badge" title={`Path: ${item.file_path}`}>
                                            <HardDrive size={12} /> Stored
                                          </span>
                                        ) : (
                                          <span className="no-path-badge" title="No file path - won't work after refresh">
                                            ⚠ No path
                                          </span>
                                        )}
                                        {item.progress > 0 && (
                                          <span className="progress-badge">
                                            {item.is_completed ? '✓ Completed' : `${Math.round(item.progress)}%`}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="item-actions">
                                      <button onClick={() => setEditingItem({ id: item.id, name: item.name })}>
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        className="danger"
                                        onClick={() => {
                                          if (window.confirm(`Delete "${item.name}"?`)) {
                                            onDelete(item);
                                          }
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* New Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSubjectModal(false)}
          >
            <motion.div 
              className="modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Create New Subject</h3>
                <button onClick={() => setShowSubjectModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Subject Name</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g., Mathematics, Physics..."
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {presetColors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${newSubjectColor === color ? 'active' : ''}`}
                        style={{ background: color }}
                        onClick={() => setNewSubjectColor(color)}
                      >
                        {newSubjectColor === color && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowSubjectModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCreateSubject}>
                  <Plus size={18} />
                  Create Subject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Path Confirmation Modal */}
      <AnimatePresence>
        {showPathConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelPath}
          >
            <motion.div
              className="modal path-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <HardDrive size={24} />
                <h2>Provide Folder Path</h2>
                <button className="modal-close" onClick={handleCancelPath}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  Browsers don't provide full file paths for security. Enter the folder path where these files are located so they can be played after page refresh.
                </p>
                
                <div className="form-group">
                  <label>Base Folder Path</label>
                  <input
                    type="text"
                    value={basePath}
                    onChange={(e) => setBasePath(e.target.value)}
                    placeholder="C:\Users\YourName\Videos or /home/user/videos"
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Files to add ({pendingFiles.length})</label>
                  <div style={{
                    maxHeight: '150px',
                    overflow: 'auto',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                  }}>
                    {pendingFiles.map((file, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.25rem 0.5rem',
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
                    padding: '0.75rem', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Example full path: </span>
                    <code style={{ color: 'var(--primary)' }}>
                      {basePath.replace(/[\\/]$/, '')}{basePath.includes('/') ? '/' : '\\'}{pendingFiles[0]?.webkitRelativePath || pendingFiles[0]?.name}
                    </code>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Add to Subject</label>
                  <select 
                    value={uploadSubjectId || ''} 
                    onChange={(e) => setUploadSubjectId(e.target.value ? parseInt(e.target.value) : null)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="">No Subject (Uncategorized)</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={handleCancelPath}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleConfirmWithPath}
                  disabled={!basePath.trim()}
                >
                  <Check size={18} />
                  Add {pendingFiles.length} File{pendingFiles.length > 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Manage;
