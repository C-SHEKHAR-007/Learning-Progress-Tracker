import { useState, useCallback } from 'react';
import { itemsApi, subjectsApi } from '../services/api';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== SUBJECTS ====================

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await subjectsApi.getAll();
      setSubjects(data);
      return data;
    } catch (err) {
      console.error('Error fetching subjects:', err);
      throw err;
    }
  }, []);

  const createSubject = useCallback(async (name, color, icon) => {
    try {
      const subject = await subjectsApi.create(name, color, icon);
      setSubjects(prev => [...prev, subject]);
      return subject;
    } catch (err) {
      console.error('Error creating subject:', err);
      throw err;
    }
  }, []);

  const updateSubject = useCallback(async (id, updates) => {
    try {
      const updated = await subjectsApi.update(id, updates);
      setSubjects(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      console.error('Error updating subject:', err);
      throw err;
    }
  }, []);

  const deleteSubject = useCallback(async (id) => {
    try {
      await subjectsApi.delete(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      // Update items that were in this subject
      setItems(prev => prev.map(item => 
        item.subject_id === id ? { ...item, subject_id: null, subject_name: null, subject_color: null } : item
      ));
    } catch (err) {
      console.error('Error deleting subject:', err);
      throw err;
    }
  }, []);

  const reorderSubjects = useCallback(async (reorderedSubjects) => {
    setSubjects(reorderedSubjects);
    try {
      await subjectsApi.reorder(reorderedSubjects);
    } catch (err) {
      console.error('Error reordering subjects:', err);
      await fetchSubjects();
      throw err;
    }
  }, [fetchSubjects]);

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

  const addItems = useCallback(async (newItems, subjectId = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsApi.create(newItems, subjectId);
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

  const updateItemSubject = useCallback(async (itemId, subjectId) => {
    try {
      const updated = await itemsApi.updateSubject(itemId, subjectId);
      // Find the subject to get its details
      const subject = subjects.find(s => s.id === subjectId);
      setItems(prev => prev.map(item => 
        item.id === itemId ? {
          ...updated,
          subject_name: subject?.name || null,
          subject_color: subject?.color || null,
          subject_icon: subject?.icon || null
        } : item
      ));
      return updated;
    } catch (err) {
      console.error('Error updating item subject:', err);
      throw err;
    }
  }, [subjects]);

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
    // Optimistic update
    setItems(reorderedItems);
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

  // Group items by subject
  const getItemsBySubject = useCallback(() => {
    const grouped = {};
    
    // Initialize with all subjects
    subjects.forEach(subject => {
      grouped[subject.id] = {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        icon: subject.icon,
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
      if (item.subject_id && grouped[item.subject_id]) {
        grouped[item.subject_id].items.push(item);
      } else {
        grouped['uncategorized'].items.push(item);
      }
    });
    
    // Sort groups by subject order and filter empty uncategorized
    const result = subjects.map(s => grouped[s.id]).filter(g => g && g.items.length > 0);
    if (grouped['uncategorized'].items.length > 0) {
      result.push(grouped['uncategorized']);
    }
    
    return result;
  }, [items, subjects]);

  return {
    items,
    subjects,
    loading,
    error,
    fetchItems,
    fetchSubjects,
    addItems,
    updateProgress,
    markCompleted,
    reorderItems,
    deleteItem,
    updateItem,
    deleteAllItems,
    createSubject,
    updateSubject,
    deleteSubject,
    reorderSubjects,
    updateItemSubject,
    getItemsBySubject,
  };
};

export default useItems;
