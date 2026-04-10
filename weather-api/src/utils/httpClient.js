/**
 * HTTP client configuration using axios.
 * Centralized HTTP client with interceptors and error handling.
 */
const axios = require('axios');

const httpClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'WeatherAPI/1.0'
  }
});

/**
 * Request interceptor for logging and configuration.
 */
httpClient.interceptors.request.use((config) => {
  return config;
});

/**
 * Response interceptor for standardized response handling.
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.error?.message
        || data?.message
        || `HTTP Error: ${status}`;
      error.message = errorMessage;
    } else if (error.request) {
      error.message = 'No response from external API';
    } else {
      error.message = error.message || 'Error in HTTP request';
    }
    return Promise.reject(error);
  }
);

module.exports = httpClient;
