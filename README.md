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
│   │   └── rss/
│   │       └── route.ts      # API route for fetching RSS feed
│   ├── components/
│   │   └── StoryCard.tsx     # Story card component
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
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

