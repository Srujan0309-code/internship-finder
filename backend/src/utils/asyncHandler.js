/**
 * Wraps async route handlers to catch unhandled promise rejections.
 * @param {Function} fn - Async express handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
