/**
 * Weather controller
 * Handles HTTP requests and responses
 * Orchestrates between service and transformer layers
 */

import { fetchCurrentWeather } from '../services/weatherService.js';
import { transformWeatherResponse, toWeatherResponse } from '../transformers/weatherTransformer.js';

/**
 * Get current weather data
 * Route: GET /weather
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getWeather = async (req, res, next) => {
  try {
    // Step 1: Fetch weather data from external API
    const apiResponse = await fetchCurrentWeather();

    // Step 2: Transform API response to internal format
    const transformedData = transformWeatherResponse(apiResponse);

    // Step 3: Create response DTO
    const responseData = toWeatherResponse(transformedData);

    // Step 4: Send response
    res.status(200).json({
      success: true,
      data: {
        temperature: responseData.temperature,
        wind_speed: responseData.wind_speed,
      },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Weather API is running',
    timestamp: new Date().toISOString(),
  });
};
