/**
 * Item Routes
 * API endpoints for learning item management
 */
const express = require("express");
const router = express.Router();
const controller = require("./item.controller");
const { validateBody } = require("../../core/middleware");
const {
  createItemsSchema,
  updateItemSchema,
  updateProgressSchema,
  markCompletedSchema,
  reorderItemsSchema,
} = require("./item.validation");

// POST /api/items - Create new items
router.post("/", validateBody(createItemsSchema), controller.create);

// GET /api/items - Get all items
router.get("/", controller.getAll);

// GET /api/items/by-collection/:collectionId - Get items by collection
router.get("/by-collection/:collectionId", controller.getByCollection);

// PATCH /api/items/reorder - Reorder items (must be before :id)
router.patch("/reorder", validateBody(reorderItemsSchema), controller.reorder);

// GET /api/items/:id - Get single item
router.get("/:id", controller.getById);

// PATCH /api/items/:id/progress - Update progress
router.patch("/:id/progress", validateBody(updateProgressSchema), controller.updateProgress);

// PATCH /api/items/:id/complete - Mark as completed
router.patch("/:id/complete", validateBody(markCompletedSchema), controller.markCompleted);

// PATCH /api/items/:id/collection - Update item collection
router.patch("/:id/collection", controller.updateCollection);

// PATCH /api/items/:id - Update item metadata
router.patch("/:id", validateBody(updateItemSchema), controller.update);

// DELETE /api/items/:id - Delete item
router.delete("/:id", controller.delete);

// DELETE /api/items - Delete all items
router.delete("/", controller.deleteAll);

// GET /api/items/:id/file - Serve file from local path
router.get("/:id/file", controller.serveFile);

module.exports = router;
