/**
 * Application-wide constants
 * Centralizes magic values for easy maintenance
 */
module.exports = {
    // Default values
    DEFAULT_COLLECTION_COLOR: "#6366f1",
    DEFAULT_COLLECTION_ICON: "folder",
    DEFAULT_BOOKMARK_COLOR: "#fbbf24",

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // File upload limits
    MAX_FILE_SIZE: "50mb",

    // Analytics
    DEFAULT_HEATMAP_DAYS: 365,
    DEFAULT_DAILY_STATS_DAYS: 30,
    DEFAULT_COMPLETIONS_LIMIT: 10,
    WEEKDAY_PATTERN_DAYS: 90,

    // Item types
    ITEM_TYPES: ["video", "pdf"],

    // Content types by extension
    CONTENT_TYPES: {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mkv": "video/x-matroska",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".pdf": "application/pdf",
    },

    // HTTP Status codes (for semantic use)
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_ERROR: 500,
    },
};
