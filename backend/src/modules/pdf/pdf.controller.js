/**
 * PDF Controller
 * HTTP request handlers for PDF-specific endpoints
 */
const pdfService = require("./pdf.service");
const { asyncHandler } = require("../../core/middleware");
const { NotFoundError } = require("../../core/errors");

const pdfController = {
    /**
     * GET /pdf/:id/state - Get reading state
     */
    getReadingState: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const state = await pdfService.getReadingState(id);
        if (!state) {
            throw new NotFoundError("Item", id);
        }
        res.json(state);
    }),

    /**
     * PATCH /pdf/:id/page - Update page progress
     */
    updatePageProgress: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { currentPage, totalPages, readingTime } = req.body;

        const parsedCurrentPage = parseInt(currentPage, 10);
        const parsedTotalPages = parseInt(totalPages, 10);
        const parsedReadingTime = parseInt(readingTime, 10) || 0;

        const item = await pdfService.updatePageProgress(
            id,
            parsedCurrentPage,
            parsedTotalPages,
            parsedReadingTime,
        );
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * GET /pdf/:id/stats - Get PDF statistics
     */
    getPdfStats: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const stats = await pdfService.getPdfStats(id);
        if (!stats) {
            throw new NotFoundError("Item", id);
        }
        res.json(stats);
    }),

    /**
     * GET /pdf/:id/bookmarks - Get all bookmarks
     */
    getBookmarks: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const bookmarks = await pdfService.getBookmarks(id);
        res.json(bookmarks);
    }),

    /**
     * POST /pdf/:id/bookmarks - Add bookmark
     */
    addBookmark: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { page, title, color } = req.body;

        const item = await pdfService.addBookmark(id, { page, title, color });
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * DELETE /pdf/:id/bookmarks/:bookmarkId - Remove bookmark
     */
    removeBookmark: asyncHandler(async (req, res) => {
        const { id, bookmarkId } = req.params;
        const item = await pdfService.removeBookmark(id, parseInt(bookmarkId));
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * GET /pdf/:id/notes - Get all notes
     */
    getNotes: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const notes = await pdfService.getNotes(id);
        res.json(notes);
    }),

    /**
     * POST /pdf/:id/notes - Add note
     */
    addNote: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { page, content, highlight } = req.body;

        const item = await pdfService.addNote(id, { page, content, highlight });
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * PATCH /pdf/:id/notes/:noteId - Update note
     */
    updateNote: asyncHandler(async (req, res) => {
        const { id, noteId } = req.params;
        const { content, highlight } = req.body;

        const item = await pdfService.updateNote(id, parseInt(noteId), { content, highlight });
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * DELETE /pdf/:id/notes/:noteId - Remove note
     */
    removeNote: asyncHandler(async (req, res) => {
        const { id, noteId } = req.params;
        const item = await pdfService.removeNote(id, parseInt(noteId));
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),
};

module.exports = pdfController;
