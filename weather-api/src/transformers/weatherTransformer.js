/**
 * Weather data transformer.
 * Responsible for transforming external API responses to internal format.
 */
const {
  temperatureBothUnits
} = require('../utils/temperatureConverter');
const { windSpeedBothUnits } = require('../utils/windSpeedConverter');
const ApiError = require('../utils/ApiError');

/**
 * Validate weather data from external API.
 * @param {object} data - Raw data from API
 * @returns {boolean} True if data is valid
 * @throws {ApiError} If data is invalid
 */
const validateWeatherData = (data) => {
  if (!data
    || typeof data.current_weather !== 'object'
    || data.current_weather === null) {
    throw new ApiError(
      'Invalid weather data structure from external API',
      502
    );
  }

  const currentWeather = data.current_weather;

  if (typeof currentWeather.temperature !== 'number') {
    throw new ApiError(
      'Temperature data is missing or invalid',
      502
    );
  }

  if (typeof currentWeather.wind_speed !== 'number') {
    throw new ApiError(
      'Wind speed data is missing or invalid',
      502
    );
  }

  return true;
};

/**
 * Transform external API response to application format.
 * @param {object} apiResponse - Response from Open-Meteo API
 * @returns {object} Transformed weather data
 */
const transformWeatherData = (apiResponse) => {
  validateWeatherData(apiResponse);

  const currentWeather = apiResponse.current_weather;
  const temperature = currentWeather.temperature;
  const windSpeed = currentWeather.wind_speed;

  return {
    temperature: temperatureBothUnits(temperature),
    wind_speed: windSpeedBothUnits(windSpeed)
  };
};

module.exports = {
  validateWeatherData,
  transformWeatherData
};
