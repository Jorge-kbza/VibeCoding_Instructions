/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 * Centralizes error handling and ensures consistent error responses
 */

import ApiError from '../utils/ApiError.js';

/**
 * Error handler middleware
 * Catches all errors and returns consistent JSON error responses
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Determine error message
  let message = err.message || 'Internal Server Error';

  // Never expose stack traces to client
  const response = {
    success: false,
    error: {
      message,
      status,
    },
  };

  // Log error for debugging (in production, use proper logging service)
  if (status >= 500) {
    console.error('[ERROR]', {
      timestamp: new Date().toISOString(),
      status,
      message,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  }

  res.status(status).json(response);
};

/**
 * 404 Not Found middleware
 * Should be placed after all route definitions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`Route not found: ${req.method} ${req.path}`, 404);
  next(error);
};
