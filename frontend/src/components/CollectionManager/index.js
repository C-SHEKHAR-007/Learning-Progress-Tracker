import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Edit2, Check, Folder, Palette } from "lucide-react";
import "./styles.css";

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
];

const CollectionManager = ({ collections, onClose, onCreate, onUpdate, onDelete }) => {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState("#6366f1");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(newCollectionName.trim(), newCollectionColor);
      setNewCollectionName("");
      setNewCollectionColor("#6366f1");
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (collection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
    setEditColor(collection.color);
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
    if (window.confirm("Delete this collection? Items will be moved to Uncategorized.")) {
      try {
        await onDelete(id);
      } catch (error) {
        // Error handled in parent
      }
    }
  };

  return (
    <motion.div
      className="collection-manager-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="collection-manager"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="collection-manager-header">
          <div className="collection-manager-title">
            <Folder size={24} />
            <h2>Manage Collections</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Create New Collection */}
        <div className="create-collection-section">
          <h3>
            <Plus size={16} />
            Create New Collection
          </h3>
          <div className="create-collection-form">
            <div className="color-picker-wrapper">
              <button
                className="color-preview"
                style={{ background: newCollectionColor }}
                onClick={() => setShowColorPicker(showColorPicker === "new" ? null : "new")}
              >
                <Palette size={16} />
              </button>
              {showColorPicker === "new" && (
                <div className="color-picker-dropdown">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${newCollectionColor === color ? "active" : ""}`}
                      style={{ background: color }}
                      onClick={() => {
                        setNewCollectionColor(color);
                        setShowColorPicker(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              className="collection-input"
              placeholder="Collection name (e.g., Mathematics, JavaScript)"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              disabled={!newCollectionName.trim() || isCreating}
            >
              <Plus size={18} />
              Add
            </motion.button>
          </div>
        </div>

        {/* Existing Collections */}
        <div className="collections-list-section">
          <h3>Your Collections ({collections.length})</h3>
          <div className="collections-list">
            {collections.length === 0 ? (
              <div className="no-collections">
                <Folder size={32} />
                <p>No collections yet</p>
                <span>Create collections to organize your learning materials</span>
              </div>
            ) : (
              collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  className="collection-item"
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {editingId === collection.id ? (
                    <>
                      <div className="color-picker-wrapper">
                        <button
                          className="color-preview"
                          style={{ background: editColor }}
                          onClick={() =>
                            setShowColorPicker(
                              showColorPicker === collection.id ? null : collection.id,
                            )
                          }
                        >
                          <Palette size={14} />
                        </button>
                        {showColorPicker === collection.id && (
                          <div className="color-picker-dropdown">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                className={`color-option ${editColor === color ? "active" : ""}`}
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
                        className="collection-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(collection.id)}
                        autoFocus
                      />
                      <button
                        className="action-btn save"
                        onClick={() => handleSaveEdit(collection.id)}
                      >
                        <Check size={16} />
                      </button>
                      <button className="action-btn cancel" onClick={() => setEditingId(null)}>
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="collection-color-dot"
                        style={{ background: collection.color }}
                      />
                      <span className="collection-name">{collection.name}</span>
                      <div className="collection-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleStartEdit(collection)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(collection.id)}
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

export default CollectionManager;
