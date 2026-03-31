const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

// ==================== COLLECTIONS ====================

// GET /api/items/collections - Get all collections
router.get("/collections", itemController.getAllCollections);

// POST /api/items/collections - Create a new collection
router.post("/collections", itemController.createCollection);

// PATCH /api/items/collections/reorder - Reorder collections
router.patch("/collections/reorder", itemController.reorderCollections);

// PATCH /api/items/collections/:id - Update collection
router.patch("/collections/:id", itemController.updateCollection);

// DELETE /api/items/collections/:id - Delete collection
router.delete("/collections/:id", itemController.deleteCollection);

// GET /api/items/by-collection/:collectionId - Get items by collection
router.get("/by-collection/:collectionId", itemController.getItemsByCollection);

// ==================== ITEMS ====================

// POST /api/items - Create new items
router.post("/", itemController.createItems);

// GET /api/items - Get all items
router.get("/", itemController.getAllItems);

// GET /api/items/:id - Get single item
router.get("/:id", itemController.getItem);

// PATCH /api/items/:id/progress - Update progress
router.patch("/:id/progress", itemController.updateProgress);

// PATCH /api/items/:id/complete - Mark as completed
router.patch("/:id/complete", itemController.markCompleted);

// PATCH /api/items/:id/collection - Update item collection
router.patch("/:id/collection", itemController.updateItemCollection);

// PATCH /api/items/reorder - Reorder items
router.patch("/reorder", itemController.reorderItems);

// PATCH /api/items/:id - Update item metadata
router.patch("/:id", itemController.updateItem);

// DELETE /api/items/:id - Delete item
router.delete("/:id", itemController.deleteItem);

// DELETE /api/items - Delete all items
router.delete("/", itemController.deleteAllItems);

// GET /api/items/:id/file - Serve file from local path
router.get("/:id/file", itemController.serveFile);

module.exports = router;
