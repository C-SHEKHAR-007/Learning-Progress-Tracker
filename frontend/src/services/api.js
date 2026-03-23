import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== COLLECTIONS API ====================

export const collectionsApi = {
  // Get all collections
  getAll: async () => {
    const response = await api.get('/items/collections');
    return response.data;
  },

  // Create a new collection
  create: async (name, color = '#6366f1', icon = 'folder') => {
    const response = await api.post('/items/collections', { name, color, icon });
    return response.data;
  },

  // Update collection
  update: async (id, updates) => {
    const response = await api.patch(`/items/collections/${id}`, updates);
    return response.data;
  },

  // Delete collection
  delete: async (id) => {
    const response = await api.delete(`/items/collections/${id}`);
    return response.data;
  },

  // Reorder collections
  reorder: async (collections) => {
    const response = await api.patch('/items/collections/reorder', { collections });
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

  // Get items by collection
  getByCollection: async (collectionId) => {
    const response = await api.get(`/items/by-collection/${collectionId || 'null'}`);
    return response.data;
  },

  // Create items
  create: async (items, collectionId = null) => {
    const response = await api.post('/items', { items, collectionId });
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

  // Update item collection
  updateCollection: async (itemId, collectionId) => {
    const response = await api.patch(`/items/${itemId}/collection`, { collectionId });
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

  // Get file streaming URL for an item
  getFileUrl: (itemId) => {
    return `${API_URL}/items/${itemId}/file`;
  },
};

export default api;
