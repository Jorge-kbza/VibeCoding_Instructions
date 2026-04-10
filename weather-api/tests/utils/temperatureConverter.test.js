/**
 * Unit Tests for Temperature Converter.
 * Tests temperature conversion functions.
 */
const {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  temperatureBothUnits
} = require('../../src/utils/temperatureConverter');

describe('Temperature Converter', () => {
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

    it('should convert positive decimal values', () => {
      expect(celsiusToFahrenheit(25)).toBeCloseTo(77, 0);
    });

    it('should convert negative decimal values', () => {
      expect(celsiusToFahrenheit(-10)).toBeCloseTo(14, 0);
    });

    it('should throw error if input is not a number', () => {
      expect(() => {
        celsiusToFahrenheit('25');
      }).toThrow('Temperature must be a number');
    });

    it('should throw error if input is null', () => {
      expect(() => {
        celsiusToFahrenheit(null);
      }).toThrow('Temperature must be a number');
    });

    it('should throw error if input is undefined', () => {
      expect(() => {
        celsiusToFahrenheit(undefined);
      }).toThrow('Temperature must be a number');
    });
  });

  describe('fahrenheitToCelsius', () => {
    it('should convert 32 Fahrenheit to 0 Celsius', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it('should convert 212 Fahrenheit to 100 Celsius', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it('should convert -40 Fahrenheit to -40 Celsius', () => {
      expect(fahrenheitToCelsius(-40)).toBe(-40);
    });

    it('should convert positive values', () => {
      expect(fahrenheitToCelsius(77)).toBeCloseTo(25, 0);
    });

    it('should throw error if input is not a number', () => {
      expect(() => {
        fahrenheitToCelsius('32');
      }).toThrow('Temperature must be a number');
    });
  });

  describe('temperatureBothUnits', () => {
    it('should return object with celsius and fahrenheit keys', () => {
      const result = temperatureBothUnits(25);
      expect(result).toHaveProperty('celsius');
      expect(result).toHaveProperty('fahrenheit');
    });

    it('should return correct conversion for 0 Celsius', () => {
      const result = temperatureBothUnits(0);
      expect(result.celsius).toBe(0);
      expect(result.fahrenheit).toBe(32);
    });

    it('should return correct conversion for 25 Celsius', () => {
      const result = temperatureBothUnits(25);
      expect(result.celsius).toBe(25);
      expect(result.fahrenheit).toBeCloseTo(77, 0);
    });

    it('should handle decimal precision', () => {
      const result = temperatureBothUnits(20.5);
      expect(result.celsius).toBe(20.5);
      expect(typeof result.fahrenheit).toBe('number');
    });

    it('should throw error for non-numeric input', () => {
      expect(() => {
        temperatureBothUnits('20');
      }).toThrow('Temperature must be a number');
    });
  });
});
