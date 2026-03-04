const itemService = require('../services/itemService');

const itemController = {
  // ==================== SUBJECTS ====================

  // Get all subjects
  async getAllSubjects(req, res) {
    try {
      const subjects = await itemService.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create a new subject
  async createSubject(req, res) {
    try {
      const { name, color, icon } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Subject name is required' });
      }
      const subject = await itemService.createSubject(name, color, icon);
      res.status(201).json(subject);
    } catch (error) {
      console.error('Error creating subject:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Subject already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update subject
  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const { name, color, icon } = req.body;
      const subject = await itemService.updateSubject(id, { name, color, icon });
      if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      res.json(subject);
    } catch (error) {
      console.error('Error updating subject:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete subject
  async deleteSubject(req, res) {
    try {
      const { id } = req.params;
      const deleted = await itemService.deleteSubject(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Reorder subjects
  async reorderSubjects(req, res) {
    try {
      const { subjects } = req.body;
      if (!subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ error: 'Subjects array is required' });
      }
      await itemService.reorderSubjects(subjects);
      res.json({ success: true });
    } catch (error) {
      console.error('Error reordering subjects:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // ==================== ITEMS ====================

  // Create new items (batch upload)
  async createItems(req, res) {
    try {
      const { items, subjectId } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }
      const createdItems = await itemService.createItems(items, subjectId);
      res.status(201).json(createdItems);
    } catch (error) {
      console.error('Error creating items:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all items
  async getAllItems(req, res) {
    try {
      const items = await itemService.getAllItems();
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get items by subject
  async getItemsBySubject(req, res) {
    try {
      const { subjectId } = req.params;
      const items = await itemService.getItemsBySubject(subjectId === 'null' ? null : subjectId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching items by subject:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single item
  async getItem(req, res) {
    try {
      const { id } = req.params;
      const item = await itemService.getItemById(id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update item subject
  async updateItemSubject(req, res) {
    try {
      const { id } = req.params;
      const { subjectId } = req.body;
      const item = await itemService.updateItemSubject(id, subjectId);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error updating item subject:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update progress
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress, last_position } = req.body;
      const item = await itemService.updateProgress(id, progress, last_position);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error updating progress:', error);
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
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error marking completed:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Reorder items
  async reorderItems(req, res) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
      }
      await itemService.reorderItems(items);
      res.json({ success: true });
    } catch (error) {
      console.error('Error reordering items:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update item metadata
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const item = await itemService.updateItem(id, { name });
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete item
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const deleted = await itemService.deleteItem(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete all items
  async deleteAllItems(req, res) {
    try {
      await itemService.deleteAllItems();
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting all items:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = itemController;
