/**
 * Collection Controller
 * HTTP request handlers for collection endpoints
 */
const collectionService = require("./collection.service");
const { asyncHandler } = require("../../core/middleware");
const { NotFoundError, ConflictError } = require("../../core/errors");

const collectionController = {
    /**
     * GET /collections - Get all collections
     */
    getAll: asyncHandler(async (req, res) => {
        const collections = await collectionService.getAll();
        res.json(collections);
    }),

    /**
     * GET /collections/:id - Get single collection
     */
    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const collection = await collectionService.getById(id);
        if (!collection) {
            throw new NotFoundError("Collection", id);
        }
        res.json(collection);
    }),

    /**
     * POST /collections - Create a new collection
     */
    create: asyncHandler(async (req, res) => {
        const { name, color, icon } = req.body;

        try {
            const collection = await collectionService.create(name, color, icon);
            res.status(201).json(collection);
        } catch (error) {
            if (error.code === "23505") {
                throw new ConflictError("Collection already exists");
            }
            throw error;
        }
    }),

    /**
     * PATCH /collections/:id - Update collection
     */
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, color, icon } = req.body;

        const collection = await collectionService.update(id, { name, color, icon });
        if (!collection) {
            throw new NotFoundError("Collection", id);
        }
        res.json(collection);
    }),

    /**
     * DELETE /collections/:id - Delete collection
     */
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleted = await collectionService.delete(id);
        if (!deleted) {
            throw new NotFoundError("Collection", id);
        }
        res.json({ success: true });
    }),

    /**
     * PATCH /collections/reorder - Reorder collections
     */
    reorder: asyncHandler(async (req, res) => {
        const { collections } = req.body;
        await collectionService.reorder(collections);
        res.json({ success: true });
    }),
};

module.exports = collectionController;
