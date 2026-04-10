/**
 * Weather Controller.
 * Handles HTTP requests and responses for weather endpoints.
 * Thin controller - delegates logic to services.
 */
const { getCurrentWeather } = require('../services/weatherService');
const ApiError = require('../utils/ApiError');

/**
 * Get current weather data.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const getWeather = async (req, res, next) => {
  try {
    const weatherData = await getCurrentWeather();

    res.status(200).json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Internal server error', 500));
    }
  }
};

module.exports = {
  getWeather
};
