/**
 * Request Logger Middleware.
 * Logs incoming requests for debugging and monitoring.
 */

/**
 * Log HTTP requests.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  const { method, path, query } = req;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${method} ${path}`, query);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${timestamp}] ${method} ${path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = requestLogger;
