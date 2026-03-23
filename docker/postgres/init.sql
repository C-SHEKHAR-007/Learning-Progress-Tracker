-- PostgreSQL initialization script for Learning Progress Tracker
-- This script runs automatically when the PostgreSQL container is first created

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create learning_items table
CREATE TABLE IF NOT EXISTS learning_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'pdf')),
    file_id TEXT UNIQUE NOT NULL,
    collection_id INT REFERENCES collections(id) ON DELETE SET NULL,
    order_index INT DEFAULT 0,
    progress FLOAT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_position FLOAT DEFAULT 0,
    duration FLOAT DEFAULT 0,
    thumbnail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_items_order ON learning_items(order_index);
CREATE INDEX IF NOT EXISTS idx_learning_items_type ON learning_items(type);
CREATE INDEX IF NOT EXISTS idx_learning_items_collection ON learning_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(order_index);

-- Insert default collection if none exists
INSERT INTO collections (name, color, icon, order_index)
VALUES ('General', '#6366f1', 'folder', 0)
ON CONFLICT (name) DO NOTHING;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE '✅ Database initialized successfully with tables: collections, learning_items';
END $$;
