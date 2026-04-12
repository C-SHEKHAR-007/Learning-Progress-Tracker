/**
 * Pagination utilities
 */
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../../config/constants");

/**
 * Parse pagination parameters from request
 * @param {Object} query - Express request query
 * @returns {Object} { page, pageSize, offset }
 */
const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(query.pageSize || query.limit, 10) || DEFAULT_PAGE_SIZE),
    );
    const offset = (page - 1) * pageSize;

    return { page, pageSize, offset };
};

/**
 * Create pagination SQL clause
 * @param {Object} pagination - { pageSize, offset }
 * @returns {string} SQL LIMIT OFFSET clause
 */
const paginationClause = ({ pageSize, offset }) => {
    return `LIMIT ${pageSize} OFFSET ${offset}`;
};

/**
 * Build pagination metadata
 * @param {Object} options - { total, page, pageSize }
 * @returns {Object} Pagination metadata
 */
const buildPaginationMeta = ({ total, page, pageSize }) => {
    const totalPages = Math.ceil(total / pageSize);
    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};

module.exports = {
    parsePagination,
    paginationClause,
    buildPaginationMeta,
};
