import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import VideoPlayer from '../../components/VideoPlayer';
import PDFViewer from '../../components/PDFViewer';
import './styles.css';

const Player = ({ 
  items, 
  fileMap, 
  selectedItem,
  onItemSelect,
  onProgressUpdate, 
  onComplete 
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the item
  const item = items.find(i => i.id === parseInt(id)) || selectedItem;
  const file = item ? fileMap.get(item.file_id) : null;
  
  // Check if item has a local file path (streamed from backend)
  const hasFilePath = item?.file_path;

  useEffect(() => {
    if (item && (!selectedItem || selectedItem.id !== item.id)) {
      onItemSelect(item);
    }
  }, [item, selectedItem, onItemSelect]);

  if (!item) {
    return (
      <div className="player-page">
        <div className="player-not-found">
          <h2>Item not found</h2>
          <p>The requested item could not be found in your library.</p>
          <Link to="/library" className="back-link">
            <ArrowLeft size={18} />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="player-page">
      {/* Header */}
      <motion.div 
        className="player-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="player-title">
          <h1>{item.name}</h1>
          <span className="player-type">{item.type === 'video' ? 'Video' : 'PDF Document'}</span>
        </div>
        <Link to="/" className="home-btn">
          <Home size={20} />
        </Link>
      </motion.div>

      {/* Content */}
      <div className="player-content">
        {!file && !hasFilePath ? (
          <div className="player-no-file">
            <h3>File not available</h3>
            <p>Please re-upload this file or add it by path to continue watching.</p>
            <Link to="/manage" className="upload-link">
              Go to Manage
            </Link>
          </div>
        ) : item.type === 'video' ? (
          <VideoPlayer
            item={item}
            file={file}
            onProgressUpdate={onProgressUpdate}
            onComplete={onComplete}
          />
        ) : (
          <PDFViewer
            item={item}
            file={file}
            onComplete={onComplete}
            isCompleted={item.is_completed}
          />
        )}
      </div>
    </div>
  );
};

export default Player;
