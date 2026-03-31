const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdfController");

// GET /api/pdf/:id/state - Get reading state
router.get("/:id/state", pdfController.getReadingState);

// PATCH /api/pdf/:id/page - Update page progress
router.patch("/:id/page", pdfController.updatePageProgress);

// GET /api/pdf/:id/stats - Get PDF statistics
router.get("/:id/stats", pdfController.getPdfStats);

// ==================== BOOKMARKS ====================

// GET /api/pdf/:id/bookmarks - Get all bookmarks
router.get("/:id/bookmarks", pdfController.getBookmarks);

// POST /api/pdf/:id/bookmarks - Add bookmark
router.post("/:id/bookmarks", pdfController.addBookmark);

// DELETE /api/pdf/:id/bookmarks/:bookmarkId - Remove bookmark
router.delete("/:id/bookmarks/:bookmarkId", pdfController.removeBookmark);

// ==================== NOTES ====================

// GET /api/pdf/:id/notes - Get all notes
router.get("/:id/notes", pdfController.getNotes);

// POST /api/pdf/:id/notes - Add note
router.post("/:id/notes", pdfController.addNote);

// PATCH /api/pdf/:id/notes/:noteId - Update note
router.patch("/:id/notes/:noteId", pdfController.updateNote);

// DELETE /api/pdf/:id/notes/:noteId - Remove note
router.delete("/:id/notes/:noteId", pdfController.removeNote);

module.exports = router;
