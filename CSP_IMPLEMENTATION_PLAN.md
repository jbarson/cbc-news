# Content Security Policy (CSP) Implementation Plan
## Issue #19 / #22

## Overview
This plan outlines the implementation of Content Security Policy (CSP) headers for the CBC News RSS web application. CSP provides an additional layer of security by preventing XSS attacks and controlling resource loading, even though content is already sanitized.

## Current Security Context

### Existing Security Measures
- ✅ Content sanitization via `containsJavaScript()` function in `app/api/rss/route.ts`
- ✅ Filtering of malicious stories before rendering
- ✅ Use of `rel="noopener noreferrer"` on external links
- ✅ Type-safe error handling

### Security Gaps
- ❌ No CSP headers currently implemented
- ⚠️ Use of `dangerouslySetInnerHTML` for RSS content (sanitized but not CSP-protected)
- ⚠️ External images from CBC News RSS feed
- ⚠️ External links to CBC News articles

## Implementation Strategy

### Phase 1: Analysis & Planning ✅ (Current)
- [x] Review current codebase structure
- [x] Identify all resource sources (scripts, styles, images, fonts, etc.)
- [x] Document CSP requirements
- [x] Create implementation plan

### Phase 2: CSP Configuration Design

#### Resource Sources Identified
1. **Scripts**
   - Self: Next.js runtime, React, client components
   - Inline: None currently (Next.js handles this)
   - External: None

2. **Styles**
   - Self: `app/globals.css`
   - Inline: None
   - External: None

3. **Images**
   - Self: None (no local images)
   - External: CBC News RSS feed images (`https://www.cbc.ca/*`, `https://i.cbc.ca/*`)

4. **Fonts**
   - Self: System fonts (no custom fonts currently)
   - External: None

5. **Connections**
   - Self: `/api/rss` endpoint
   - External: `https://www.cbc.ca/webfeed/rss/rss-topstories` (server-side only)

6. **Frames**
   - None needed

7. **Other**
   - `data:` URIs: Not needed
   - `blob:` URIs: Not needed

#### Proposed CSP Policy

**Strict Policy (Recommended for Production)**
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';  # Next.js requires these in dev
style-src 'self' 'unsafe-inline';  # Next.js uses inline styles
img-src 'self' https://www.cbc.ca https://i.cbc.ca data:;  # CBC images + data URIs for fallbacks
font-src 'self' data:;
connect-src 'self';
frame-src 'none';
base-uri 'self';
form-action 'none';
upgrade-insecure-requests;
```

**Note**: `'unsafe-eval'` and `'unsafe-inline'` are required for Next.js development mode. In production, Next.js optimizes and these may not be needed, but we should test.

**Alternative: Report-Only Mode (Recommended for Initial Deployment)**
Start with `Content-Security-Policy-Report-Only` to monitor violations without blocking resources.

### Phase 3: Implementation Options

#### Option A: Next.js Middleware (Recommended)
**Pros:**
- Centralized header management
- Can be environment-aware (dev vs production)
- Easy to test and maintain
- Supports report-only mode

**Cons:**
- Requires creating middleware file
- Runs on every request (minimal overhead)

**Implementation:**
- Create `middleware.ts` in project root
- Use Next.js `NextResponse` to add headers
- Support both enforcement and report-only modes

#### Option B: Next.js Headers in `next.config.js`
**Pros:**
- Simple configuration
- No additional files

**Cons:**
- Less flexible
- Harder to make environment-specific
- No report-only mode support

#### Option C: Headers in `app/layout.tsx` Metadata
**Pros:**
- Next.js 13+ native approach
- Type-safe

**Cons:**
- Limited CSP directive support
- Less flexible than middleware

**Recommendation: Option A (Middleware)**

### Phase 4: Implementation Steps

#### Step 1: Create Middleware File
- [ ] Create `middleware.ts` in project root
- [ ] Implement CSP header generation function
- [ ] Add environment detection (dev vs production)
- [ ] Support report-only mode via environment variable

#### Step 2: Configure CSP Directives
- [ ] Define base CSP policy
- [ ] Add CBC News image domains
- [ ] Configure script/style sources for Next.js
- [ ] Set strict defaults (frame-src 'none', form-action 'none', etc.)

#### Step 3: Environment Configuration
- [ ] Add `CSP_MODE` environment variable (enforce/report-only)
- [ ] Configure different policies for dev vs production
- [ ] Document environment variables in README

#### Step 4: Testing
- [ ] Test in development mode
- [ ] Verify images from CBC News load correctly
- [ ] Test API routes work
- [ ] Check browser console for CSP violations
- [ ] Test with report-only mode first
- [ ] Verify no false positives

#### Step 5: CSP Reporting (Optional but Recommended)
- [ ] Set up CSP reporting endpoint (`/api/csp-report`)
- [ ] Log violations for monitoring
- [ ] Use report-uri or report-to directive

#### Step 6: Documentation
- [ ] Update README with CSP information
- [ ] Document environment variables
- [ ] Add troubleshooting guide
- [ ] Document how to test CSP

#### Step 7: Production Deployment
- [ ] Deploy with report-only mode first
- [ ] Monitor for violations (24-48 hours)
- [ ] Switch to enforcement mode
- [ ] Monitor for issues

## Technical Details

### File Structure
```
/
├── middleware.ts              # NEW: CSP middleware
├── app/
│   └── api/
│       └── csp-report/
│           └── route.ts       # NEW: CSP violation reporting endpoint (optional)
└── .env.example               # NEW: Environment variable examples
```

### Middleware Implementation Outline

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Generate CSP header based on environment
  const cspHeader = generateCSPHeader();
  
  // Add CSP header (enforce or report-only)
  const cspMode = process.env.CSP_MODE || 'report-only';
  const headerName = cspMode === 'enforce' 
    ? 'Content-Security-Policy' 
    : 'Content-Security-Policy-Report-Only';
  
  response.headers.set(headerName, cspHeader);
  
  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### CSP Directives Breakdown

| Directive | Value | Reason |
|-----------|-------|--------|
| `default-src` | `'self'` | Default: only allow same-origin resources |
| `script-src` | `'self' 'unsafe-eval' 'unsafe-inline'` | Next.js requires these in dev (test if needed in prod) |
| `style-src` | `'self' 'unsafe-inline'` | Next.js uses inline styles |
| `img-src` | `'self' https://www.cbc.ca https://i.cbc.ca data:` | Allow CBC News images + data URIs |
| `font-src` | `'self' data:` | System fonts + data URIs for fallbacks |
| `connect-src` | `'self'` | API calls to same origin |
| `frame-src` | `'none'` | No iframes allowed |
| `base-uri` | `'self'` | Only allow same-origin base tags |
| `form-action` | `'none'` | No forms in app |
| `upgrade-insecure-requests` | (no value) | Upgrade HTTP to HTTPS |

