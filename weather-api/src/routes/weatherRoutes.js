/**
 * Weather routes
 * Maps API endpoints to controller functions
 */

import { Router } from 'express';
import { getWeather, healthCheck } from '../controllers/weatherController.js';

const router = Router();

/**
 * Route: GET /health
 * Description: Health check endpoint
 */
router.get('/health', healthCheck);

/**
 * Route: GET /weather
 * Description: Get current weather data with temperature and wind speed
 * Response: {
 *   "temperature": { "celsius": number, "fahrenheit": number },
 *   "wind_speed": { "kmh": number, "ms": number }
 * }
 */
router.get('/weather', getWeather);

export default router;
