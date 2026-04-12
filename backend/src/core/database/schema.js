/**
 * Database schema initialization
 * Creates tables and seeds default data
 */
require("dotenv").config();
const pool = require("./index");
const { up } = require("./migrations/001_initial_schema");
const { seed } = require("./seeds/default");
const logger = require("../utils/logger");

/**
 * Create all database tables
 * Runs migrations and seeds
 */
const createTables = async () => {
  const query = `
    ${up}
    
    -- Add missing columns for backwards compatibility
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='file_path') THEN
        ALTER TABLE learning_items ADD COLUMN file_path TEXT;
      END IF;
    END $$;

    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='file_size') THEN
        ALTER TABLE learning_items ADD COLUMN file_size BIGINT DEFAULT 0;
      END IF;
    END $$;

    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='current_page') THEN
        ALTER TABLE learning_items ADD COLUMN current_page INT DEFAULT 1;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='total_pages') THEN
        ALTER TABLE learning_items ADD COLUMN total_pages INT DEFAULT 0;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='bookmarks') THEN
        ALTER TABLE learning_items ADD COLUMN bookmarks JSONB DEFAULT '[]';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='notes') THEN
        ALTER TABLE learning_items ADD COLUMN notes JSONB DEFAULT '[]';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='learning_items' AND column_name='reading_time') THEN
        ALTER TABLE learning_items ADD COLUMN reading_time INT DEFAULT 0;
      END IF;
    END $$;

    ${seed}
  `;

  try {
    await pool.query(query);
    logger.info("Database tables created successfully");
  } catch (error) {
    logger.error("Error creating tables", { error: error.message });
    throw error;
  }
};

module.exports = { createTables };

// Run if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      logger.info("Schema initialization complete");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Schema initialization failed", { error: error.message });
      process.exit(1);
    });
}
