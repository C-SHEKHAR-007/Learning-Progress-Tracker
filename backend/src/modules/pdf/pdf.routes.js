/**
 * PDF Routes
 * API endpoints for PDF-specific operations
 */
const express = require("express");
const router = express.Router();
const controller = require("./pdf.controller");
const { validateBody } = require("../../core/middleware");
const {
    updatePageProgressSchema,
    addBookmarkSchema,
    addNoteSchema,
    updateNoteSchema,
} = require("./pdf.validation");

// GET /api/pdf/:id/state - Get reading state
router.get("/:id/state", controller.getReadingState);

// PATCH /api/pdf/:id/page - Update page progress
router.patch("/:id/page", validateBody(updatePageProgressSchema), controller.updatePageProgress);

// GET /api/pdf/:id/stats - Get PDF statistics
router.get("/:id/stats", controller.getPdfStats);

// ==================== BOOKMARKS ====================

// GET /api/pdf/:id/bookmarks - Get all bookmarks
router.get("/:id/bookmarks", controller.getBookmarks);

// POST /api/pdf/:id/bookmarks - Add bookmark
router.post("/:id/bookmarks", validateBody(addBookmarkSchema), controller.addBookmark);

// DELETE /api/pdf/:id/bookmarks/:bookmarkId - Remove bookmark
router.delete("/:id/bookmarks/:bookmarkId", controller.removeBookmark);

// ==================== NOTES ====================

// GET /api/pdf/:id/notes - Get all notes
router.get("/:id/notes", controller.getNotes);

// POST /api/pdf/:id/notes - Add note
router.post("/:id/notes", validateBody(addNoteSchema), controller.addNote);

// PATCH /api/pdf/:id/notes/:noteId - Update note
router.patch("/:id/notes/:noteId", validateBody(updateNoteSchema), controller.updateNote);

// DELETE /api/pdf/:id/notes/:noteId - Remove note
router.delete("/:id/notes/:noteId", controller.removeNote);

module.exports = router;
