/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass them to Express error handler
 * Eliminates the need for try-catch in every controller
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 *
 * @example
 * // Instead of:
 * router.get('/items', async (req, res, next) => {
 *   try {
 *     const items = await itemService.getAll();
 *     res.json(items);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // Use:
 * router.get('/items', asyncHandler(async (req, res) => {
 *   const items = await itemService.getAll();
 *   res.json(items);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
