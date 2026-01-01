import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CSP Violation Report Interface
 * Based on W3C CSP Reporting API
 */
interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': 'enforce' | 'report';
    'blocked-uri': string;
    'status-code': number;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
  };
}

/**
 * POST handler for CSP violation reports
 * Logs violations for monitoring and debugging
 */
export async function POST(request: NextRequest) {
  try {
    const body: CSPViolationReport = await request.json();

    // Validate the report structure
    if (!body['csp-report']) {
      return NextResponse.json(
        { error: 'Invalid CSP report format' },
        { status: 400 }
      );
    }

    const report = body['csp-report'];

    // Log the violation (in production, you might want to send this to a logging service)
    console.warn('CSP Violation Report:', {
      documentUri: report['document-uri'],
      violatedDirective: report['violated-directive'],
      blockedUri: report['blocked-uri'],
      sourceFile: report['source-file'],
      lineNumber: report['line-number'],
      columnNumber: report['column-number'],
      timestamp: new Date().toISOString(),
    });

    // In a production environment, you might want to:
    // 1. Send to a logging service (e.g., Sentry, LogRocket)
    // 2. Store in a database for analysis
    // 3. Send alerts for critical violations

    // Return 204 No Content as per CSP reporting spec
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Log parsing errors but don't expose them to the client
    console.error('Error processing CSP report:', error);
    return new NextResponse(null, { status: 204 });
  }
}

