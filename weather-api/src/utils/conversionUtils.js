/**
 * Conversion utilities for temperature and wind speed
 * Pure functions with no side effects
 */

/**
 * Convert temperature from Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9 / 5) + 32;
};

/**
 * Calculate temperature in both Celsius and Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {Object} Object with celsius and fahrenheit temperatures
 */
export const getTemperatureInBothUnits = (celsius) => {
  return {
    celsius: Number(celsius.toFixed(2)),
    fahrenheit: Number(celsiusToFahrenheit(celsius).toFixed(2)),
  };
};

/**
 * Convert wind speed from km/h to m/s
 * @param {number} kmh - Wind speed in kilometers per hour
 * @returns {number} Wind speed in meters per second
 */
export const kmhToMs = (kmh) => {
  return kmh / 3.6;
};

/**
 * Calculate wind speed in both km/h and m/s
 * @param {number} kmh - Wind speed in kilometers per hour
 * @returns {Object} Object with kmh and ms wind speeds
 */
export const getWindSpeedInBothUnits = (kmh) => {
  return {
    kmh: Number(kmh.toFixed(2)),
    ms: Number(kmhToMs(kmh).toFixed(2)),
  };
};
