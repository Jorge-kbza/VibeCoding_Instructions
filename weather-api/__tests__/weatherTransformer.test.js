/**
 * Unit tests for weather transformer
 * Tests data transformation and validation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  transformWeatherResponse,
  toWeatherResponse,
} from '../src/transformers/weatherTransformer.js';

describe('Weather Transformer', () => {
  describe('transformWeatherResponse', () => {
    let validApiResponse;

    beforeEach(() => {
      validApiResponse = {
        latitude: 39.47,
        longitude: -0.38,
        elevation: 5,
        current_weather: {
          temperature: 15.5,
          windspeed: 20.3,
          winddirection: 240,
          weathercode: 0,
          is_day: 1,
          time: '2024-01-15T12:00',
        },
      };
    });

    it('should transform valid API response', () => {
      const result = transformWeatherResponse(validApiResponse);

      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('wind_speed');
      expect(result.temperature).toHaveProperty('celsius');
      expect(result.temperature).toHaveProperty('fahrenheit');
      expect(result.wind_speed).toHaveProperty('kmh');
      expect(result.wind_speed).toHaveProperty('ms');
    });

    it('should correctly transform temperature values', () => {
      const result = transformWeatherResponse(validApiResponse);

      expect(result.temperature.celsius).toBe(15.5);
      expect(result.temperature.fahrenheit).toBeCloseTo(59.9, 1);
    });

    it('should correctly transform wind speed values', () => {
      const result = transformWeatherResponse(validApiResponse);

      expect(result.wind_speed.kmh).toBe(20.3);
      expect(result.wind_speed.ms).toBeCloseTo(5.64, 2);
    });

    it('should throw error if current_weather is missing', () => {
      const invalidResponse = {
        latitude: 39.47,
        longitude: -0.38,
      };

      expect(() => transformWeatherResponse(invalidResponse))
        .toThrow('Invalid weather data: current_weather field is missing');
    });

    it('should throw error if temperature is not a number', () => {
      const invalidResponse = {
        current_weather: {
          temperature: 'invalid',
          windspeed: 20,
        },
      };

      expect(() => transformWeatherResponse(invalidResponse))
        .toThrow('Invalid weather data: temperature and windspeed must be numbers');
    });

    it('should throw error if windspeed is not a number', () => {
      const invalidResponse = {
        current_weather: {
          temperature: 20,
          windspeed: null,
        },
      };

      expect(() => transformWeatherResponse(invalidResponse))
        .toThrow('Invalid weather data: temperature and windspeed must be numbers');
    });

    it('should handle negative temperatures', () => {
      const response = {
        current_weather: {
          temperature: -10,
          windspeed: 15,
        },
      };

      const result = transformWeatherResponse(response);

      expect(result.temperature.celsius).toBe(-10);
      expect(result.temperature.fahrenheit).toBe(14);
    });

    it('should handle zero values', () => {
      const response = {
        current_weather: {
          temperature: 0,
          windspeed: 0,
        },
      };

      const result = transformWeatherResponse(response);

      expect(result.temperature.celsius).toBe(0);
      expect(result.temperature.fahrenheit).toBe(32);
      expect(result.wind_speed.kmh).toBe(0);
      expect(result.wind_speed.ms).toBe(0);
    });
  });

  describe('toWeatherResponse', () => {
    let transformedData;

    beforeEach(() => {
      transformedData = {
        temperature: {
          celsius: 20,
          fahrenheit: 68,
        },
        wind_speed: {
          kmh: 10,
          ms: 2.78,
        },
      };
    });

    it('should create response with required fields', () => {
      const result = toWeatherResponse(transformedData);

      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('wind_speed');
      expect(result).toHaveProperty('timestamp');
    });

    it('should preserve temperature data', () => {
      const result = toWeatherResponse(transformedData);

      expect(result.temperature).toEqual(transformedData.temperature);
    });

    it('should preserve wind speed data', () => {
      const result = toWeatherResponse(transformedData);

      expect(result.wind_speed).toEqual(transformedData.wind_speed);
    });

    it('should add ISO timestamp', () => {
      const result = toWeatherResponse(transformedData);

      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should not mutate input data', () => {
      const originalData = JSON.stringify(transformedData);

      toWeatherResponse(transformedData);

      expect(JSON.stringify(transformedData)).toBe(originalData);
    });
  });
});
