import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Manage from './pages/Manage';
import Player from './pages/Player';
import Subjects from './pages/Subjects';
import useItems from './hooks/useItems';

function App() {
  const {
    items,
    subjects,
    loading,
    fetchItems,
    fetchSubjects,
    addItems,
    updateProgress,
    markCompleted,
    reorderItems,
    deleteItem,
    updateItem,
    createSubject,
    updateSubject,
    deleteSubject,
    updateItemSubject,
    getItemsBySubject,
  } = useItems();

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMap, setFileMap] = useState(new Map());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSubjects();
  }, [fetchItems, fetchSubjects]);

  // File upload handling
  const handleFilesSelected = useCallback(async (filesOrFileInfos, subjectIdOrIsPathBased = null) => {
    const newItems = [];
    const newFileMap = new Map(fileMap);
    
    // Determine if second param is subjectId (number/null) or isPathBased (boolean true)
    let subjectId = null;
    let isPathBased = false;
    
    if (typeof subjectIdOrIsPathBased === 'boolean') {
      isPathBased = subjectIdOrIsPathBased;
    } else {
      subjectId = subjectIdOrIsPathBased;
    }

    for (const item of filesOrFileInfos) {
      // Check if this is a path-based file info (has file_path property)
      if (item.file_path || isPathBased) {
        const type = item.type || (item.name?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'video');
        if (!type) continue;

        newItems.push({
          name: item.name,
          type,
          file_id: item.file_id || `path-${Date.now()}-${item.name}`,
          file_path: item.file_path,
          file_size: item.file_size || item.size || 0,
          duration: 0,
        });
      } else {
        // Handle traditional file objects
        const type = item.type?.includes('video') ? 'video' : 
                     item.type?.includes('pdf') ? 'pdf' : null;
        
        if (!type) continue;

        const fileId = `${item.name}-${item.size}-${item.lastModified}`;
        
        newItems.push({
          name: item.name,
          type,
          file_id: fileId,
          file_size: item.size || 0,
          duration: 0,
        });

        newFileMap.set(fileId, item);
      }
    }

    if (newItems.length === 0) {
      toast.warning('No valid video or PDF files found');
      return;
    }

    setFileMap(newFileMap);

    try {
      await addItems(newItems, subjectId);
      toast.success(`Added ${newItems.length} item(s) to your library`);
    } catch (error) {
      toast.error('Failed to add items');
    }
  }, [addItems, fileMap]);

  const handleItemSelect = useCallback((item) => {
    setSelectedItem(item);
    const file = fileMap.get(item.file_id);
    setSelectedFile(file || null);
  }, [fileMap]);

  const handleProgressUpdate = useCallback(async (progress, lastPosition) => {
    if (!selectedItem) return;
    
    try {
      await updateProgress(selectedItem.id, progress, lastPosition);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }, [selectedItem, updateProgress]);

  const handleMarkCompleted = useCallback(async (isCompleted) => {
    if (!selectedItem) return;

    try {
      const updated = await markCompleted(selectedItem.id, isCompleted);
      setSelectedItem(prev => ({ ...prev, ...updated }));
      toast.success(isCompleted ? '🎉 Marked as completed!' : 'Marked as incomplete');
    } catch (error) {
      toast.error('Failed to update status');
    }
  }, [selectedItem, markCompleted]);

  const handleReorder = useCallback(async (reorderedItems) => {
    try {
      await reorderItems(reorderedItems);
    } catch (error) {
      toast.error('Failed to save order');
    }
  }, [reorderItems]);

  const handleDelete = useCallback(async (item) => {
    try {
      await deleteItem(item.id);
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
        setSelectedFile(null);
      }
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  }, [deleteItem, selectedItem]);

  const handleUpdateItem = useCallback(async (id, updates) => {
    try {
      await updateItem(id, updates);
      toast.success('Item updated');
    } catch (error) {
      toast.error('Failed to update item');
      throw error;
    }
  }, [updateItem]);

  const handleCreateSubject = useCallback(async (name, color) => {
    try {
      await createSubject(name, color);
      toast.success(`Created subject: ${name}`);
    } catch (error) {
      if (error.response?.data?.error === 'Subject already exists') {
        toast.error('Subject already exists');
      } else {
        toast.error('Failed to create subject');
      }
      throw error;
    }
  }, [createSubject]);

  const handleUpdateSubject = useCallback(async (id, updates) => {
    try {
      await updateSubject(id, updates);
      toast.success('Subject updated');
    } catch (error) {
      toast.error('Failed to update subject');
      throw error;
    }
  }, [updateSubject]);

  const handleDeleteSubject = useCallback(async (id) => {
    try {
      await deleteSubject(id);
      toast.success('Subject deleted');
    } catch (error) {
      toast.error('Failed to delete subject');
      throw error;
    }
  }, [deleteSubject]);

  const handleMoveItem = useCallback(async (itemId, subjectId) => {
    try {
      await updateItemSubject(itemId, subjectId);
      toast.success('Item moved');
    } catch (error) {
      toast.error('Failed to move item');
    }
  }, [updateItemSubject]);

  // Calculate stats
  const stats = {
    total: items.length,
    completed: items.filter(i => i.is_completed).length,
    inProgress: items.filter(i => i.progress > 0 && !i.is_completed).length,
    avgProgress: items.length > 0 
      ? Math.round(items.reduce((acc, i) => acc + i.progress, 0) / items.length) 
      : 0,
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar 
          stats={stats} 
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        
        <main className={`main-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  items={items}
                  subjects={subjects}
                  stats={stats}
                  onItemSelect={handleItemSelect}
                  fileMap={fileMap}
                />
              } 
            />
            <Route 
              path="/library" 
              element={
                <Library 
                  items={items}
                  subjects={subjects}
                  onItemSelect={handleItemSelect}
                />
              } 
            />
            <Route 
              path="/manage" 
              element={
                <Manage 
                  items={items}
                  subjects={subjects}
                  onFilesSelected={handleFilesSelected}
                  onReorder={handleReorder}
                  onDelete={handleDelete}
                  onMoveItem={handleMoveItem}
                  onCreateSubject={handleCreateSubject}
                  onUpdateSubject={handleUpdateSubject}
                  onDeleteSubject={handleDeleteSubject}
                  onUpdateItem={handleUpdateItem}
                  getItemsBySubject={getItemsBySubject}
                />
              } 
            />
            <Route 
              path="/subjects" 
              element={
                <Subjects 
                  items={items}
                  subjects={subjects}
                  getItemsBySubject={getItemsBySubject}
                />
              } 
            />
            <Route 
              path="/player/:id" 
              element={
                <Player 
                  items={items}
                  fileMap={fileMap}
                  selectedItem={selectedItem}
                  onItemSelect={handleItemSelect}
                  onProgressUpdate={handleProgressUpdate}
                  onComplete={() => handleMarkCompleted(true)}
                />
              } 
            />
          </Routes>
        </main>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

export default App;
