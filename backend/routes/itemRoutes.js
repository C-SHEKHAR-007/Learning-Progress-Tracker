const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// ==================== SUBJECTS ====================

// GET /api/items/subjects - Get all subjects
router.get('/subjects', itemController.getAllSubjects);

// POST /api/items/subjects - Create a new subject
router.post('/subjects', itemController.createSubject);

// PATCH /api/items/subjects/reorder - Reorder subjects
router.patch('/subjects/reorder', itemController.reorderSubjects);

// PATCH /api/items/subjects/:id - Update subject
router.patch('/subjects/:id', itemController.updateSubject);

// DELETE /api/items/subjects/:id - Delete subject
router.delete('/subjects/:id', itemController.deleteSubject);

// GET /api/items/by-subject/:subjectId - Get items by subject
router.get('/by-subject/:subjectId', itemController.getItemsBySubject);

// ==================== ITEMS ====================

// POST /api/items - Create new items
router.post('/', itemController.createItems);

// GET /api/items - Get all items
router.get('/', itemController.getAllItems);

// GET /api/items/:id - Get single item
router.get('/:id', itemController.getItem);

// PATCH /api/items/:id/progress - Update progress
router.patch('/:id/progress', itemController.updateProgress);

// PATCH /api/items/:id/complete - Mark as completed
router.patch('/:id/complete', itemController.markCompleted);

// PATCH /api/items/:id/subject - Update item subject
router.patch('/:id/subject', itemController.updateItemSubject);

// PATCH /api/items/reorder - Reorder items
router.patch('/reorder', itemController.reorderItems);

// PATCH /api/items/:id - Update item metadata
router.patch('/:id', itemController.updateItem);

// DELETE /api/items/:id - Delete item
router.delete('/:id', itemController.deleteItem);

// DELETE /api/items - Delete all items
router.delete('/', itemController.deleteAllItems);

// GET /api/items/:id/file - Serve file from local path
router.get('/:id/file', itemController.serveFile);

module.exports = router;
