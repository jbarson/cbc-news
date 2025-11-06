import { describe, it, expect } from 'vitest';
import {
  createStoryID,
  createStoryLink,
  createDateString,
  toStoryLink,
  toDateString,
  createNetworkError,
  createHTTPError,
  createValidationError,
  createParseError,
  createRateLimitError,
  createServerError,
  getErrorMessage,
} from '../index';

describe('Branded Types', () => {
  describe('createStoryID', () => {
    it('creates a valid story ID', () => {
      const id = createStoryID('story-123');
      expect(id).toBe('story-123');
    });

    it('throws error for empty string', () => {
      expect(() => createStoryID('')).toThrow('Invalid story ID');
    });

    it('throws error for non-string value', () => {
      expect(() => createStoryID(null as unknown as string)).toThrow('Invalid story ID');
    });
  });

  describe('createStoryLink', () => {
    it('creates a valid story link for http URL', () => {
      const link = createStoryLink('http://example.com/story');
      expect(link).toBe('http://example.com/story');
    });

    it('creates a valid story link for https URL', () => {
      const link = createStoryLink('https://example.com/story');
      expect(link).toBe('https://example.com/story');
    });

    it('throws error for invalid URL', () => {
      expect(() => createStoryLink('not-a-url')).toThrow('Invalid URL format');
    });

    it('throws error for empty string', () => {
      expect(() => createStoryLink('')).toThrow('Invalid story link');
    });
  });

  describe('createDateString', () => {
    it('creates a valid date string for ISO format', () => {
      const date = createDateString('2024-01-15T10:30:00Z');
      expect(date).toBe('2024-01-15T10:30:00Z');
    });

    it('creates a valid date string for common date format', () => {
      const date = createDateString('January 15, 2024');
      expect(date).toBe('January 15, 2024');
    });

    it('throws error for invalid date', () => {
      expect(() => createDateString('not-a-date')).toThrow('Invalid date format');
    });

    it('throws error for empty string', () => {
      expect(() => createDateString('')).toThrow('Invalid date string');
    });
  });

  describe('toStoryLink', () => {
    it('returns StoryLink for valid URL', () => {
      const link = toStoryLink('https://example.com');
      expect(link).toBe('https://example.com');
    });

    it('returns null for invalid URL', () => {
      const link = toStoryLink('not-a-url');
      expect(link).toBeNull();
    });

    it('returns null for empty string', () => {
      const link = toStoryLink('');
      expect(link).toBeNull();
    });
  });

  describe('toDateString', () => {
    it('returns DateString for valid date', () => {
      const date = toDateString('2024-01-15');
      expect(date).toBe('2024-01-15');
    });

    it('returns null for invalid date', () => {
      const date = toDateString('not-a-date');
      expect(date).toBeNull();
    });

    it('returns null for empty string', () => {
      const date = toDateString('');
      expect(date).toBeNull();
    });
  });
});

describe('Error Types', () => {
  describe('createNetworkError', () => {
    it('creates a network error with correct properties', () => {
      const error = createNetworkError('Connection failed');
      
      expect(error.type).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Connection failed');
      expect(error.timestamp).toBeDefined();
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('createHTTPError', () => {
    it('creates an HTTP error with correct properties', () => {
      const error = createHTTPError(404, 'Not found');
      
      expect(error.type).toBe('HTTP_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('createValidationError', () => {
    it('creates a validation error with message only', () => {
      const error = createValidationError('Invalid input');
      
      expect(error.type).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBeUndefined();
      expect(error.timestamp).toBeDefined();
    });

    it('creates a validation error with field', () => {
      const error = createValidationError('Invalid email', 'email');
      
      expect(error.type).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid email');
      expect(error.field).toBe('email');
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('createParseError', () => {
    it('creates a parse error with message only', () => {
      const error = createParseError('Failed to parse JSON');
      
      expect(error.type).toBe('PARSE_ERROR');
      expect(error.message).toBe('Failed to parse JSON');
      expect(error.details).toBeUndefined();
      expect(error.timestamp).toBeDefined();
    });

    it('creates a parse error with details', () => {
      const error = createParseError('Failed to parse JSON', 'Unexpected token at line 5');
      
      expect(error.type).toBe('PARSE_ERROR');
      expect(error.message).toBe('Failed to parse JSON');
      expect(error.details).toBe('Unexpected token at line 5');
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('createRateLimitError', () => {
    it('creates a rate limit error without retryAfter', () => {
      const error = createRateLimitError('Too many requests');
      
      expect(error.type).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Too many requests');
      expect(error.retryAfter).toBeUndefined();
      expect(error.timestamp).toBeDefined();
    });

    it('creates a rate limit error with retryAfter', () => {
      const error = createRateLimitError('Too many requests', 60);
      
      expect(error.type).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Too many requests');
      expect(error.retryAfter).toBe(60);
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('createServerError', () => {
    it('creates a server error', () => {
      const error = createServerError(500, 'Internal server error');
      
      expect(error.type).toBe('SERVER_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('getErrorMessage', () => {
    it('returns message for network error', () => {
      const error = createNetworkError('Connection failed');
      expect(getErrorMessage(error)).toBe('Connection failed');
    });

    it('returns message for HTTP error', () => {
      const error = createHTTPError(404, 'Not found');
      expect(getErrorMessage(error)).toBe('Not found');
    });

    it('returns message for rate limit error without retryAfter', () => {
      const error = createRateLimitError('Too many requests');
      expect(getErrorMessage(error)).toBe('Too many requests');
    });

    it('returns message with retry info for rate limit error with retryAfter', () => {
      const error = createRateLimitError('Too many requests', 60);
      expect(getErrorMessage(error)).toBe('Too many requests. Please try again in 60 seconds.');
    });

    it('returns message for server error', () => {
      const error = createServerError(500, 'Internal error');
      expect(getErrorMessage(error)).toBe('Internal error');
    });

    it('returns message for validation error without field', () => {
      const error = createValidationError('Invalid input');
      expect(getErrorMessage(error)).toBe('Invalid input');
    });

    it('returns message with field for validation error with field', () => {
      const error = createValidationError('Invalid format', 'email');
      expect(getErrorMessage(error)).toBe('email: Invalid format');
    });

    it('returns message for parse error without details', () => {
      const error = createParseError('Parse failed');
      expect(getErrorMessage(error)).toBe('Parse failed');
    });

    it('returns message with details for parse error with details', () => {
      const error = createParseError('Parse failed', 'Line 5');
      expect(getErrorMessage(error)).toBe('Parse failed: Line 5');
    });
  });
});
