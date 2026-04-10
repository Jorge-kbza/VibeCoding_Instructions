/**
 * Convert wind speed between different units.
 * Pure functions for wind speed conversions.
 */

/**
 * Convert km/h to m/s.
 * Formula: m/s = km/h / 3.6
 * @param {number} kmh - Wind speed in kilometers per hour
 * @returns {number} Wind speed in meters per second
 */
const kmhToMs = (kmh) => {
  if (typeof kmh !== 'number') {
    throw new Error('Wind speed must be a number');
  }
  return kmh / 3.6;
};

/**
 * Convert m/s to km/h.
 * Formula: km/h = m/s × 3.6
 * @param {number} ms - Wind speed in meters per second
 * @returns {number} Wind speed in kilometers per hour
 */
const msToKmh = (ms) => {
  if (typeof ms !== 'number') {
    throw new Error('Wind speed must be a number');
  }
  return ms * 3.6;
};

/**
 * Get wind speed in both km/h and m/s.
 * @param {number} kmh - Wind speed in kilometers per hour
 * @returns {object} Object with kmh and ms wind speeds
 */
const windSpeedBothUnits = (kmh) => {
  if (typeof kmh !== 'number') {
    throw new Error('Wind speed must be a number');
  }
  return {
    kmh: Math.round(kmh * 100) / 100,
    ms: Math.round(kmhToMs(kmh) * 100) / 100
  };
};

module.exports = {
  kmhToMs,
  msToKmh,
  windSpeedBothUnits
};
