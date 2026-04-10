/**
 * Express Application Configuration.
 * Main application setup with middlewares and routes.
 */
const express = require('express');
const weatherRoutes = require('./routes/weatherRoutes');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// Middlewares
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/', weatherRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(`Route ${req.path} not found`, 404));
});

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
