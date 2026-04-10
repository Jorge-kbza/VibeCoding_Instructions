/**
 * Weather transformer for converting API response to DTO
 * Handles serialization/deserialization of weather data
 */

import {
  getTemperatureInBothUnits,
  getWindSpeedInBothUnits,
} from '../utils/conversionUtils.js';

/**
 * Transform Open-Meteo API response to standardized weather DTO
 * @param {Object} apiResponse - Response from Open-Meteo API
 * @returns {Object} Standardized weather data object
 */
export const transformWeatherResponse = (apiResponse) => {
  if (!apiResponse.current_weather) {
    throw new Error('Invalid weather data: current_weather field is missing');
  }

  const { temperature, windspeed } = apiResponse.current_weather;

  // Validate that required fields exist
  if (typeof temperature !== 'number' || typeof windspeed !== 'number') {
    throw new Error('Invalid weather data: temperature and windspeed must be numbers');
  }

  return {
    temperature: getTemperatureInBothUnits(temperature),
    wind_speed: getWindSpeedInBothUnits(windspeed),
  };
};

/**
 * Create weather response object with metadata
 * @param {Object} weatherData - Transformed weather data
 * @returns {Object} Response object with data and metadata
 */
export const toWeatherResponse = (weatherData) => {
  return {
    temperature: weatherData.temperature,
    wind_speed: weatherData.wind_speed,
    timestamp: new Date().toISOString(),
  };
};
