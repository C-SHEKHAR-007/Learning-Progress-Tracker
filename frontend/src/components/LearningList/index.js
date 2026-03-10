import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Video,
  FileText,
  Trash2,
  CheckCircle,
  PlayCircle,
  Clock,
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  ArrowRight
} from 'lucide-react';

const LearningList = ({
  groupedItems,
  subjects,
  selectedItem,
  onItemSelect,
  onReorder,
  onDelete,
  onMoveItem,
  loading
}) => {
  const [collapsedSubjects, setCollapsedSubjects] = useState(new Set());
  const [moveMenuOpen, setMoveMenuOpen] = useState(null);

  const toggleSubject = (subjectId) => {
    setCollapsedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    // Get all items flattened
    const allItems = groupedItems.flatMap(g => g.items);
    const reordered = Array.from(allItems);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    onReorder(reordered);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMoveItem = (itemId, subjectId) => {
    onMoveItem(itemId, subjectId);
    setMoveMenuOpen(null);
  };

  if (loading) {
    return (
      <div className="learning-list" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (groupedItems.length === 0 || groupedItems.every(g => g.items.length === 0)) {
    return (
      <div className="learning-list" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p>No items yet</p>
        <p style={{ fontSize: '0.875rem' }}>Upload a folder to get started</p>
      </div>
    );
  }

  // Flatten items for drag and drop while keeping subject groups for display
  let globalIndex = 0;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="learning-list">
        {(provided, snapshot) => (
          <div
            className="learning-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
              transition: 'background 0.2s ease'
            }}
          >
            {groupedItems.map((group) => {
              const isCollapsed = collapsedSubjects.has(group.subject.id || 'uncategorized');
              const subjectKey = group.subject.id || 'uncategorized';
              const completedCount = group.items.filter(i => i.is_completed).length;
              const progressPercent = group.items.length > 0 
                ? Math.round((completedCount / group.items.length) * 100) 
                : 0;

              return (
                <div key={subjectKey} className="subject-group">
                  {/* Subject Header */}
                  <motion.div
                    className="subject-header"
                    onClick={() => toggleSubject(subjectKey)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      borderLeft: `3px solid ${group.subject.color}`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isCollapsed ? 0 : 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </motion.div>
                    
                    {isCollapsed ? (
                      <Folder size={18} style={{ color: group.subject.color }} />
                    ) : (
                      <FolderOpen size={18} style={{ color: group.subject.color }} />
                    )}
                    
                    <span style={{ 
                      flex: 1, 
                      fontWeight: 600, 
                      color: 'var(--text-primary)',
                      fontSize: '0.9375rem'
                    }}>
                      {group.subject.name}
                    </span>
                    
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '10px'
                    }}>
                      {completedCount}/{group.items.length}
                    </span>

                    {/* Mini progress bar */}
                    <div style={{
                      width: '60px',
                      height: '4px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        background: group.subject.color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </motion.div>

                  {/* Items */}
                  <AnimatePresence>
                    {!isCollapsed && group.items.map((item) => {
                      const currentIndex = globalIndex++;
                      return (
                        <Draggable key={item.id} draggableId={String(item.id)} index={currentIndex}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`learning-item ${selectedItem?.id === item.id ? 'active' : ''} ${item.is_completed ? 'completed' : ''}`}
                              onClick={() => onItemSelect(item)}
                              style={{
                                ...provided.draggableProps.style,
                                position: 'relative',
                                marginLeft: '1rem',
                                transform: snapshot.isDragging 
                                  ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                                  : provided.draggableProps.style?.transform,
                                boxShadow: snapshot.isDragging 
                                  ? '0 10px 40px rgba(0, 0, 0, 0.4)' 
                                  : undefined,
                              }}
                            >
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="item-drag-handle"
                              >
                                <GripVertical size={16} />
                              </div>

                              {/* Thumbnail */}
                              <div className="item-thumbnail">
                                {item.type === 'video' ? (
                                  <Video size={24} />
                                ) : (
                                  <FileText size={24} />
                                )}
                              </div>

                              {/* Info */}
                              <div className="item-info">
                                <h4 className="item-name" title={item.name}>
                                  {item.name}
                                </h4>
                                <div className="item-meta">
                                  <span className={`item-type ${item.type}`}>
                                    {item.type === 'video' ? (
                                      <><PlayCircle size={12} /> Video</>
                                    ) : (
                                      <><FileText size={12} /> PDF</>
                                    )}
                                  </span>
                                  {item.duration > 0 && (
                                    <span>
                                      <Clock size={12} />
                                      {formatDuration(item.duration)}
                                    </span>
                                  )}
                                  {item.is_completed && (
                                    <span style={{ color: 'var(--success)' }}>
                                      <CheckCircle size={12} /> Done
                                    </span>
                                  )}
                                </div>
                                {item.progress > 0 && !item.is_completed && (
                                  <div className="item-progress-bar">
                                    <motion.div
                                      className="item-progress-fill"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.progress}%` }}
                                      transition={{ duration: 0.5 }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="item-actions" style={{ position: 'relative' }}>
                                {/* Move to Subject Button */}
                                <motion.button
                                  className="item-action-btn"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMoveMenuOpen(moveMenuOpen === item.id ? null : item.id);
                                  }}
                                  title="Move to subject"
                                >
                                  <MoreVertical size={14} />
                                </motion.button>
                                
                                {/* Move Menu */}
                                {moveMenuOpen === item.id && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      right: 0,
                                      top: '100%',
                                      marginTop: '0.25rem',
                                      background: 'var(--bg-elevated)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: 'var(--radius-md)',
                                      minWidth: '180px',
                                      zIndex: 100,
                                      boxShadow: 'var(--shadow-lg)',
                                      overflow: 'hidden'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div style={{
                                      padding: '0.5rem 0.75rem',
                                      fontSize: '0.75rem',
                                      color: 'var(--text-muted)',
                                      borderBottom: '1px solid var(--border-color)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      <ArrowRight size={12} />
                                      Move to subject
                                    </div>
                                    <button
                                      onClick={() => handleMoveItem(item.id, null)}
                                      style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        background: item.subject_id === null ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem'
                                      }}
                                    >
                                      <Folder size={14} style={{ opacity: 0.5 }} />
                                      Uncategorized
                                    </button>
                                    {subjects.map((subject) => (
                                      <button
                                        key={subject.id}
                                        onClick={() => handleMoveItem(item.id, subject.id)}
                                        style={{
                                          width: '100%',
                                          padding: '0.625rem 0.75rem',
                                          background: item.subject_id === subject.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                          border: 'none',
                                          color: 'var(--text-primary)',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          fontSize: '0.875rem'
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

                                <motion.button
                                  className="item-action-btn delete"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item);
                                  }}
                                  title="Remove"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </div>

                              {/* Completion indicator bar */}
                              {item.is_completed && (
                                <motion.div
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '3px',
                                    background: 'var(--success)',
                                    borderRadius: '0 2px 2px 0',
                                    transformOrigin: 'top'
                                  }}
                                />
                              )}
                            </motion.div>
                          )}
                        </Draggable>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default LearningList;
