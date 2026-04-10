/**
 * Weather Service.
 * Handles weather data retrieval and business logic.
 * Responsible for external API consumption and data transformation.
 */
const httpClient = require('../utils/httpClient');
const ApiError = require('../utils/ApiError');
const { transformWeatherData } = require('../transformers/weatherTransformer');

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const API_LATITUDE = 39.47;
const API_LONGITUDE = -0.38;

/**
 * Fetch current weather data from external API.
 * @returns {Promise<object>} Transformed weather data
 * @throws {ApiError} If API call fails or data is invalid
 */
const getCurrentWeather = async () => {
  try {
    const response = await httpClient.get(WEATHER_API_URL, {
      params: {
        latitude: API_LATITUDE,
        longitude: API_LONGITUDE,
        current_weather: true
      }
    });

    if (!response.data) {
      throw new ApiError(
        'No data received from weather API',
        502
      );
    }

    const transformedData = transformWeatherData(response.data);
    return transformedData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.response?.status === 404) {
      throw new ApiError(
        'Weather API endpoint not found',
        502
      );
    }

    if (error.code === 'ECONNABORTED') {
      throw new ApiError(
        'Weather API request timeout',
        504
      );
    }

    if (error.message
      && error.message.includes('No response')) {
      throw new ApiError(
        'Unable to connect to weather API',
        503
      );
    }

    throw new ApiError(
      `Error fetching weather data: ${error.message}`,
      502
    );
  }
};

module.exports = {
  getCurrentWeather
};
