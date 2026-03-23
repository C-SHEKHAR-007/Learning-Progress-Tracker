require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('./index');

const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS collections (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT 'folder',
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add file_path column if it doesn't exist (for existing databases)
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='file_path') THEN
        ALTER TABLE learning_items ADD COLUMN file_path TEXT;
      END IF;
    END $$;

    -- Add file_size column if it doesn't exist
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='file_size') THEN
        ALTER TABLE learning_items ADD COLUMN file_size BIGINT DEFAULT 0;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_learning_items_order ON learning_items(order_index);
    CREATE INDEX IF NOT EXISTS idx_learning_items_type ON learning_items(type);
    CREATE INDEX IF NOT EXISTS idx_learning_items_collection ON learning_items(collection_id);
    CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(order_index);

    -- Insert default collection if none exists
    INSERT INTO collections (name, color, icon, order_index)
    VALUES ('General', '#6366f1', 'folder', 0)
    ON CONFLICT (name) DO NOTHING;
  `;

  try {
    await pool.query(query);
    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

module.exports = { createTables };

// Run if called directly
if (require.main === module) {
  createTables().then(() => {
    console.log('Schema initialization complete');
    process.exit(0);
  });
}
