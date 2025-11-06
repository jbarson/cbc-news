# GitHub Copilot Instructions for CBC News RSS Web App

## Project Overview

This is a Next.js 14 web application that displays top stories from CBC News RSS feed. The app uses the App Router architecture and includes both grid and list view modes with accordion functionality.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** (strict mode enabled)
- **React 18** with client components where needed
- **Vitest** for unit testing
- **Testing Library** for React component testing
- **CSS** (no CSS-in-JS, use CSS modules or global styles)
- **rss-parser** for RSS feed parsing

## Project Structure

```
app/
├── api/rss/route.ts          # API route for RSS feed fetching
├── components/StoryCard.tsx  # Reusable story card component
├── page.tsx                  # Main page (client component)
├── layout.tsx                # Root layout
└── globals.css               # Global styles
```

## Code Style & Conventions

### TypeScript

- Use strict TypeScript with proper type annotations
- Export interfaces/types from relevant files (e.g., `RSSItem` from API route)
- Prefer interfaces over types for object shapes
- Use `'use client'` directive only when necessary (interactivity, hooks, browser APIs)

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Use descriptive prop names with TypeScript interfaces
- Handle loading and error states explicitly
- Use semantic HTML elements (article, section, etc.)

### Next.js App Router

- Use Server Components by default
- Mark client components with `'use client'` at the top
- API routes should be in `app/api/[route]/route.ts`
- Use Next.js `NextResponse` for API responses

### CSS Styling

- Use global CSS in `app/globals.css`
- Follow BEM-like naming: `.story-card`, `.story-card-list`, `.story-accordion-content`
- Use CSS custom properties for colors if needed
- Ensure responsive design (mobile-first approach)
- Use CSS Grid and Flexbox appropriately

### File Naming

- Components: PascalCase (`StoryCard.tsx`)
- Files: camelCase for utilities, kebab-case for configs
- Test files: `*.test.ts` or `*.test.tsx` in `__tests__` directories

## Security Requirements

### HTML Content Rendering

- **CRITICAL**: Always validate HTML content for JavaScript before rendering
- Use `dangerouslySetInnerHTML` only after validation
- The `containsJavaScript()` function must check for:
  - `<script>` tags
  - `javascript:` protocol
  - Event handlers (onclick, onerror, etc.)
  - Dangerous functions (eval, setTimeout, setInterval)
- Throw errors immediately if JavaScript is detected in content
- Never render unvalidated HTML from external sources

### API Routes

- Validate all input data
- Handle errors gracefully with proper status codes
- Return consistent JSON response format: `{ success: boolean, ... }`

## Testing Requirements

### Unit Tests

- Write tests for all components and API routes
- Use Vitest with Testing Library
- Test file structure: `__tests__/ComponentName.test.tsx`
- Test both positive and negative cases
- Mock external dependencies (e.g., RSS parser)

### Test Coverage

- Test user interactions (clicks, hovers)
- Test conditional rendering
- Test error states
- Test edge cases (missing data, empty strings, etc.)

### Test Conventions

- Use descriptive test names: `it('should do something specific', ...)`
- Group related tests with `describe` blocks
- Use `beforeEach` for test setup
- Mock external APIs and services

## UI/UX Patterns

### View Modes

- **Grid View**: Card-based layout with full content display
- **List View**: Accordion-based list with expandable content
- Toggle between views with a button in the header
- Maintain state for view mode preference

### Accordion Behavior

- Click title to expand/collapse
- Show `+` when collapsed, `−` when expanded
- Display content below title when expanded
- Show publication date and link below content in list view

### Image Handling

- In list view accordion: images float left, content on right
- Images should be responsive and properly sized
- Use `loading="lazy"` for performance
- Handle missing images gracefully

### Responsive Design

- Mobile-first approach
- Use CSS Grid with `repeat(auto-fill, minmax(...))` for responsive grids
- Ensure touch targets are at least 44x44px
- Test on various screen sizes

## Error Handling

### API Errors

- Return appropriate HTTP status codes
- Provide user-friendly error messages
- Log errors to console for debugging
- Show error UI to users

### Component Errors

- Use error boundaries where appropriate
- Display loading states during async operations
- Handle network failures gracefully
- Provide retry mechanisms (e.g., refresh button)

## Performance

- Use Next.js built-in optimizations
- Implement lazy loading for images
- Minimize client-side JavaScript
- Use Server Components when possible
- Cache API responses appropriately

## Code Quality

### Before Committing

- Run `npm test` to ensure all tests pass
- Run `npm run lint` to check for linting errors
- Ensure TypeScript compiles without errors
- Check that the app builds successfully (`npm run build`)

### Best Practices

- Keep functions small and focused
- Avoid deep nesting (>3 levels)
- Use meaningful variable and function names
- Add comments for complex logic
- Prefer composition over inheritance

## Dependencies

### Core Dependencies

- `next`: Framework
- `react`, `react-dom`: UI library
- `rss-parser`: RSS feed parsing

### Development Dependencies

- `vitest`: Test runner
- `@testing-library/react`: Component testing
- `typescript`: Type safety

### Adding New Dependencies

- Prefer Next.js recommended packages
- Check for TypeScript support
- Ensure compatibility with Next.js 14
- Document why the dependency is needed

## RSS Feed

### Source

- URL: `https://www.cbc.ca/webfeed/rss/rss-topstories`
- Format: Standard RSS 2.0
- Content: HTML in content fields

### Processing

- Parse with `rss-parser`
- Validate for JavaScript in content
- Extract title, link, pubDate, content, contentSnippet
- Handle missing or malformed data gracefully

## Git Workflow

- Use descriptive commit messages
- Keep commits focused and atomic
- Test before committing
- Update README if project structure changes significantly

## Additional Notes

- The app uses client-side data fetching for the main page
- RSS feed is fetched server-side via API route (CORS handling)
- All HTML content from RSS must be validated before rendering
- The app supports both grid and list view modes
- Images in list view are displayed at 50% width, centered above content
