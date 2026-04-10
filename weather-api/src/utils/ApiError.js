/**
 * Custom error class for API errors
 * Extends Error for proper error handling and status codes
 */
class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export default ApiError;
