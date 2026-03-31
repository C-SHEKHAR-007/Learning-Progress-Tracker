const pdfService = require("../services/pdfService");

const pdfController = {
  // Update PDF page progress
  async updatePageProgress(req, res) {
    try {
      const { id } = req.params;
      const { currentPage, totalPages, readingTime } = req.body;

      if (currentPage === undefined || totalPages === undefined) {
        return res.status(400).json({ error: "currentPage and totalPages are required" });
      }

      // Parse values to ensure correct types
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
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating page progress:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get reading state
  async getReadingState(req, res) {
    try {
      const { id } = req.params;
      const state = await pdfService.getReadingState(id);
      if (!state) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(state);
    } catch (error) {
      console.error("Error getting reading state:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Add bookmark
  async addBookmark(req, res) {
    try {
      const { id } = req.params;
      const { page, title, color } = req.body;

      if (page === undefined) {
        return res.status(400).json({ error: "Page number is required" });
      }

      const item = await pdfService.addBookmark(id, { page, title, color });
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Remove bookmark
  async removeBookmark(req, res) {
    try {
      const { id, bookmarkId } = req.params;
      const item = await pdfService.removeBookmark(id, parseInt(bookmarkId));
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get bookmarks
  async getBookmarks(req, res) {
    try {
      const { id } = req.params;
      const bookmarks = await pdfService.getBookmarks(id);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error getting bookmarks:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Add note
  async addNote(req, res) {
    try {
      const { id } = req.params;
      const { page, content, highlight } = req.body;

      if (page === undefined || !content) {
        return res.status(400).json({ error: "Page number and content are required" });
      }

      const item = await pdfService.addNote(id, { page, content, highlight });
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error adding note:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update note
  async updateNote(req, res) {
    try {
      const { id, noteId } = req.params;
      const { content, highlight } = req.body;

      const item = await pdfService.updateNote(id, parseInt(noteId), { content, highlight });
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Remove note
  async removeNote(req, res) {
    try {
      const { id, noteId } = req.params;
      const item = await pdfService.removeNote(id, parseInt(noteId));
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error removing note:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get notes
  async getNotes(req, res) {
    try {
      const { id } = req.params;
      const notes = await pdfService.getNotes(id);
      res.json(notes);
    } catch (error) {
      console.error("Error getting notes:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get PDF stats
  async getPdfStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await pdfService.getPdfStats(id);
      if (!stats) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(stats);
    } catch (error) {
      console.error("Error getting PDF stats:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = pdfController;
