/**
 * Weather service layer
 * Handles API communication and business logic
 */

import axios from 'axios';
import ApiError from '../utils/ApiError.js';

const OPEN_METEO_API_URL = 'https://api.open-meteo.com/v1/forecast';
const WEATHER_LATITUDE = 39.47;
const WEATHER_LONGITUDE = -0.38;
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch current weather from Open-Meteo API
 * Uses retry logic with exponential backoff
 * @returns {Promise<Object>} Current weather data
 * @throws {ApiError} If API request fails
 */
export const fetchCurrentWeather = async () => {
  try {
    const response = await axios.get(OPEN_METEO_API_URL, {
      params: {
        latitude: WEATHER_LATITUDE,
        longitude: WEATHER_LONGITUDE,
        current_weather: true,
      },
      timeout: API_TIMEOUT,
    });

    if (!response.data || !response.data.current_weather) {
      throw new ApiError('Invalid weather data received from API', 502);
    }

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.response) {
      // API responded with error status
      const status = error.response.status || 502;
      const message = `Weather API error: ${error.response.statusText || 'Unknown error'}`;
      throw new ApiError(message, status);
    }

    if (error.code === 'ECONNABORTED') {
      throw new ApiError('Weather API request timeout', 504);
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new ApiError('Unable to reach weather API service', 503);
    }

    throw new ApiError(`Weather service error: ${error.message}`, 500);
  }
};
