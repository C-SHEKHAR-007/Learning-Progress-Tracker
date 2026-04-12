/**
 * PDF Service
 * Business logic for PDF-specific operations using Prisma
 */
const prisma = require("../../core/database/prisma");
const { DEFAULT_BOOKMARK_COLOR } = require("../../config/constants");

const pdfService = {
  /**
   * Update PDF page position and progress
   */
  async updatePageProgress(itemId, currentPage, totalPages, readingTime = 0) {
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
    const isCompleted = currentPage >= totalPages;
    const lastPosition = parseFloat(currentPage);

    // Use raw query for incrementing reading_time
    const result = await prisma.$queryRaw`
      UPDATE learning_items 
      SET current_page = ${currentPage}, 
          total_pages = ${totalPages}, 
          progress = ${progress}, 
          last_position = ${lastPosition},
          reading_time = reading_time + ${readingTime},
          is_completed = ${isCompleted},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(itemId)}
      RETURNING id, current_page, total_pages, progress, is_completed
    `;
    return result[0];
  },

  /**
   * Get PDF reading state
   */
  async getReadingState(itemId) {
    const item = await prisma.learningItem.findUnique({
      where: { id: parseInt(itemId) },
      select: {
        id: true,
        currentPage: true,
        totalPages: true,
        progress: true,
        bookmarks: true,
        notes: true,
        readingTime: true,
        isCompleted: true,
      },
    });
    
    if (!item) return null;
    
    return {
      id: item.id,
      current_page: item.currentPage,
      total_pages: item.totalPages,
      progress: item.progress,
      bookmarks: item.bookmarks,
      notes: item.notes,
      reading_time: item.readingTime,
      is_completed: item.isCompleted,
    };
  },

  /**
   * Add bookmark
   */
  async addBookmark(itemId, bookmark) {
    const { page, title, color = DEFAULT_BOOKMARK_COLOR } = bookmark;
    const newBookmark = {
      id: Date.now(),
      page,
      title: title || `Page ${page}`,
      color,
      created_at: new Date().toISOString(),
    };

    const result = await prisma.$queryRaw`
      UPDATE learning_items 
      SET bookmarks = bookmarks || ${JSON.stringify([newBookmark])}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(itemId)}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Remove bookmark
   */
  async removeBookmark(itemId, bookmarkId) {
    const result = await prisma.$queryRaw`
      UPDATE learning_items 
      SET bookmarks = (
        SELECT COALESCE(jsonb_agg(b), '[]'::jsonb)
        FROM jsonb_array_elements(bookmarks) b
        WHERE (b->>'id')::bigint != ${parseInt(bookmarkId)}
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(itemId)}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get all bookmarks for a PDF
   */
  async getBookmarks(itemId) {
    const item = await prisma.learningItem.findUnique({
      where: { id: parseInt(itemId) },
      select: { bookmarks: true },
    });
    return item?.bookmarks || [];
  },

  /**
   * Add note
   */
  async addNote(itemId, note) {
    const { page, content, highlight = "" } = note;
    const newNote = {
      id: Date.now(),
      page,
      content,
      highlight,
      created_at: new Date().toISOString(),
    };

    const result = await prisma.$queryRaw`
      UPDATE learning_items 
      SET notes = notes || ${JSON.stringify([newNote])}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(itemId)}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Update note
   */
  async updateNote(itemId, noteId, updates) {
    const result = await prisma.$queryRaw`
      UPDATE learning_items 
      SET notes = (
        SELECT jsonb_agg(
          CASE 
            WHEN (n->>'id')::bigint = ${parseInt(noteId)}
            THEN n || ${JSON.stringify(updates)}::jsonb
            ELSE n 
          END
        )
        FROM jsonb_array_elements(notes) n
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(itemId)}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Remove note
   */
  async removeNote(itemId, noteId) {
    const result = await prisma.$queryRaw`
      UPDATE learning_items 
      SET notes = (
        SELECT COALESCE(jsonb_agg(n), '[]'::jsonb)
        FROM jsonb_array_elements(notes) n
        WHERE (n->>'id')::bigint != ${parseInt(noteId)}
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(itemId)}
      RETURNING *
    `;
    return result[0];
  },

  /**
   * Get all notes for a PDF
   */
  async getNotes(itemId) {
    const item = await prisma.learningItem.findUnique({
      where: { id: parseInt(itemId) },
      select: { notes: true },
    });
    return item?.notes || [];
  },

  /**
   * Get PDF statistics
   */
  async getPdfStats(itemId) {
    const result = await prisma.$queryRaw`
      SELECT 
        current_page,
        total_pages,
        progress,
        reading_time,
        is_completed,
        jsonb_array_length(bookmarks) as bookmark_count,
        jsonb_array_length(notes) as note_count,
        created_at,
        updated_at
      FROM learning_items WHERE id = ${parseInt(itemId)}
    `;
    return result[0];
  },
};

module.exports = pdfService;
