/**
 * Initial database migration
 * Creates all required tables and indexes
 */

const MIGRATION_NAME = "001_initial_schema";

const up = `
  -- Collections table
  CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Learning items table
  CREATE TABLE IF NOT EXISTS learning_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'pdf')),
    file_id TEXT UNIQUE NOT NULL,
    file_path TEXT,
    collection_id INT REFERENCES collections(id) ON DELETE SET NULL,
    order_index INT DEFAULT 0,
    progress FLOAT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_position FLOAT DEFAULT 0,
    duration FLOAT DEFAULT 0,
    file_size BIGINT DEFAULT 0,
    thumbnail TEXT,
    current_page INT DEFAULT 1,
    total_pages INT DEFAULT 0,
    bookmarks JSONB DEFAULT '[]',
    notes JSONB DEFAULT '[]',
    reading_time INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Progress history table for analytics
  CREATE TABLE IF NOT EXISTS progress_history (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES learning_items(id) ON DELETE CASCADE,
    progress FLOAT NOT NULL,
    time_spent INT DEFAULT 0,
    session_date DATE DEFAULT CURRENT_DATE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_learning_items_order ON learning_items(order_index);
  CREATE INDEX IF NOT EXISTS idx_learning_items_type ON learning_items(type);
  CREATE INDEX IF NOT EXISTS idx_learning_items_collection ON learning_items(collection_id);
  CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(order_index);
  CREATE INDEX IF NOT EXISTS idx_progress_history_item ON progress_history(item_id);
  CREATE INDEX IF NOT EXISTS idx_progress_history_date ON progress_history(session_date);
  CREATE INDEX IF NOT EXISTS idx_progress_history_recorded ON progress_history(recorded_at);
`;

const down = `
  DROP TABLE IF EXISTS progress_history;
  DROP TABLE IF EXISTS learning_items;
  DROP TABLE IF EXISTS collections;
`;

module.exports = { MIGRATION_NAME, up, down };
