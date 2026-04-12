/**
 * Item Controller
 * HTTP request handlers for learning item endpoints
 */
const fs = require("fs");
const path = require("path");
const itemService = require("./item.service");
const { asyncHandler } = require("../../core/middleware");
const { NotFoundError, ValidationError } = require("../../core/errors");
const { CONTENT_TYPES } = require("../../config/constants");

const itemController = {
    /**
     * POST /items - Create new items (batch upload)
     */
    create: asyncHandler(async (req, res) => {
        const { items, collectionId } = req.body;
        const createdItems = await itemService.createBatch(items, collectionId);
        res.status(201).json(createdItems);
    }),

    /**
     * GET /items - Get all items
     */
    getAll: asyncHandler(async (req, res) => {
        const items = await itemService.getAll();
        res.json(items);
    }),

    /**
     * GET /items/by-collection/:collectionId - Get items by collection
     */
    getByCollection: asyncHandler(async (req, res) => {
        const { collectionId } = req.params;
        const items = await itemService.getByCollection(
            collectionId === "null" ? null : collectionId,
        );
        res.json(items);
    }),

    /**
     * GET /items/:id - Get single item
     */
    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const item = await itemService.getById(id);
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * PATCH /items/:id/collection - Update item collection
     */
    updateCollection: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { collectionId } = req.body;
        const item = await itemService.updateCollection(id, collectionId);
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * PATCH /items/:id/progress - Update progress
     */
    updateProgress: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { progress, last_position, time_spent } = req.body;
        const item = await itemService.updateProgress(id, progress, last_position, time_spent || 0);
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * PATCH /items/:id/complete - Mark as completed
     */
    markCompleted: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { is_completed } = req.body;
        const item = await itemService.markCompleted(id, is_completed);
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * PATCH /items/reorder - Reorder items
     */
    reorder: asyncHandler(async (req, res) => {
        const { items } = req.body;
        await itemService.reorder(items);
        res.json({ success: true });
    }),

    /**
     * PATCH /items/:id - Update item metadata
     */
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, duration } = req.body;
        const item = await itemService.update(id, { name, duration });
        if (!item) {
            throw new NotFoundError("Item", id);
        }
        res.json(item);
    }),

    /**
     * DELETE /items/:id - Delete item
     */
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleted = await itemService.delete(id);
        if (!deleted) {
            throw new NotFoundError("Item", id);
        }
        res.json({ success: true });
    }),

    /**
     * DELETE /items - Delete all items
     */
    deleteAll: asyncHandler(async (req, res) => {
        await itemService.deleteAll();
        res.json({ success: true });
    }),

    /**
     * GET /items/:id/file - Serve file from local path
     */
    serveFile: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const item = await itemService.getFilePath(id);

        if (!item) {
            throw new NotFoundError("Item", id);
        }

        if (!item.file_path) {
            throw new ValidationError("File path not set for this item");
        }

        const filePath = item.file_path;

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new NotFoundError("File not found on disk");
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

        // Handle range requests for video streaming
        if (range && item.type === "video") {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const fileStream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": contentType,
            });

            fileStream.pipe(res);
        } else {
            // Send entire file for PDFs or non-range requests
            res.writeHead(200, {
                "Content-Length": fileSize,
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${encodeURIComponent(item.name)}"`,
            });

            fs.createReadStream(filePath).pipe(res);
        }
    }),
};

module.exports = itemController;
