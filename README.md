# CBC News Top Stories

A Next.js web application that displays the latest top stories from CBC News RSS feed.

## Features

- Fetches and displays top stories from CBC News RSS feed
- Responsive design that works on mobile and desktop
- Auto-refresh functionality
- Clean, modern UI with smooth animations
- Error handling and loading states

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **rss-parser** - RSS feed parsing library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── csp-report/
│   │   │   └── route.ts      # CSP violation reporting endpoint
│   │   └── rss/
│   │       └── route.ts      # API route for fetching RSS feed
│   ├── components/
│   │   └── StoryCard.tsx     # Story card component
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── middleware.ts             # Next.js middleware for security headers
├── package.json
├── tsconfig.json
└── next.config.js
```

## How It Works

1. The frontend (`app/page.tsx`) fetches data from the API route (`/api/rss`)
2. The API route (`app/api/rss/route.ts`) fetches the RSS feed from CBC News and parses it using `rss-parser`
3. The parsed data is returned as JSON and displayed in story cards
4. Users can manually refresh the stories using the refresh button

## RSS Feed Source

The app fetches from: `https://www.cbc.ca/webfeed/rss/rss-topstories`

## Security

### Content Security Policy (CSP)

This application implements Content Security Policy (CSP) headers to provide an additional layer of security against XSS attacks. The CSP is configured via middleware and can be controlled through environment variables.

#### Configuration

Set the `CSP_MODE` environment variable to control CSP behavior:

- `report-only` (default): CSP violations are reported but not blocked. Recommended for initial deployment.
- `enforce`: CSP violations are blocked. Use after monitoring report-only mode for 24-48 hours.
- `disabled`: CSP headers are not added.

#### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Content Security Policy Configuration
# Options: 'enforce', 'report-only', or 'disabled'
# Default: 'report-only'
CSP_MODE=report-only

# Optional: Custom CSP report endpoint URL
# Default: '/api/csp-report'
# CSP_REPORT_URI=/api/csp-report
```

#### CSP Policy Details

The CSP policy allows:
- **Scripts**: Same-origin scripts (Next.js requires `unsafe-inline` for compatibility)
- **Styles**: Same-origin styles with inline styles (required by Next.js)
- **Images**: Same-origin, CBC News domains (`www.cbc.ca`, `i.cbc.ca`), and data URIs
- **Fonts**: Same-origin and data URIs
- **Connections**: Same-origin API calls only
- **Frames**: None (no iframes allowed)
- **Forms**: None (no forms in the app)

#### CSP Violation Reporting

CSP violations are automatically reported to `/api/csp-report` when in report-only or enforce mode. The endpoint logs violations to the console. In production, consider integrating with a logging service (e.g., Sentry, LogRocket).

#### Additional Security Headers

The middleware also sets:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

#### Testing CSP

1. **Development**: Run `npm run dev` and check browser console for CSP violations
2. **Report-Only Mode**: Set `CSP_MODE=report-only` and monitor violations
3. **Enforcement**: After monitoring, set `CSP_MODE=enforce` to block violations

For more information, see [CSP_IMPLEMENTATION_PLAN.md](./CSP_IMPLEMENTATION_PLAN.md).

