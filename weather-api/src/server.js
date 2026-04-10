/**
 * Server Entry Point.
 * Starts the Express server on configured port.
 */
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Weather API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Weather endpoint: http://localhost:${PORT}/weather`);
});
