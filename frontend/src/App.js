import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Manage from "./pages/Manage";
import Player from "./pages/Player";
import Collections from "./pages/Collections";
import ProgressMap from "./pages/ProgressMap";
import useItems from "./hooks/useItems";

// Inner component that has access to useLocation
function AppContent() {
  const location = useLocation();
  const isPlayerPage = location.pathname.startsWith("/player");

  const {
    items,
    collections,
    loading,
    fetchItems,
    fetchCollections,
    addItems,
    updateProgress,
    markCompleted,
    reorderItems,
    deleteItem,
    updateItem,
    createCollection,
    updateCollection,
    deleteCollection,
    updateItemCollection,
    getItemsByCollection,
  } = useItems();

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMap, setFileMap] = useState(new Map());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCollections();
  }, [fetchItems, fetchCollections]);

  // File upload handling
  const handleFilesSelected = useCallback(
    async (filesOrFileInfos, collectionId = null) => {
      const newItems = [];
      const newFileMap = new Map(fileMap);

      for (const item of filesOrFileInfos) {
        // Check if this is a path-based file info (has file_path property)
        if (item.file_path) {
          const type = item.type || (item.name?.toLowerCase().endsWith(".pdf") ? "pdf" : "video");
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
          const type = item.type?.includes("video")
            ? "video"
            : item.type?.includes("pdf")
              ? "pdf"
              : null;

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
        toast.warning("No valid video or PDF files found");
        return;
      }

      setFileMap(newFileMap);

      try {
        await addItems(newItems, collectionId);
        toast.success(`Added ${newItems.length} item(s) to your library`);
      } catch (error) {
        toast.error("Failed to add items");
      }
    },
    [addItems, fileMap],
  );

  const handleItemSelect = useCallback(
    (item) => {
      setSelectedItem(item);
      const file = fileMap.get(item.file_id);
      setSelectedFile(file || null);
    },
    [fileMap],
  );

  const handleProgressUpdate = useCallback(
    async (progress, lastPosition) => {
      if (!selectedItem) return;

      try {
        await updateProgress(selectedItem.id, progress, lastPosition);
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    },
    [selectedItem, updateProgress],
  );

  const handleMarkCompleted = useCallback(
    async (isCompleted) => {
      if (!selectedItem) return;

      try {
        const updated = await markCompleted(selectedItem.id, isCompleted);
        setSelectedItem((prev) => ({ ...prev, ...updated }));
        toast.success(isCompleted ? "🎉 Marked as completed!" : "Marked as incomplete");
      } catch (error) {
        toast.error("Failed to update status");
      }
    },
    [selectedItem, markCompleted],
  );

  const handleReorder = useCallback(
    async (reorderedItems) => {
      try {
        await reorderItems(reorderedItems);
      } catch (error) {
        toast.error("Failed to save order");
      }
    },
    [reorderItems],
  );

  const handleDelete = useCallback(
    async (item, showToast = true) => {
      try {
        await deleteItem(item.id);
        if (selectedItem?.id === item.id) {
          setSelectedItem(null);
          setSelectedFile(null);
        }
        if (showToast) {
          toast.success("Item removed");
        }
      } catch (error) {
        if (showToast) {
          toast.error("Failed to remove item");
        }
        throw error;
      }
    },
    [deleteItem, selectedItem],
  );

  const handleBulkDelete = useCallback(
    async (itemIds) => {
      let successCount = 0;
      let failCount = 0;

      for (const itemId of itemIds) {
        const item = { id: itemId };
        try {
          await handleDelete(item, false);
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} item(s) removed`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`${successCount} item(s) removed, ${failCount} failed`);
      } else if (failCount > 0) {
        toast.error(`Failed to remove ${failCount} item(s)`);
      }
    },
    [handleDelete],
  );

  const handleUpdateItem = useCallback(
    async (id, updates) => {
      try {
        await updateItem(id, updates);
        toast.success("Item updated");
      } catch (error) {
        toast.error("Failed to update item");
        throw error;
      }
    },
    [updateItem],
  );

  const handleCreateCollection = useCallback(
    async (name, color) => {
      try {
        await createCollection(name, color);
        toast.success(`Created collection: ${name}`);
      } catch (error) {
        if (error.response?.data?.error === "Collection already exists") {
          toast.error("Collection already exists");
        } else {
          toast.error("Failed to create collection");
        }
        throw error;
      }
    },
    [createCollection],
  );

  const handleUpdateCollection = useCallback(
    async (id, updates) => {
      try {
        await updateCollection(id, updates);
        toast.success("Collection updated");
      } catch (error) {
        toast.error("Failed to update collection");
        throw error;
      }
    },
    [updateCollection],
  );

  const handleDeleteCollection = useCallback(
    async (id) => {
      try {
        await deleteCollection(id);
        toast.success("Collection deleted");
      } catch (error) {
        toast.error("Failed to delete collection");
        throw error;
      }
    },
    [deleteCollection],
  );

  const handleMoveItem = useCallback(
    async (itemId, collectionId, showToast = true) => {
      try {
        await updateItemCollection(itemId, collectionId);
        if (showToast) {
          toast.success("Item moved");
        }
      } catch (error) {
        if (showToast) {
          toast.error("Failed to move item");
        }
        throw error;
      }
    },
    [updateItemCollection],
  );

  const handleBulkMove = useCallback(
    async (itemIds, collectionId) => {
      let successCount = 0;
      let failCount = 0;

      for (const itemId of itemIds) {
        try {
          await handleMoveItem(itemId, collectionId, false);
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} item(s) moved`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`${successCount} item(s) moved, ${failCount} failed`);
      } else if (failCount > 0) {
        toast.error(`Failed to move ${failCount} item(s)`);
      }
    },
    [handleMoveItem],
  );

  // Calculate stats
  const stats = {
    total: items.length,
    completed: items.filter((i) => i.is_completed).length,
    inProgress: items.filter((i) => i.progress > 0 && !i.is_completed).length,
    avgProgress:
      items.length > 0
        ? Math.round(items.reduce((acc, i) => acc + i.progress, 0) / items.length)
        : 0,
  };

  return (
    <div className="app-layout">
      {!isPlayerPage && (
        <Sidebar stats={stats} isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      )}

      <main
        className={`main-area ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${isPlayerPage ? "player-page-active" : ""}`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                items={items}
                collections={collections}
                stats={stats}
                onItemSelect={handleItemSelect}
                fileMap={fileMap}
              />
            }
          />
          <Route
            path="/library"
            element={
              <Library items={items} collections={collections} onItemSelect={handleItemSelect} />
            }
          />
          <Route
            path="/manage"
            element={
              <Manage
                items={items}
                collections={collections}
                onFilesSelected={handleFilesSelected}
                onReorder={handleReorder}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}
                onMoveItem={handleMoveItem}
                onBulkMove={handleBulkMove}
                onCreateCollection={handleCreateCollection}
                onUpdateCollection={handleUpdateCollection}
                onDeleteCollection={handleDeleteCollection}
                onUpdateItem={handleUpdateItem}
                getItemsByCollection={getItemsByCollection}
              />
            }
          />
          <Route
            path="/collections"
            element={
              <Collections
                items={items}
                collections={collections}
                getItemsByCollection={getItemsByCollection}
              />
            }
          />
          <Route path="/progress-map" element={<ProgressMap />} />
          <Route
            path="/player/:id"
            element={
              <Player
                items={items}
                collections={collections}
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
  );
}

// Main App component that wraps with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
