/**
 * Unit tests for temperature conversion utilities
 * Tests pure functions with no side effects
 */

import { describe, it, expect } from '@jest/globals';
import {
  celsiusToFahrenheit,
  getTemperatureInBothUnits,
} from '../src/utils/conversionUtils.js';

describe('Temperature Conversion Utilities', () => {
  describe('celsiusToFahrenheit', () => {
    it('should convert 0 Celsius to 32 Fahrenheit', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('should convert 100 Celsius to 212 Fahrenheit', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('should convert -40 Celsius to -40 Fahrenheit', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    it('should convert 25 Celsius to 77 Fahrenheit', () => {
      expect(celsiusToFahrenheit(25)).toBeCloseTo(77, 0);
    });

    it('should handle decimal values', () => {
      expect(celsiusToFahrenheit(20.5)).toBeCloseTo(68.9, 1);
    });

    it('should handle negative temperatures', () => {
      expect(celsiusToFahrenheit(-10)).toBe(14);
    });
  });

  describe('getTemperatureInBothUnits', () => {
    it('should return object with both celsius and fahrenheit', () => {
      const result = getTemperatureInBothUnits(20);

      expect(result).toHaveProperty('celsius');
      expect(result).toHaveProperty('fahrenheit');
      expect(typeof result.celsius).toBe('number');
      expect(typeof result.fahrenheit).toBe('number');
    });

    it('should return correctly formatted numbers', () => {
      const result = getTemperatureInBothUnits(20);

      expect(result).toEqual({
        celsius: 20,
        fahrenheit: 68,
      });
    });

    it('should round to 2 decimal places', () => {
      const result = getTemperatureInBothUnits(20.123);

      expect(result.celsius).toBe(20.12);
      expect(result.fahrenheit).toBeCloseTo(68.22, 2);
    });

    it('should handle 0 Celsius correctly', () => {
      const result = getTemperatureInBothUnits(0);

      expect(result.celsius).toBe(0);
      expect(result.fahrenheit).toBe(32);
    });

    it('should handle negative temperatures', () => {
      const result = getTemperatureInBothUnits(-5);

      expect(result.celsius).toBe(-5);
      expect(result.fahrenheit).toBe(23);
    });

    it('should be a pure function (not mutating input)', () => {
      const input = 25;
      const expectedInput = 25;

      getTemperatureInBothUnits(input);

      expect(input).toBe(expectedInput);
    });
  });
});
