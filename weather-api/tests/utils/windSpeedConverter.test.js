/**
 * Unit Tests for Wind Speed Converter.
 * Tests wind speed conversion functions.
 */
const {
  kmhToMs,
  msToKmh,
  windSpeedBothUnits
} = require('../../src/utils/windSpeedConverter');

describe('Wind Speed Converter', () => {
  describe('kmhToMs', () => {
    it('should convert 0 km/h to 0 m/s', () => {
      expect(kmhToMs(0)).toBe(0);
    });

    it('should convert 36 km/h to 10 m/s', () => {
      expect(kmhToMs(36)).toBe(10);
    });

    it('should convert 3.6 km/h to 1 m/s', () => {
      expect(kmhToMs(3.6)).toBeCloseTo(1, 1);
    });

    it('should convert positive decimal values', () => {
      expect(kmhToMs(50)).toBeCloseTo(13.89, 1);
    });

    it('should convert negative values', () => {
      expect(kmhToMs(-36)).toBe(-10);
    });

    it('should throw error if input is not a number', () => {
      expect(() => {
        kmhToMs('50');
      }).toThrow('Wind speed must be a number');
    });

    it('should throw error if input is null', () => {
      expect(() => {
        kmhToMs(null);
      }).toThrow('Wind speed must be a number');
    });

    it('should throw error if input is undefined', () => {
      expect(() => {
        kmhToMs(undefined);
      }).toThrow('Wind speed must be a number');
    });
  });

  describe('msToKmh', () => {
    it('should convert 0 m/s to 0 km/h', () => {
      expect(msToKmh(0)).toBe(0);
    });

    it('should convert 10 m/s to 36 km/h', () => {
      expect(msToKmh(10)).toBe(36);
    });

    it('should convert 1 m/s to 3.6 km/h', () => {
      expect(msToKmh(1)).toBeCloseTo(3.6, 1);
    });

    it('should convert positive decimal values', () => {
      expect(msToKmh(5)).toBeCloseTo(18, 0);
    });

    it('should throw error if input is not a number', () => {
      expect(() => {
        msToKmh('10');
      }).toThrow('Wind speed must be a number');
    });
  });

  describe('windSpeedBothUnits', () => {
    it('should return object with kmh and ms keys', () => {
      const result = windSpeedBothUnits(36);
      expect(result).toHaveProperty('kmh');
      expect(result).toHaveProperty('ms');
    });

    it('should return correct conversion for 0 km/h', () => {
      const result = windSpeedBothUnits(0);
      expect(result.kmh).toBe(0);
      expect(result.ms).toBe(0);
    });

    it('should return correct conversion for 36 km/h', () => {
      const result = windSpeedBothUnits(36);
      expect(result.kmh).toBe(36);
      expect(result.ms).toBe(10);
    });

    it('should return correct conversion for 50 km/h', () => {
      const result = windSpeedBothUnits(50);
      expect(result.kmh).toBe(50);
      expect(result.ms).toBeCloseTo(13.89, 1);
    });

    it('should handle decimal precision', () => {
      const result = windSpeedBothUnits(25.5);
      expect(result.kmh).toBe(25.5);
      expect(typeof result.ms).toBe('number');
    });

    it('should throw error for non-numeric input', () => {
      expect(() => {
        windSpeedBothUnits('20');
      }).toThrow('Wind speed must be a number');
    });
  });
});
