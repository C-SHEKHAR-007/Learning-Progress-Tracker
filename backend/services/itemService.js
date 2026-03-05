const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const itemService = {
  // ==================== SUBJECTS ====================
  
  // Get all subjects
  async getAllSubjects() {
    const result = await pool.query(
      'SELECT * FROM subjects ORDER BY order_index ASC'
    );
    return result.rows;
  },

  // Create a new subject
  async createSubject(name, color = '#6366f1', icon = 'folder') {
    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) as max_order FROM subjects'
    );
    const orderIndex = maxOrderResult.rows[0].max_order + 1;

    const result = await pool.query(
      `INSERT INTO subjects (name, color, icon, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, color, icon, orderIndex]
    );
    return result.rows[0];
  },

  // Update subject
  async updateSubject(id, updates) {
    const { name, color, icon } = updates;
    const result = await pool.query(
      `UPDATE subjects 
       SET name = COALESCE($1, name), 
           color = COALESCE($2, color), 
           icon = COALESCE($3, icon)
       WHERE id = $4
       RETURNING *`,
      [name, color, icon, id]
    );
    return result.rows[0];
  },

  // Delete subject
  async deleteSubject(id) {
    // Move items to no subject before deleting
    await pool.query('UPDATE learning_items SET subject_id = NULL WHERE subject_id = $1', [id]);
    const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Reorder subjects
  async reorderSubjects(subjects) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < subjects.length; i++) {
        await client.query(
          'UPDATE subjects SET order_index = $1 WHERE id = $2',
          [i, subjects[i].id]
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
  async createItems(items, subjectId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get max order_index for this subject
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX(order_index), -1) as max_order FROM learning_items WHERE subject_id IS NOT DISTINCT FROM $1',
        [subjectId]
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
          `INSERT INTO learning_items (name, type, file_id, subject_id, order_index, duration, thumbnail)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [item.name, item.type, fileId, subjectId, orderIndex++, item.duration || 0, item.thumbnail || null]
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

  // Get all items sorted by subject and order_index
  async getAllItems() {
    const result = await pool.query(
      `SELECT li.*, s.name as subject_name, s.color as subject_color, s.icon as subject_icon
       FROM learning_items li
       LEFT JOIN subjects s ON li.subject_id = s.id
       ORDER BY COALESCE(s.order_index, 999), li.order_index ASC`
    );
    return result.rows;
  },

  // Get items by subject
  async getItemsBySubject(subjectId) {
    const result = await pool.query(
      `SELECT * FROM learning_items 
       WHERE subject_id IS NOT DISTINCT FROM $1
       ORDER BY order_index ASC`,
      [subjectId]
    );
    return result.rows;
  },

  // Get item by ID
  async getItemById(id) {
    const result = await pool.query(
      `SELECT li.*, s.name as subject_name, s.color as subject_color
       FROM learning_items li
       LEFT JOIN subjects s ON li.subject_id = s.id
       WHERE li.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update item's subject
  async updateItemSubject(itemId, subjectId) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET subject_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [subjectId, itemId]
    );
    return result.rows[0];
  },

  // Update progress
  async updateProgress(id, progress, lastPosition) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET progress = $1, last_position = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [progress, lastPosition, id]
    );
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

  // Update item metadata (name, etc.)
  async updateItem(id, updates) {
    const { name } = updates;
    const result = await pool.query(
      `UPDATE learning_items 
       SET name = COALESCE($1, name), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [name, id]
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
  }
};

module.exports = itemService;
