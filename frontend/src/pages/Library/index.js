import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Grid,
  List,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Play,
  Folder,
  ChevronDown,
  X,
  HardDrive
} from 'lucide-react';
import './styles.css';

const Library = ({ items, subjects, onItemSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'video', 'pdf'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'in-progress', 'not-started'
  const [filterSubject, setFilterSubject] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }

      // Status filter
      if (filterStatus === 'completed' && !item.is_completed) return false;
      if (filterStatus === 'in-progress' && (item.progress === 0 || item.is_completed)) return false;
      if (filterStatus === 'not-started' && item.progress > 0) return false;

      // Subject filter
      if (filterSubject !== 'all' && item.subject_id !== parseInt(filterSubject)) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, filterType, filterStatus, filterSubject]);

  // Group by subject
  const groupedItems = useMemo(() => {
    const groups = {};
    
    filteredItems.forEach(item => {
      const subject = subjects.find(s => s.id === item.subject_id);
      const subjectName = subject ? subject.name : 'Uncategorized';
      const subjectId = subject ? subject.id : 0;
      
      if (!groups[subjectId]) {
        groups[subjectId] = {
          id: subjectId,
          name: subjectName,
          color: subject?.color || '#6b7280',
          items: []
        };
      }
      groups[subjectId].items.push(item);
    });

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredItems, subjects]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterSubject('all');
  };

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterSubject !== 'all';

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
  };

  return (
    <div className="library">
      {/* Header */}
      <div className="library-header">
        <h1>My Library</h1>
        <p>{filteredItems.length} items</p>
      </div>

      {/* Search and Filters */}
      <div className="library-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <button 
            className={`filter-toggle ${showFilters || hasActiveFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && <span className="filter-badge" />}
          </button>

          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="filter-group">
              <label>Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="pdf">PDFs</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Subject</label>
              <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <X size={16} />
                Clear All
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="library-empty">
          <Folder size={48} />
          <p>No items found</p>
          {hasActiveFilters && (
            <button onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="library-grid">
          {filteredItems.map(item => (
            <Link
              key={item.id}
              to={`/player/${item.id}`}
              className="library-card"
              onClick={() => onItemSelect(item)}
            >
              <div className="card-thumbnail">
                {item.type === 'video' ? <Video size={32} /> : <FileText size={32} />}
                {item.is_completed && (
                  <div className="completed-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
                {item.file_path && (
                  <div className="file-stored-badge" title="File path stored - available after refresh">
                    <HardDrive size={14} />
                  </div>
                )}
                {!item.file_path && (
                  <div className="file-missing-badge" title="No file path - will be unavailable after refresh">
                    <span style={{ fontSize: '10px', color: 'var(--warning)' }}>!</span>
                  </div>
                )}
                <div className="play-overlay">
                  <Play size={24} />
                </div>
              </div>
              <div className="card-info">
                <h3>{item.name}</h3>
                <div className="card-meta">
                  {item.type === 'video' && item.duration > 0 && (
                    <span className="duration">⏱ {formatDuration(item.duration)}</span>
                  )}
                  {item.file_size > 0 && (
                    <span className="file-size">📁 {formatFileSize(item.file_size)}</span>
                  )}
                  <span className="type-badge">{item.type}</span>
                </div>
                {item.progress > 0 && !item.is_completed && (
                  <div className="card-progress">
                    <div 
                      className="card-progress-fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="library-list">
          {groupedItems.map(group => (
            <div key={group.id} className="list-group">
              <div 
                className="list-group-header"
                style={{ borderLeftColor: group.color }}
              >
                <Folder size={18} />
                <span>{group.name}</span>
                <span className="group-count">{group.items.length}</span>
              </div>
              {group.items.map(item => (
                <Link
                  key={item.id}
                  to={`/player/${item.id}`}
                  className="list-item"
                  onClick={() => onItemSelect(item)}
                >
                  <div className="list-item-icon">
                    {item.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="list-item-info">
                    <h4>{item.name}</h4>
                    {item.progress > 0 && !item.is_completed && (
                      <div className="list-item-progress">
                        <div 
                          className="list-item-progress-fill"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="list-item-meta">
                    {item.type === 'video' && item.duration > 0 && (
                      <span className="duration">{formatDuration(item.duration)}</span>
                    )}
                    {item.file_size > 0 && (
                      <span className="file-size">{formatFileSize(item.file_size)}</span>
                    )}
                    {item.is_completed ? (
                      <CheckCircle size={18} className="completed" />
                    ) : item.progress > 0 ? (
                      <Clock size={18} className="in-progress" />
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
