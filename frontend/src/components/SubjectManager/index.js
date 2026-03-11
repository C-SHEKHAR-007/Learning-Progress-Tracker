import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Folder,
  Palette
} from 'lucide-react';
import './styles.css';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1'
];

const SubjectManager = ({ subjects, onClose, onCreate, onUpdate, onDelete }) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newSubjectName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreate(newSubjectName.trim(), newSubjectColor);
      setNewSubjectName('');
      setNewSubjectColor('#6366f1');
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (subject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditColor(subject.color);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    
    try {
      await onUpdate(id, { name: editName.trim(), color: editColor });
      setEditingId(null);
    } catch (error) {
      // Error handled in parent
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subject? Items will be moved to Uncategorized.')) {
      try {
        await onDelete(id);
      } catch (error) {
        // Error handled in parent
      }
    }
  };

  return (
    <motion.div
      className="subject-manager-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="subject-manager"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="subject-manager-header">
          <div className="subject-manager-title">
            <Folder size={24} />
            <h2>Manage Subjects</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Create New Subject */}
        <div className="create-subject-section">
          <h3>
            <Plus size={16} />
            Create New Subject
          </h3>
          <div className="create-subject-form">
            <div className="color-picker-wrapper">
              <button
                className="color-preview"
                style={{ background: newSubjectColor }}
                onClick={() => setShowColorPicker(showColorPicker === 'new' ? null : 'new')}
              >
                <Palette size={16} />
              </button>
              {showColorPicker === 'new' && (
                <div className="color-picker-dropdown">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${newSubjectColor === color ? 'active' : ''}`}
                      style={{ background: color }}
                      onClick={() => {
                        setNewSubjectColor(color);
                        setShowColorPicker(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              className="subject-input"
              placeholder="Subject name (e.g., Mathematics, JavaScript)"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              disabled={!newSubjectName.trim() || isCreating}
            >
              <Plus size={18} />
              Add
            </motion.button>
          </div>
        </div>

        {/* Existing Subjects */}
        <div className="subjects-list-section">
          <h3>Your Subjects ({subjects.length})</h3>
          <div className="subjects-list">
            {subjects.length === 0 ? (
              <div className="no-subjects">
                <Folder size={32} />
                <p>No subjects yet</p>
                <span>Create subjects to organize your learning materials</span>
              </div>
            ) : (
              subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  className="subject-item"
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {editingId === subject.id ? (
                    <>
                      <div className="color-picker-wrapper">
                        <button
                          className="color-preview"
                          style={{ background: editColor }}
                          onClick={() => setShowColorPicker(showColorPicker === subject.id ? null : subject.id)}
                        >
                          <Palette size={14} />
                        </button>
                        {showColorPicker === subject.id && (
                          <div className="color-picker-dropdown">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                className={`color-option ${editColor === color ? 'active' : ''}`}
                                style={{ background: color }}
                                onClick={() => {
                                  setEditColor(color);
                                  setShowColorPicker(null);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        className="subject-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(subject.id)}
                        autoFocus
                      />
                      <button
                        className="action-btn save"
                        onClick={() => handleSaveEdit(subject.id)}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="action-btn cancel"
                        onClick={() => setEditingId(null)}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="subject-color-dot"
                        style={{ background: subject.color }}
                      />
                      <span className="subject-name">{subject.name}</span>
                      <div className="subject-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleStartEdit(subject)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(subject.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubjectManager;
