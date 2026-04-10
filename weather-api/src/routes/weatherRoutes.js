/**
 * Weather Routes.
 * Define weather endpoints and map them to controllers.
 */
const express = require('express');
const { getWeather } = require('../controllers/weatherController');

const router = express.Router();

/**
 * GET /weather
 * Get current weather data
 */
router.get('/weather', getWeather);

module.exports = router;
