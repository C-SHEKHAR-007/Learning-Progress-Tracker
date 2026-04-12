/**
 * Collection Service
 * Business logic for collection operations
 */
const pool = require("../../core/database");
const { DEFAULT_COLLECTION_COLOR, DEFAULT_COLLECTION_ICON } = require("../../config/constants");

const collectionService = {
  /**
   * Get all collections ordered by order_index
   */
  async getAll() {
    const result = await pool.query("SELECT * FROM collections ORDER BY order_index ASC");
    return result.rows;
  },

  /**
   * Get collection by ID
   */
  async getById(id) {
    const result = await pool.query("SELECT * FROM collections WHERE id = $1", [id]);
    return result.rows[0];
  },

  /**
   * Create a new collection
   */
  async create(name, color = DEFAULT_COLLECTION_COLOR, icon = DEFAULT_COLLECTION_ICON) {
    const maxOrderResult = await pool.query(
      "SELECT COALESCE(MAX(order_index), -1) as max_order FROM collections"
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

  /**
   * Update collection
   */
  async update(id, updates) {
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

  /**
   * Delete collection (moves items to uncategorized)
   */
  async delete(id) {
    // Move items to no collection before deleting
    await pool.query("UPDATE learning_items SET collection_id = NULL WHERE collection_id = $1", [
      id,
    ]);
    const result = await pool.query("DELETE FROM collections WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
  },

  /**
   * Reorder collections
   */
  async reorder(collections) {
    return pool.transaction(async (client) => {
      for (let i = 0; i < collections.length; i++) {
        await client.query("UPDATE collections SET order_index = $1 WHERE id = $2", [
          i,
          collections[i].id,
        ]);
      }
    });
  },
};

module.exports = collectionService;
