import { useState, useCallback } from 'react';
import { itemsApi, collectionsApi } from '../services/api';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== COLLECTIONS ====================

  const fetchCollections = useCallback(async () => {
    try {
      const data = await collectionsApi.getAll();
      setCollections(data);
      return data;
    } catch (err) {
      console.error('Error fetching collections:', err);
      throw err;
    }
  }, []);

  const createCollection = useCallback(async (name, color, icon) => {
    try {
      const collection = await collectionsApi.create(name, color, icon);
      setCollections(prev => [...prev, collection]);
      return collection;
    } catch (err) {
      console.error('Error creating collection:', err);
      throw err;
    }
  }, []);

  const updateCollection = useCallback(async (id, updates) => {
    try {
      const updated = await collectionsApi.update(id, updates);
      setCollections(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      console.error('Error updating collection:', err);
      throw err;
    }
  }, []);

  const deleteCollection = useCallback(async (id) => {
    try {
      await collectionsApi.delete(id);
      setCollections(prev => prev.filter(c => c.id !== id));
      // Update items that were in this collection
      setItems(prev => prev.map(item => 
        item.collection_id === id ? { ...item, collection_id: null, collection_name: null, collection_color: null } : item
      ));
    } catch (err) {
      console.error('Error deleting collection:', err);
      throw err;
    }
  }, []);

  const reorderCollections = useCallback(async (reorderedCollections) => {
    setCollections(reorderedCollections);
    try {
      await collectionsApi.reorder(reorderedCollections);
    } catch (err) {
      console.error('Error reordering collections:', err);
      await fetchCollections();
      throw err;
    }
  }, [fetchCollections]);

  // ==================== ITEMS ====================

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsApi.getAll();
      setItems(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItems = useCallback(async (newItems, collectionId = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsApi.create(newItems, collectionId);
      setItems(prev => [...prev, ...data.filter(
        item => !prev.find(p => p.file_id === item.file_id)
      )]);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error adding items:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItemCollection = useCallback(async (itemId, collectionId) => {
    try {
      const updated = await itemsApi.updateCollection(itemId, collectionId);
      // Find the collection to get its details
      const collection = collections.find(c => c.id === collectionId);
      setItems(prev => prev.map(item => 
        item.id === itemId ? {
          ...updated,
          collection_name: collection?.name || null,
          collection_color: collection?.color || null,
          collection_icon: collection?.icon || null
        } : item
      ));
      return updated;
    } catch (err) {
      console.error('Error updating item collection:', err);
      throw err;
    }
  }, [collections]);

  const updateProgress = useCallback(async (id, progress, lastPosition) => {
    try {
      const updated = await itemsApi.updateProgress(id, progress, lastPosition);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updated } : item
      ));
      return updated;
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  }, []);

  const markCompleted = useCallback(async (id, isCompleted) => {
    try {
      const updated = await itemsApi.markCompleted(id, isCompleted);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updated } : item
      ));
      return updated;
    } catch (err) {
      console.error('Error marking completed:', err);
      throw err;
    }
  }, []);

  const reorderItems = useCallback(async (reorderedItems) => {
    // Create a map of id -> new order_index
    const orderMap = new Map(reorderedItems.map(item => [item.id, item.order_index]));
    
    // Optimistic update - only update order_index, preserve all other data
    setItems(prev => prev.map(item => {
      const newOrder = orderMap.get(item.id);
      return newOrder !== undefined ? { ...item, order_index: newOrder } : item;
    }));
    
    try {
      await itemsApi.reorder(reorderedItems);
    } catch (err) {
      console.error('Error reordering items:', err);
      // Revert on error
      await fetchItems();
      throw err;
    }
  }, [fetchItems]);

  const deleteItem = useCallback(async (id) => {
    try {
      await itemsApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id, updates) => {
    try {
      const updated = await itemsApi.update(id, updates);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updated } : item
      ));
      return updated;
    } catch (err) {
      console.error('Error updating item:', err);
      throw err;
    }
  }, []);

  const deleteAllItems = useCallback(async () => {
    try {
      await itemsApi.deleteAll();
      setItems([]);
    } catch (err) {
      console.error('Error deleting all items:', err);
      throw err;
    }
  }, []);

  // Group items by collection
  const getItemsByCollection = useCallback(() => {
    const grouped = {};
    
    // Initialize with all collections
    collections.forEach(collection => {
      grouped[collection.id] = {
        id: collection.id,
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        items: []
      };
    });
    
    // Add "Uncategorized" group
    grouped['uncategorized'] = {
      id: null,
      name: 'Uncategorized',
      color: '#64748b',
      icon: 'inbox',
      items: []
    };
    
    // Group items
    items.forEach(item => {
      if (item.collection_id && grouped[item.collection_id]) {
        grouped[item.collection_id].items.push(item);
      } else {
        grouped['uncategorized'].items.push(item);
      }
    });
    
    // Sort items within each group by order_index
    Object.values(grouped).forEach(group => {
      group.items.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    });
    
    // Sort groups by collection order and filter empty uncategorized
    const result = collections.map(c => grouped[c.id]).filter(g => g && g.items.length > 0);
    if (grouped['uncategorized'].items.length > 0) {
      result.push(grouped['uncategorized']);
    }
    
    return result;
  }, [items, collections]);

  return {
    items,
    collections,
    loading,
    error,
    fetchItems,
    fetchCollections,
    addItems,
    updateProgress,
    markCompleted,
    reorderItems,
    deleteItem,
    updateItem,
    deleteAllItems,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    updateItemCollection,
    getItemsByCollection,
  };
};

export default useItems;
