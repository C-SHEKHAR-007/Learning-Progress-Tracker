/**
 * Collection Routes
 * API endpoints for collection management
 */
const express = require("express");
const router = express.Router();
const controller = require("./collection.controller");
const { validateBody } = require("../../core/middleware");
const {
    createCollectionSchema,
    updateCollectionSchema,
    reorderCollectionsSchema,
} = require("./collection.validation");

// GET /api/collections - Get all collections
router.get("/", controller.getAll);

// GET /api/collections/:id - Get single collection
router.get("/:id", controller.getById);

// POST /api/collections - Create a new collection
router.post("/", validateBody(createCollectionSchema), controller.create);

// PATCH /api/collections/reorder - Reorder collections (must be before :id)
router.patch("/reorder", validateBody(reorderCollectionsSchema), controller.reorder);

// PATCH /api/collections/:id - Update collection
router.patch("/:id", validateBody(updateCollectionSchema), controller.update);

// DELETE /api/collections/:id - Delete collection
router.delete("/:id", controller.delete);

module.exports = router;
