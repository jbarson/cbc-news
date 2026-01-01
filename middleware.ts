import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Generates Content Security Policy header based on environment
 * @param isDevelopment - Whether we're in development mode
 * @param reportUri - Optional CSP report endpoint URL
 * @returns CSP header string
 */
function generateCSPHeader(isDevelopment: boolean, reportUri?: string): string {
  const directives: string[] = [];

  // Default source: only allow same-origin resources
  directives.push("default-src 'self'");

  // Script sources
  // Note: Next.js requires 'unsafe-eval' and 'unsafe-inline' in development
  // In production, Next.js optimizes and these may not be needed, but we include them
  // to ensure compatibility. Consider testing without them in production.
  if (isDevelopment) {
    directives.push("script-src 'self' 'unsafe-eval' 'unsafe-inline'");
  } else {
    // In production, Next.js uses nonces/hashes, but we keep unsafe-inline for compatibility
    directives.push("script-src 'self' 'unsafe-inline'");
  }

  // Style sources - Next.js uses inline styles
  directives.push("style-src 'self' 'unsafe-inline'");

  // Image sources - allow CBC News domains and data URIs
  directives.push("img-src 'self' https://www.cbc.ca https://i.cbc.ca https://*.cbc.ca data:");

  // Font sources - system fonts and data URIs
  directives.push("font-src 'self' data:");

  // Connection sources - only same-origin API calls
  // Note: RSS feed fetching happens server-side, so no external connect needed
  directives.push("connect-src 'self'");

  // Frame sources - no iframes allowed
  directives.push("frame-src 'none'");

  // Base URI - only allow same-origin base tags
  directives.push("base-uri 'self'");

  // Form action - no forms in this app
  directives.push("form-action 'none'");

  // Upgrade insecure requests to HTTPS
  directives.push('upgrade-insecure-requests');

  // Add report-uri if provided
  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }

  return directives.join('; ');
}

/**
 * Middleware to add security headers including Content Security Policy
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Determine if we're in development mode
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  // Get CSP mode from environment variable (default: 'report-only')
  // Options: 'enforce', 'report-only', or 'disabled'
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const cspMode = process.env['CSP_MODE'] || 'report-only';

  // Generate CSP header
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const reportUri = process.env['CSP_REPORT_URI'] || '/api/csp-report';
  const cspHeader = generateCSPHeader(isDevelopment, reportUri);

  // Add CSP header based on mode
  if (cspMode === 'enforce') {
    response.headers.set('Content-Security-Policy', cspHeader);
  } else if (cspMode === 'report-only') {
    response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
  }
  // If 'disabled', don't add CSP headers

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - we'll handle CSP there if needed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (if any)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

