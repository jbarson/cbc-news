/**
 * Branded types for type safety
 * These types help prevent mixing up different string values
 */

// Branded type helper
declare const brand: unique symbol;
type Brand<T, TBrand> = T & { readonly [brand]: TBrand };

// Branded string types for IDs and URLs
export type StoryID = Brand<string, 'StoryID'>;
export type StoryLink = Brand<string, 'StoryLink'>;
export type DateString = Brand<string, 'DateString'>;

// Type guards to create branded types safely
export function createStoryID(id: string): StoryID {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid story ID');
  }
  return id as StoryID;
}

export function createStoryLink(link: string): StoryLink {
  if (!link || typeof link !== 'string') {
    throw new Error('Invalid story link');
  }
  // Basic URL validation
  try {
    // eslint-disable-next-line no-new
    new URL(link);
  } catch {
    throw new Error(`Invalid URL format: ${link}`);
  }
  return link as StoryLink;
}

export function createDateString(date: string): DateString {
  if (!date || typeof date !== 'string') {
    throw new Error('Invalid date string');
  }
  // Validate it's a parseable date
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${date}`);
  }
  return date as DateString;
}

// Safe conversion functions that don't throw
export function toStoryLink(link: string): StoryLink | null {
  try {
    return createStoryLink(link);
  } catch {
    return null;
  }
}

export function toDateString(date: string): DateString | null {
  try {
    return createDateString(date);
  } catch {
    return null;
  }
}

/**
 * Error types for better error handling
 */

// Base error type
export interface AppError {
  readonly type: string;
  readonly message: string;
  readonly statusCode?: number;
  readonly timestamp: string;
}

// Specific error types
export interface NetworkError extends AppError {
  readonly type: 'NETWORK_ERROR';
  readonly statusCode?: never;
}

export interface HTTPError extends AppError {
  readonly type: 'HTTP_ERROR';
  readonly statusCode: number;
}

export interface ValidationError extends AppError {
  readonly type: 'VALIDATION_ERROR';
  readonly field?: string;
}

export interface ParseError extends AppError {
  readonly type: 'PARSE_ERROR';
  readonly details?: string;
}

export interface RateLimitError extends AppError {
  readonly type: 'RATE_LIMIT_ERROR';
  readonly statusCode: 429;
  readonly retryAfter?: number;
}

export interface ServerError extends AppError {
  readonly type: 'SERVER_ERROR';
  readonly statusCode: number;
}

// Union type for all possible errors
export type ErrorType =
  | NetworkError
  | HTTPError
  | ValidationError
  | ParseError
  | RateLimitError
  | ServerError;

// Error factory functions
export function createNetworkError(message: string): NetworkError {
  return {
    type: 'NETWORK_ERROR',
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createHTTPError(statusCode: number, message: string): HTTPError {
  return {
    type: 'HTTP_ERROR',
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createValidationError(
  message: string,
  field?: string
): ValidationError {
  return {
    type: 'VALIDATION_ERROR',
    message,
    field,
    timestamp: new Date().toISOString(),
  };
}

export function createParseError(
  message: string,
  details?: string
): ParseError {
  return {
    type: 'PARSE_ERROR',
    message,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function createRateLimitError(
  message: string,
  retryAfter?: number
): RateLimitError {
  return {
    type: 'RATE_LIMIT_ERROR',
    statusCode: 429,
    message,
    retryAfter,
    timestamp: new Date().toISOString(),
  };
}

export function createServerError(
  statusCode: number,
  message: string
): ServerError {
  return {
    type: 'SERVER_ERROR',
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
}

// Helper to get user-friendly error message
export function getErrorMessage(error: ErrorType): string {
  switch (error.type) {
    case 'NETWORK_ERROR':
      return error.message;
    case 'HTTP_ERROR':
      return error.message;
    case 'RATE_LIMIT_ERROR':
      return error.retryAfter
        ? `${error.message}. Please try again in ${error.retryAfter} seconds.`
        : error.message;
    case 'SERVER_ERROR':
      return error.message;
    case 'VALIDATION_ERROR':
      return error.field ? `${error.field}: ${error.message}` : error.message;
    case 'PARSE_ERROR':
      return error.details ? `${error.message}: ${error.details}` : error.message;
    default:
      // This should never be reached due to exhaustive error type checking
      return 'An unexpected error occurred';
  }
}
