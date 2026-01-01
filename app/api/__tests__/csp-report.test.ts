import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../csp-report/route';

// Mock console methods
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('CSP Report Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 204 for valid CSP violation report', async () => {
    const validReport = {
      'csp-report': {
        'document-uri': 'http://localhost:3000/',
        'referrer': '',
        'violated-directive': 'script-src',
        'effective-directive': 'script-src',
        'original-policy': "default-src 'self'",
        'disposition': 'report' as const,
        'blocked-uri': 'inline',
        'status-code': 200,
        'source-file': 'http://localhost:3000/',
        'line-number': 10,
        'column-number': 5,
      },
    };

    const request = new NextRequest('http://localhost:3000/api/csp-report', {
      method: 'POST',
      body: JSON.stringify(validReport),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'CSP Violation Report:',
      expect.objectContaining({
        documentUri: 'http://localhost:3000/',
        violatedDirective: 'script-src',
        blockedUri: 'inline',
      })
    );
  });

  it('should return 400 for invalid CSP report format', async () => {
    const invalidReport = {
      invalid: 'data',
    };

    const request = new NextRequest('http://localhost:3000/api/csp-report', {
      method: 'POST',
      body: JSON.stringify(invalidReport),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid CSP report format');
  });

  it('should return 204 and log error for malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/csp-report', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing CSP report:',
      expect.any(Error)
    );
  });

  it('should handle missing optional fields in CSP report', async () => {
    const minimalReport = {
      'csp-report': {
        'document-uri': 'http://localhost:3000/',
        'referrer': '',
        'violated-directive': 'script-src',
        'effective-directive': 'script-src',
        'original-policy': "default-src 'self'",
        'disposition': 'report' as const,
        'blocked-uri': 'inline',
        'status-code': 200,
      },
    };

    const request = new NextRequest('http://localhost:3000/api/csp-report', {
      method: 'POST',
      body: JSON.stringify(minimalReport),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should log violation with all available fields', async () => {
    const fullReport = {
      'csp-report': {
        'document-uri': 'http://localhost:3000/test',
        'referrer': 'http://localhost:3000/',
        'violated-directive': 'img-src',
        'effective-directive': 'img-src',
        'original-policy': "img-src 'self'",
        'disposition': 'enforce' as const,
        'blocked-uri': 'https://example.com/image.jpg',
        'status-code': 200,
        'source-file': 'http://localhost:3000/script.js',
        'line-number': 42,
        'column-number': 10,
      },
    };

    const request = new NextRequest('http://localhost:3000/api/csp-report', {
      method: 'POST',
      body: JSON.stringify(fullReport),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await POST(request);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'CSP Violation Report:',
      expect.objectContaining({
        documentUri: 'http://localhost:3000/test',
        violatedDirective: 'img-src',
        blockedUri: 'https://example.com/image.jpg',
        sourceFile: 'http://localhost:3000/script.js',
        lineNumber: 42,
        columnNumber: 10,
        timestamp: expect.any(String),
      })
    );
  });
});

