const pool = require("../db");

const pdfService = {
  // Update PDF page position and progress
  async updatePageProgress(itemId, currentPage, totalPages, readingTime = 0) {
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
    const isCompleted = currentPage >= totalPages;
    const lastPosition = parseFloat(currentPage); // Separate variable for FLOAT column

    const result = await pool.query(
      `UPDATE learning_items 
       SET current_page = $1, 
           total_pages = $2, 
           progress = $3, 
           last_position = $4,
           reading_time = reading_time + $5,
           is_completed = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, current_page, total_pages, progress, is_completed`,
      [currentPage, totalPages, progress, lastPosition, readingTime, isCompleted, itemId],
    );
    return result.rows[0];
  },

  // Get PDF reading state
  async getReadingState(itemId) {
    const result = await pool.query(
      `SELECT id, current_page, total_pages, progress, bookmarks, notes, reading_time, is_completed
       FROM learning_items WHERE id = $1`,
      [itemId],
    );
    return result.rows[0];
  },

  // Add bookmark
  async addBookmark(itemId, bookmark) {
    const { page, title, color = "#fbbf24" } = bookmark;
    const newBookmark = {
      id: Date.now(),
      page,
      title: title || `Page ${page}`,
      color,
      created_at: new Date().toISOString(),
    };

    const result = await pool.query(
      `UPDATE learning_items 
       SET bookmarks = bookmarks || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify([newBookmark]), itemId],
    );
    return result.rows[0];
  },

  // Remove bookmark
  async removeBookmark(itemId, bookmarkId) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET bookmarks = (
         SELECT COALESCE(jsonb_agg(b), '[]'::jsonb)
         FROM jsonb_array_elements(bookmarks) b
         WHERE (b->>'id')::bigint != $1
       ),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [bookmarkId, itemId],
    );
    return result.rows[0];
  },

  // Get all bookmarks for a PDF
  async getBookmarks(itemId) {
    const result = await pool.query(`SELECT bookmarks FROM learning_items WHERE id = $1`, [itemId]);
    return result.rows[0]?.bookmarks || [];
  },

  // Add note
  async addNote(itemId, note) {
    const { page, content, highlight = "" } = note;
    const newNote = {
      id: Date.now(),
      page,
      content,
      highlight,
      created_at: new Date().toISOString(),
    };

    const result = await pool.query(
      `UPDATE learning_items 
       SET notes = notes || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify([newNote]), itemId],
    );
    return result.rows[0];
  },

  // Update note
  async updateNote(itemId, noteId, updates) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET notes = (
         SELECT jsonb_agg(
           CASE 
             WHEN (n->>'id')::bigint = $1 
             THEN n || $2::jsonb
             ELSE n 
           END
         )
         FROM jsonb_array_elements(notes) n
       ),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [noteId, JSON.stringify(updates), itemId],
    );
    return result.rows[0];
  },

  // Remove note
  async removeNote(itemId, noteId) {
    const result = await pool.query(
      `UPDATE learning_items 
       SET notes = (
         SELECT COALESCE(jsonb_agg(n), '[]'::jsonb)
         FROM jsonb_array_elements(notes) n
         WHERE (n->>'id')::bigint != $1
       ),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [noteId, itemId],
    );
    return result.rows[0];
  },

  // Get all notes for a PDF
  async getNotes(itemId) {
    const result = await pool.query(`SELECT notes FROM learning_items WHERE id = $1`, [itemId]);
    return result.rows[0]?.notes || [];
  },

  // Get PDF statistics
  async getPdfStats(itemId) {
    const result = await pool.query(
      `SELECT 
         current_page,
         total_pages,
         progress,
         reading_time,
         is_completed,
         jsonb_array_length(bookmarks) as bookmark_count,
         jsonb_array_length(notes) as note_count,
         created_at,
         updated_at
       FROM learning_items WHERE id = $1`,
      [itemId],
    );
    return result.rows[0];
  },
};

module.exports = pdfService;
