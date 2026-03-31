const itemService = require("../services/itemService");
const fs = require("fs");
const path = require("path");

const itemController = {
  // ==================== COLLECTIONS ====================

  // Get all collections
  async getAllCollections(req, res) {
    try {
      const collections = await itemService.getAllCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create a new collection
  async createCollection(req, res) {
    try {
      const { name, color, icon } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Collection name is required" });
      }
      const collection = await itemService.createCollection(name, color, icon);
      res.status(201).json(collection);
    } catch (error) {
      console.error("Error creating collection:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        return res.status(400).json({ error: "Collection already exists" });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update collection
  async updateCollection(req, res) {
    try {
      const { id } = req.params;
      const { name, color, icon } = req.body;
      const collection = await itemService.updateCollection(id, { name, color, icon });
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error updating collection:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete collection
  async deleteCollection(req, res) {
    try {
      const { id } = req.params;
      const deleted = await itemService.deleteCollection(id);
      if (!deleted) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Reorder collections
  async reorderCollections(req, res) {
    try {
      const { collections } = req.body;
      if (!collections || !Array.isArray(collections)) {
        return res.status(400).json({ error: "Collections array is required" });
      }
      await itemService.reorderCollections(collections);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering collections:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ==================== ITEMS ====================

  // Create new items (batch upload)
  async createItems(req, res) {
    try {
      const { items, collectionId } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items array is required" });
      }
      const createdItems = await itemService.createItems(items, collectionId);
      res.status(201).json(createdItems);
    } catch (error) {
      console.error("Error creating items:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all items
  async getAllItems(req, res) {
    try {
      const items = await itemService.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get items by collection
  async getItemsByCollection(req, res) {
    try {
      const { collectionId } = req.params;
      const items = await itemService.getItemsByCollection(
        collectionId === "null" ? null : collectionId,
      );
      res.json(items);
    } catch (error) {
      console.error("Error fetching items by collection:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single item
  async getItem(req, res) {
    try {
      const { id } = req.params;
      const item = await itemService.getItemById(id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update item collection
  async updateItemCollection(req, res) {
    try {
      const { id } = req.params;
      const { collectionId } = req.body;
      const item = await itemService.updateItemCollection(id, collectionId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating item collection:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update progress
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress, last_position, time_spent } = req.body;
      const item = await itemService.updateProgress(id, progress, last_position, time_spent || 0);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Mark as completed
  async markCompleted(req, res) {
    try {
      const { id } = req.params;
      const { is_completed } = req.body;
      const item = await itemService.markCompleted(id, is_completed);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error marking completed:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Reorder items
  async reorderItems(req, res) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items array is required" });
      }
      await itemService.reorderItems(items);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering items:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update item metadata
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { name, duration } = req.body;
      const item = await itemService.updateItem(id, { name, duration });
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete item
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const deleted = await itemService.deleteItem(id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete all items
  async deleteAllItems(req, res) {
    try {
      await itemService.deleteAllItems();
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting all items:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Serve file from local path
  async serveFile(req, res) {
    try {
      const { id } = req.params;
      const item = await itemService.getFilePath(id);

      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      if (!item.file_path) {
        return res.status(404).json({ error: "File path not set for this item" });
      }

      const filePath = item.file_path;

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      // Determine content type
      const ext = path.extname(filePath).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".mp4") contentType = "video/mp4";
      else if (ext === ".webm") contentType = "video/webm";
      else if (ext === ".mkv") contentType = "video/x-matroska";
      else if (ext === ".avi") contentType = "video/x-msvideo";
      else if (ext === ".mov") contentType = "video/quicktime";
      else if (ext === ".pdf") contentType = "application/pdf";

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
        });

        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = itemController;
