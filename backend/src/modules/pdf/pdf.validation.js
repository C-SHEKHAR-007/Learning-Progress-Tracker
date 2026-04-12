/**
 * PDF validation schemas
 */
const updatePageProgressSchema = {
    currentPage: { required: true, type: "number", min: 0 },
    totalPages: { required: true, type: "number", min: 1 },
    readingTime: { type: "number" },
};

const addBookmarkSchema = {
    page: { required: true, type: "number", min: 1 },
    title: { type: "string" },
    color: { type: "string" },
};

const addNoteSchema = {
    page: { required: true, type: "number", min: 1 },
    content: { required: true, type: "string", minLength: 1 },
    highlight: { type: "string" },
};

const updateNoteSchema = {
    content: { type: "string" },
    highlight: { type: "string" },
};

module.exports = {
    updatePageProgressSchema,
    addBookmarkSchema,
    addNoteSchema,
    updateNoteSchema,
};
