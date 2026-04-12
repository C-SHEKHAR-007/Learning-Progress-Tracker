/**
 * Standardized response helpers
 * Ensures consistent API response format
 */

/**
 * Success response
 * @param {Response} res - Express response object
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};

/**
 * Created response (201)
 * @param {Response} res - Express response object
 * @param {any} data - Created resource
 */
const created = (res, data) => {
  res.status(201).json(data);
};

/**
 * No content response (204)
 * @param {Response} res - Express response object
 */
const noContent = (res) => {
  res.status(204).send();
};

/**
 * Paginated response
 * @param {Response} res - Express response object
 * @param {Object} options - Pagination options
 */
const paginated = (res, { data, page, pageSize, total }) => {
  res.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
};

module.exports = {
  success,
  created,
  noContent,
  paginated,
};
