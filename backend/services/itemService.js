const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const analyticsService = require('./analyticsService');

const itemService = {
  // ==================== COLLECTIONS ====================
  
  // Get all collections
  async getAllCollections() {
    const result = await pool.query(
      'SELECT * FROM collections ORDER BY order_index ASC'
    );
    return result.rows;
  },

  // Create a new collection
  async createCollection(name, color = '#6366f1', icon = 'folder') {
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) as max_order FROM collections'
    );
    const orderIndex = maxOrderResult.rows[0].max_order + 1;

    const result = await pool.query(
      `INSERT INTO collections (name, color, icon, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, color, icon, orderIndex]
    );
    return result.rows[0];
  },

  // Update collection
  async updateCollection(id, updates) {
    const { name, color, icon } = updates;
    const result = await pool.query(
      `UPDATE collections 
       SET name = COALESCE($1, name), 
           color = COALESCE($2, color), 
           icon = COALESCE($3, icon)
       WHERE id = $4
       RETURNING *`,
      [name, color, icon, id]
    );
    return result.rows[0];
  },

  // Delete collection
  async deleteCollection(id) {
    // Move items to no collection before deleting
    await pool.query('UPDATE learning_items SET collection_id = NULL WHERE collection_id = $1', [id]);
    const result = await pool.query('DELETE FROM collections WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Reorder collections
  async reorderCollections(collections) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < collections.length; i++) {
        await client.query(
          'UPDATE collections SET order_index = $1 WHERE id = $2',
          [i, collections[i].id]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // ==================== ITEMS ====================

  // Create multiple items
  async createItems(items, collectionId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get max order_index for this collection
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX(order_index), -1) as max_order FROM learning_items WHERE collection_id IS NOT DISTINCT FROM $1',
        [collectionId]
      );
      let orderIndex = maxOrderResult.rows[0].max_order + 1;

      const createdItems = [];
      
      for (const item of items) {
        const fileId = item.file_id || uuidv4();
        
        // Check if item already exists
        const existing = await client.query(
          'SELECT * FROM learning_items WHERE file_id = $1',
          [fileId]
        );
        
        if (existing.rows.length > 0) {
          createdItems.push(existing.rows[0]);
          continue;
        }

        const result = await client.query(
          `INSERT INTO learning_items (name, type, file_id, file_path, collection_id, order_index, duration, file_size, thumbnail)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [item.name, item.type, fileId, item.file_path || null, collectionId, orderIndex++, item.duration || 0, item.file_size || 0, item.thumbnail || null]
        );
        createdItems.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdItems;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get all items sorted by collection and order_index
  async getAllItems() {
    const result = await pool.query(
      `SELECT li.*, c.name as collection_name, c.color as collection_color, c.icon as collection_icon
       FROM learning_items li
       LEFT JOIN collections c ON li.collection_id = c.id
       ORDER BY COALESCE(c.order_index, 999), li.order_index ASC`
    );
    return result.rows;
  },

  // Get items by collection
  async getItemsByCollection(collectionId) {
    const result = await pool.query(
      `SELECT * FROM learning_items 
       WHERE collection_id IS NOT DISTINCT FROM $1
       ORDER BY order_index ASC`,
      [collectionId]
    );
    return result.rows;
  },

  // Get item by ID
  async getItemById(id) {
    const result = await pool.query(
      `SELECT li.*, c.name as collection_name, c.color as collection_color
       FROM learning_items li
       LEFT JOIN collections c ON li.collection_id = c.id
       WHERE li.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update item's collection
  async updateItemCollection(itemId, collectionId) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET collection_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [collectionId, itemId]
    );
    return result.rows[0];
  },

  // Update progress
  async updateProgress(id, progress, lastPosition, timeSpent = 0) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET progress = $1, last_position = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [progress, lastPosition, id]
    );
    
    // Log progress to history for analytics
    if (result.rows[0]) {
      try {
        await analyticsService.logProgress(id, progress, timeSpent);
      } catch (error) {
        // Don't fail the main operation if logging fails
        console.error('Error logging progress history:', error);
      }
    }
    
    return result.rows[0];
  },

  // Mark as completed
  async markCompleted(id, isCompleted) {
    const progress = isCompleted ? 100 : 0;
    const result = await pool.query(
      `UPDATE learning_items 
       SET is_completed = $1, progress = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [isCompleted, progress, id]
    );
    
    // Log completion to history for analytics
    if (result.rows[0]) {
      try {
        await analyticsService.logProgress(id, progress, 0);
      } catch (error) {
        console.error('Error logging completion history:', error);
      }
    }
    
    return result.rows[0];
  },

  // Reorder items
  async reorderItems(items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < items.length; i++) {
        await client.query(
          'UPDATE learning_items SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [i, items[i].id]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Update item metadata (name, duration, etc.)
  async updateItem(id, updates) {
    const { name, duration } = updates;
    const result = await pool.query(
      `UPDATE learning_items 
       SET name = COALESCE($1, name), 
           duration = COALESCE($2, duration),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [name, duration, id]
    );
    return result.rows[0];
  },

  // Delete item
  async deleteItem(id) {
    const result = await pool.query(
      'DELETE FROM learning_items WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Delete all items
  async deleteAllItems() {
    await pool.query('DELETE FROM learning_items');
  },

  // Get file path by item ID
  async getFilePath(id) {
    const result = await pool.query(
      'SELECT file_path, type, name FROM learning_items WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Update file path
  async updateFilePath(id, filePath) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET file_path = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [filePath, id]
    );
    return result.rows[0];
  }
};

module.exports = itemService;
