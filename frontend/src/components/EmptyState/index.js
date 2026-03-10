import React from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

const EmptyState = () => {
  return (
    <motion.div
      className="viewer-empty"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="viewer-empty-icon"
        animate={{
          boxShadow: [
            '0 0 20px rgba(99, 102, 241, 0.2)',
            '0 0 40px rgba(99, 102, 241, 0.4)',
            '0 0 20px rgba(99, 102, 241, 0.2)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Play size={48} />
      </motion.div>

      <h2 className="viewer-empty-title">Ready to Learn?</h2>
      <p className="viewer-empty-text">
        Select a video or PDF from your library to start learning. Track your progress and pick up where you left off.
      </p>

      <div style={{
        display: 'flex',
        gap: '2rem',
        marginTop: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)'
          }}
          whileHover={{ scale: 1.05, background: 'var(--bg-elevated)' }}
        >
          <BookOpen size={20} />
          <span>Upload your content</span>
        </motion.div>

        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)'
          }}
          whileHover={{ scale: 1.05, background: 'var(--bg-elevated)' }}
        >
          <Sparkles size={20} />
          <span>Track your progress</span>
        </motion.div>
      </div>

      <motion.div
        style={{
          marginTop: '3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--accent-primary)',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span>Select an item from your library</span>
        <ArrowRight size={16} />
      </motion.div>
    </motion.div>
  );
};

export default EmptyState;
