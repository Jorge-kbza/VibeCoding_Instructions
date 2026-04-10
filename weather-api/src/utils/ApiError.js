/**
 * Custom error class for API operations.
 * Extends Error to provide status code and consistent error handling.
 */
class ApiError extends Error {
  /**
   * Create an ApiError instance.
   * @param {string} message - Error message
   * @param {number} status - HTTP status code (default: 500)
   */
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

module.exports = ApiError;
