/**
 * Global Error Handler Middleware.
 * Centralized error handling for all API errors.
 * Must be registered last in the middleware chain.
 */
const ApiError = require('../utils/ApiError');

/**
 * Error handler middleware.
 * Catches and formats all errors in consistent format.
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: {
      message,
      status
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