## Testing Strategy

### Manual Testing Checklist
- [ ] Load homepage - verify no CSP violations
- [ ] Load stories with images - verify CBC images display
- [ ] Click external links - verify they work
- [ ] Test grid/list view toggle
- [ ] Test refresh functionality
- [ ] Check browser console for violations
- [ ] Test in both dev and production builds

### Automated Testing
- [ ] Add unit tests for CSP header generation
- [ ] Add integration tests for middleware
- [ ] Test CSP report endpoint (if implemented)
- [ ] Verify headers are set correctly

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

### Trade-offs
1. **`'unsafe-inline'` for scripts/styles**: Required for Next.js, but we should test if production build needs it
2. **External image domains**: Must allow CBC News domains, but this is necessary for functionality
3. **Report-only mode**: Allows monitoring without breaking functionality

### Best Practices
- Start with report-only mode
- Monitor violations before enforcing
- Use strict defaults (`frame-src 'none'`, `form-action 'none'`)
- Upgrade insecure requests
- Add additional security headers (X-Content-Type-Options, etc.)

## Rollback Plan
If CSP causes issues:
1. Switch to report-only mode via environment variable
2. Remove CSP headers entirely (comment out middleware)
3. Investigate violations and adjust policy
4. Re-enable after fixes

## Success Criteria
- [ ] CSP headers are set on all pages
- [ ] No false positive violations
- [ ] All functionality works correctly
- [ ] Images from CBC News load properly
- [ ] API routes function correctly
- [ ] No console errors related to CSP
- [ ] Documentation is complete

## Timeline Estimate
- **Phase 1**: ✅ Complete (Analysis)
- **Phase 2**: 1-2 hours (Configuration design)
- **Phase 3**: 2-3 hours (Implementation)
- **Phase 4**: 1-2 hours (Testing)
- **Phase 5**: 1 hour (Documentation)
- **Total**: ~6-8 hours

## Next Steps
1. Review and approve this plan
2. Create `middleware.ts` file
3. Implement CSP header generation
4. Test in development
5. Deploy to staging with report-only mode
6. Monitor for 24-48 hours
7. Switch to enforcement mode
8. Document in README

## References
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js: Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Tool to validate CSP policies
- [OWASP: Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

