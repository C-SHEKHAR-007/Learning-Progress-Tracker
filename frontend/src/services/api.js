import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== SUBJECTS API ====================

export const subjectsApi = {
  // Get all subjects
  getAll: async () => {
    const response = await api.get('/items/subjects');
    return response.data;
  },

  // Create a new subject
  create: async (name, color = '#6366f1', icon = 'folder') => {
    const response = await api.post('/items/subjects', { name, color, icon });
    return response.data;
  },

  // Update subject
  update: async (id, updates) => {
    const response = await api.patch(`/items/subjects/${id}`, updates);
    return response.data;
  },

  // Delete subject
  delete: async (id) => {
    const response = await api.delete(`/items/subjects/${id}`);
    return response.data;
  },

  // Reorder subjects
  reorder: async (subjects) => {
    const response = await api.patch('/items/subjects/reorder', { subjects });
    return response.data;
  },
};

// ==================== ITEMS API ====================

export const itemsApi = {
  // Get all items
  getAll: async () => {
    const response = await api.get('/items');
    return response.data;
  },

  // Get single item
  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  // Get items by subject
  getBySubject: async (subjectId) => {
    const response = await api.get(`/items/by-subject/${subjectId || 'null'}`);
    return response.data;
  },

  // Create items
  create: async (items, subjectId = null) => {
    const response = await api.post('/items', { items, subjectId });
    return response.data;
  },

  // Update progress
  updateProgress: async (id, progress, lastPosition) => {
    const response = await api.patch(`/items/${id}/progress`, {
      progress,
      last_position: lastPosition,
    });
    return response.data;
  },

  // Mark as completed
  markCompleted: async (id, isCompleted) => {
    const response = await api.patch(`/items/${id}/complete`, {
      is_completed: isCompleted,
    });
    return response.data;
  },

  // Update item subject
  updateSubject: async (itemId, subjectId) => {
    const response = await api.patch(`/items/${itemId}/subject`, { subjectId });
    return response.data;
  },

  // Reorder items
  reorder: async (items) => {
    const response = await api.patch('/items/reorder', { items });
    return response.data;
  },

  // Update item metadata
  update: async (id, updates) => {
    const response = await api.patch(`/items/${id}`, updates);
    return response.data;
  },

  // Delete item
  delete: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  // Delete all items
  deleteAll: async () => {
    const response = await api.delete('/items');
    return response.data;
  },
};

export default api;
