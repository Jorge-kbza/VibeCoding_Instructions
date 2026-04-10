/**
 * Unit tests for wind speed conversion utilities
 * Tests pure functions with no side effects
 */

import { describe, it, expect } from '@jest/globals';
import {
  kmhToMs,
  getWindSpeedInBothUnits,
} from '../src/utils/conversionUtils.js';

describe('Wind Speed Conversion Utilities', () => {
  describe('kmhToMs', () => {
    it('should convert 36 km/h to 10 m/s', () => {
      expect(kmhToMs(36)).toBe(10);
    });

    it('should convert 3.6 km/h to 1 m/s', () => {
      expect(kmhToMs(3.6)).toBe(1);
    });

    it('should convert 0 km/h to 0 m/s', () => {
      expect(kmhToMs(0)).toBe(0);
    });

    it('should convert 72 km/h to 20 m/s', () => {
      expect(kmhToMs(72)).toBe(20);
    });

    it('should handle decimal values', () => {
      expect(kmhToMs(10.5)).toBeCloseTo(2.92, 2);
    });

    it('should handle large values', () => {
      expect(kmhToMs(360)).toBe(100);
    });
  });

  describe('getWindSpeedInBothUnits', () => {
    it('should return object with both kmh and ms', () => {
      const result = getWindSpeedInBothUnits(10);

      expect(result).toHaveProperty('kmh');
      expect(result).toHaveProperty('ms');
      expect(typeof result.kmh).toBe('number');
      expect(typeof result.ms).toBe('number');
    });

    it('should return correctly formatted numbers', () => {
      const result = getWindSpeedInBothUnits(36);

      expect(result).toEqual({
        kmh: 36,
        ms: 10,
      });
    });

    it('should round to 2 decimal places', () => {
      const result = getWindSpeedInBothUnits(10.5);

      expect(result.kmh).toBe(10.5);
      expect(result.ms).toBeCloseTo(2.92, 2);
    });

    it('should handle 0 wind speed', () => {
      const result = getWindSpeedInBothUnits(0);

      expect(result.kmh).toBe(0);
      expect(result.ms).toBe(0);
    });

    it('should handle high wind speeds', () => {
      const result = getWindSpeedInBothUnits(100);

      expect(result.kmh).toBe(100);
      expect(result.ms).toBeCloseTo(27.78, 2);
    });

    it('should be a pure function (not mutating input)', () => {
      const input = 50;
      const expectedInput = 50;

      getWindSpeedInBothUnits(input);

      expect(input).toBe(expectedInput);
    });
  });
});
