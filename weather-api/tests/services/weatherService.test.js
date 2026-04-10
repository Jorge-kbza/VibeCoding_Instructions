/**
 * Unit Tests for Weather Service.
 * Tests weather data fetching and business logic.
 */
const { getCurrentWeather } = require('../../src/services/weatherService');
const httpClient = require('../../src/utils/httpClient');
const ApiError = require('../../src/utils/ApiError');

jest.mock('../../src/utils/httpClient');

describe('Weather Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should fetch and transform weather data successfully', async () => {
      const mockResponse = {
        data: {
          current_weather: {
            temperature: 20,
            wind_speed: 36
          }
        }
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await getCurrentWeather();

      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('wind_speed');
      expect(result.temperature).toHaveProperty('celsius');
      expect(result.temperature).toHaveProperty('fahrenheit');
      expect(result.wind_speed).toHaveProperty('kmh');
      expect(result.wind_speed).toHaveProperty('ms');
    });

    it('should call httpClient.get with correct parameters', async () => {
      const mockResponse = {
        data: {
          current_weather: {
            temperature: 15,
            wind_speed: 20
          }
        }
      };

      httpClient.get.mockResolvedValue(mockResponse);

      await getCurrentWeather();

      expect(httpClient.get).toHaveBeenCalledWith(
        'https://api.open-meteo.com/v1/forecast',
        expect.objectContaining({
          params: {
            latitude: 39.47,
            longitude: -0.38,
            current_weather: true
          }
        })
      );
    });

    it('should throw ApiError when API returns no data', async () => {
      httpClient.get.mockResolvedValue({ data: null });

      await expect(getCurrentWeather()).rejects.toThrow(ApiError);
    });

    it('should throw ApiError when temperature is missing', async () => {
      const mockResponse = {
        data: {
          current_weather: {
            wind_speed: 20
          }
        }
      };

      httpClient.get.mockResolvedValue(mockResponse);

      await expect(getCurrentWeather()).rejects.toThrow(ApiError);
    });

    it('should throw ApiError when wind_speed is missing', async () => {
      const mockResponse = {
        data: {
          current_weather: {
            temperature: 20
          }
        }
      };

      httpClient.get.mockResolvedValue(mockResponse);

      await expect(getCurrentWeather()).rejects.toThrow(ApiError);
    });

    it('should throw ApiError with 502 status for invalid structure', async () => {
      httpClient.get.mockResolvedValue({
        data: { current_weather: null }
      });

      try {
        await getCurrentWeather();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(502);
      }
    });

    it('should handle connection timeout errors', async () => {
      const error = new Error('Connection timeout');
      error.code = 'ECONNABORTED';

      httpClient.get.mockRejectedValue(error);

      await expect(getCurrentWeather()).rejects.toThrow(
        'Weather API request timeout'
      );
    });

    it('should handle API not found errors', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404 };

      httpClient.get.mockRejectedValue(error);

      await expect(getCurrentWeather()).rejects.toThrow(
        'Weather API endpoint not found'
      );
    });

    it('should transform temperature correctly', async () => {
      const mockResponse = {
        data: {
          current_weather: {
            temperature: 0,
            wind_speed: 0
          }
        }
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await getCurrentWeather();

      expect(result.temperature.celsius).toBe(0);
      expect(result.temperature.fahrenheit).toBe(32);
    });

    it('should transform wind speed correctly', async () => {
      const mockResponse = {
        data: {
          current_weather: {
            temperature: 20,
            wind_speed: 36
          }
        }
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await getCurrentWeather();

      expect(result.wind_speed.kmh).toBe(36);
      expect(result.wind_speed.ms).toBe(10);
    });
  });
});
