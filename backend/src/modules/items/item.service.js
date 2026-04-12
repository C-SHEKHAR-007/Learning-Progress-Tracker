/**
 * Item Service
 * Business logic for learning item operations using Prisma
 */
const prisma = require("../../core/database/prisma");
const { v4: uuidv4 } = require("uuid");

const itemService = {
    /**
     * Create multiple items
     */
    async createBatch(items, collectionId = null) {
        const parsedCollectionId = collectionId ? parseInt(collectionId) : null;

        // Get max order_index for this collection
        const maxOrder = await prisma.learningItem.aggregate({
            where: { collectionId: parsedCollectionId },
            _max: { orderIndex: true },
        });
        let orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;

        const createdItems = [];

        for (const item of items) {
            const fileId = item.file_id || uuidv4();

            // Check if item already exists
            const existing = await prisma.learningItem.findUnique({
                where: { fileId },
            });

            if (existing) {
                createdItems.push(existing);
                continue;
            }

            const created = await prisma.learningItem.create({
                data: {
                    name: item.name,
                    type: item.type,
                    fileId,
                    filePath: item.file_path || null,
                    collectionId: parsedCollectionId,
                    orderIndex: orderIndex++,
                    duration: item.duration || 0,
                    fileSize: BigInt(item.file_size || 0),
                    thumbnail: item.thumbnail || null,
                },
            });
            createdItems.push(created);
        }

        return createdItems;
    },

    /**
     * Get all items sorted by collection and order_index
     */
    async getAll() {
        const items = await prisma.learningItem.findMany({
            include: {
                collection: {
                    select: {
                        name: true,
                        color: true,
                        icon: true,
                        orderIndex: true,
                    },
                },
            },
            orderBy: [{ collection: { orderIndex: "asc" } }, { orderIndex: "asc" }],
        });

        // Transform to match expected format
        return items.map((item) => ({
            ...item,
            file_id: item.fileId,
            file_path: item.filePath,
            collection_id: item.collectionId,
            order_index: item.orderIndex,
            is_completed: item.isCompleted,
            last_position: item.lastPosition,
            file_size: item.fileSize.toString(),
            current_page: item.currentPage,
            total_pages: item.totalPages,
            reading_time: item.readingTime,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            collection_name: item.collection?.name || null,
            collection_color: item.collection?.color || null,
            collection_icon: item.collection?.icon || null,
        }));
    },

    /**
     * Get items by collection
     */
    async getByCollection(collectionId) {
        const parsedId = collectionId === null ? null : parseInt(collectionId);

        const items = await prisma.learningItem.findMany({
            where: { collectionId: parsedId },
            orderBy: { orderIndex: "asc" },
        });

        return items.map((item) => ({
            ...item,
            file_id: item.fileId,
            file_path: item.filePath,
            collection_id: item.collectionId,
            order_index: item.orderIndex,
            is_completed: item.isCompleted,
            last_position: item.lastPosition,
            file_size: item.fileSize.toString(),
            current_page: item.currentPage,
            total_pages: item.totalPages,
            reading_time: item.readingTime,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
        }));
    },

    /**
     * Get item by ID
     */
    async getById(id) {
        const item = await prisma.learningItem.findUnique({
            where: { id: parseInt(id) },
            include: {
                collection: {
                    select: {
                        name: true,
                        color: true,
                    },
                },
            },
        });

        if (!item) return null;

        return {
            ...item,
            file_id: item.fileId,
            file_path: item.filePath,
            collection_id: item.collectionId,
            order_index: item.orderIndex,
            is_completed: item.isCompleted,
            last_position: item.lastPosition,
            file_size: item.fileSize.toString(),
            current_page: item.currentPage,
            total_pages: item.totalPages,
            reading_time: item.readingTime,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            collection_name: item.collection?.name || null,
            collection_color: item.collection?.color || null,
        };
    },

    /**
     * Update item's collection
     */
    async updateCollection(itemId, collectionId) {
        const item = await prisma.learningItem.update({
            where: { id: parseInt(itemId) },
            data: { collectionId: collectionId ? parseInt(collectionId) : null },
        });
        return item;
    },

    /**
     * Update progress
     */
    async updateProgress(id, progress, lastPosition, timeSpent = 0) {
        const item = await prisma.learningItem.update({
            where: { id: parseInt(id) },
            data: {
                progress,
                lastPosition,
            },
        });

        // Log to analytics
        if (item) {
            try {
                const analyticsService = require("../analytics/analytics.service");
                await analyticsService.logProgress(parseInt(id), progress, timeSpent);
            } catch (error) {
                console.error("Error logging progress history:", error);
            }
        }

        return item;
    },

    /**
     * Mark as completed
     */
    async markCompleted(id, isCompleted) {
        const progress = isCompleted ? 100 : 0;
        const item = await prisma.learningItem.update({
            where: { id: parseInt(id) },
            data: {
                isCompleted,
                progress,
            },
        });

        // Log to analytics
        if (item) {
            try {
                const analyticsService = require("../analytics/analytics.service");
                await analyticsService.logProgress(parseInt(id), progress, 0);
            } catch (error) {
                console.error("Error logging completion history:", error);
            }
        }

        return item;
    },

    /**
     * Reorder items
     */
    async reorder(items) {
        const updates = items.map((item, index) =>
            prisma.learningItem.update({
                where: { id: item.id },
                data: { orderIndex: index },
            }),
        );

        return prisma.$transaction(updates);
    },

    /**
     * Update item metadata
     */
    async update(id, updates) {
        const { name, duration } = updates;
        return prisma.learningItem.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(duration !== undefined && { duration }),
            },
        });
    },

    /**
     * Delete item
     */
    async delete(id) {
        return prisma.learningItem.delete({
            where: { id: parseInt(id) },
        });
    },

    /**
     * Delete all items
     */
    async deleteAll() {
        return prisma.learningItem.deleteMany();
    },

    /**
     * Get file path by item ID
     */
    async getFilePath(id) {
        const item = await prisma.learningItem.findUnique({
            where: { id: parseInt(id) },
            select: {
                filePath: true,
                type: true,
                name: true,
            },
        });

        if (!item) return null;

        return {
            file_path: item.filePath,
            type: item.type,
            name: item.name,
        };
    },

    /**
     * Update file path
     */
    async updateFilePath(id, filePath) {
        return prisma.learningItem.update({
            where: { id: parseInt(id) },
            data: { filePath },
        });
    },
};

module.exports = itemService;
