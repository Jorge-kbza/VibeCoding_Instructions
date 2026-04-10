/**
 * Unit tests for ApiError class
 * Tests custom error handling
 */

import { describe, it, expect } from '@jest/globals';
import ApiError from '../src/utils/ApiError.js';

describe('ApiError', () => {
  it('should create error with message and default status', () => {
    const error = new ApiError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(500);
    expect(error.name).toBe('ApiError');
  });

  it('should create error with message and custom status', () => {
    const error = new ApiError('Not found', 404);

    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
  });

  it('should handle 400 status for bad requests', () => {
    const error = new ApiError('Invalid input', 400);

    expect(error.status).toBe(400);
  });

  it('should handle 503 status for service unavailable', () => {
    const error = new ApiError('Service unavailable', 503);

    expect(error.status).toBe(503);
  });

  it('should be catchable as Error', () => {
    const error = new ApiError('Test error');

    expect(error instanceof Error).toBe(true);
  });
});
