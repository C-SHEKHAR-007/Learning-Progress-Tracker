/**
 * Collection Service
 * Business logic for collection operations using Prisma
 */
const prisma = require("../../core/database/prisma");
const { DEFAULT_COLLECTION_COLOR, DEFAULT_COLLECTION_ICON } = require("../../config/constants");

const collectionService = {
  /**
   * Get all collections ordered by order_index
   */
  async getAll() {
    return prisma.collection.findMany({
      orderBy: { orderIndex: "asc" },
    });
  },

  /**
   * Get collection by ID
   */
  async getById(id) {
    return prisma.collection.findUnique({
      where: { id: parseInt(id) },
    });
  },

  /**
   * Create a new collection
   */
  async create(name, color = DEFAULT_COLLECTION_COLOR, icon = DEFAULT_COLLECTION_ICON) {
    // Get max order index
    const maxOrder = await prisma.collection.aggregate({
      _max: { orderIndex: true },
    });
    const orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;

    return prisma.collection.create({
      data: {
        name,
        color,
        icon,
        orderIndex,
      },
    });
  },

  /**
   * Update collection
   */
  async update(id, updates) {
    const { name, color, icon } = updates;
    return prisma.collection.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    });
  },

  /**
   * Delete collection (moves items to uncategorized)
   */
  async delete(id) {
    const collectionId = parseInt(id);
    
    // Move items to no collection before deleting
    await prisma.learningItem.updateMany({
      where: { collectionId },
      data: { collectionId: null },
    });

    return prisma.collection.delete({
      where: { id: collectionId },
    });
  },

  /**
   * Reorder collections
   */
  async reorder(collections) {
    const updates = collections.map((col, index) =>
      prisma.collection.update({
        where: { id: col.id },
        data: { orderIndex: index },
      })
    );
    
    return prisma.$transaction(updates);
  },
};

module.exports = collectionService;
