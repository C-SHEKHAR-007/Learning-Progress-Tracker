/**
 * Item validation schemas
 */
const { ITEM_TYPES } = require("../../config/constants");

const createItemsSchema = {
    items: { required: true, type: "array" },
    collectionId: { type: "number" },
};

const updateItemSchema = {
    name: { type: "string" },
    duration: { type: "number" },
};

const updateProgressSchema = {
    progress: { type: "number", min: 0, max: 100 },
    last_position: { type: "number" },
    time_spent: { type: "number" },
};

const updateCollectionSchema = {
    collectionId: { type: "number" },
};

const markCompletedSchema = {
    is_completed: { required: true, type: "boolean" },
};

const reorderItemsSchema = {
    items: { required: true, type: "array" },
};

module.exports = {
    createItemsSchema,
    updateItemSchema,
    updateProgressSchema,
    updateCollectionSchema,
    markCompletedSchema,
    reorderItemsSchema,
};
