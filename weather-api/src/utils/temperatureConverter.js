/**
 * Convert temperature between Celsius and Fahrenheit.
 * Pure function for temperature conversions.
 */

/**
 * Convert Celsius to Fahrenheit.
 * Formula: F = (C × 9/5) + 32
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
const celsiusToFahrenheit = (celsius) => {
  if (typeof celsius !== 'number') {
    throw new Error('Temperature must be a number');
  }
  return (celsius * 9 / 5) + 32;
};

/**
 * Convert Fahrenheit to Celsius.
 * Formula: C = (F - 32) × 5/9
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
const fahrenheitToCelsius = (fahrenheit) => {
  if (typeof fahrenheit !== 'number') {
    throw new Error('Temperature must be a number');
  }
  return (fahrenheit - 32) * 5 / 9;
};

/**
 * Get temperature in both Celsius and Fahrenheit.
 * @param {number} celsius - Temperature in Celsius
 * @returns {object} Object with celsius and fahrenheit temperatures
 */
const temperatureBothUnits = (celsius) => {
  if (typeof celsius !== 'number') {
    throw new Error('Temperature must be a number');
  }
  return {
    celsius: Math.round(celsius * 100) / 100,
    fahrenheit: Math.round(celsiusToFahrenheit(celsius) * 100) / 100
  };
};

module.exports = {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  temperatureBothUnits
};
