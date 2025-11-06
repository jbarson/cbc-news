import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock rss-parser before importing the route
const mockParseURL = vi.fn();
vi.mock('rss-parser', async () => {
  const actual = await vi.importActual('rss-parser');
  return {
    ...actual,
    default: vi.fn().mockImplementation(() => ({
      parseURL: mockParseURL,
    })),
  };
});

// Dynamic import to ensure mock is applied
const getRoute = async () => {
  const route = await import('../rss/route');
  return route.GET;
};

describe('RSS API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('containsJavaScript', () => {
    // We need to test the containsJavaScript function indirectly through GET
    // Since it's not exported, we'll test it through the API route behavior

    it('returns success response with valid RSS feed', async () => {
      const mockFeed = {
        title: 'CBC News',
        description: 'Top Stories',
        items: [
          {
            title: 'Test Story',
            link: 'https://example.com/story',
            pubDate: '2024-01-15T10:30:00Z',
            content: '<p>Safe content</p>',
            contentSnippet: 'Safe content',
          },
        ],
      };

      mockParseURL.mockResolvedValue(mockFeed);

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].title).toBe('Test Story');
    });

    it('filters out story when content contains script tags', async () => {
      const mockFeed = {
        title: 'CBC News',
        description: 'Top Stories',
        items: [
          {
            title: 'Malicious Story',
            link: 'https://example.com/story',
            pubDate: '2024-01-15T10:30:00Z',
            content: '<script>alert("xss")</script><p>Content</p>',
            contentSnippet: 'Content',
          },
        ],
      };

      mockParseURL.mockResolvedValue(mockFeed);

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      // Should successfully filter out malicious content
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(0);
    });

    it('filters out story when content contains javascript: protocol', async () => {
      const mockFeed = {
        title: 'CBC News',
        description: 'Top Stories',
        items: [
          {
            title: 'Malicious Story',
            link: 'https://example.com/story',
            pubDate: '2024-01-15T10:30:00Z',
            content: '<a href="javascript:alert(1)">Click</a>',
            contentSnippet: 'Click',
          },
        ],
      };

      mockParseURL.mockResolvedValue(mockFeed);

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      // Should successfully filter out malicious content
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(0);
    });

    it('filters out story when content contains event handlers', async () => {
      const mockFeed = {
        title: 'CBC News',
        description: 'Top Stories',
        items: [
          {
            title: 'Malicious Story',
            link: 'https://example.com/story',
            pubDate: '2024-01-15T10:30:00Z',
            content: '<div onclick="alert(1)">Click me</div>',
            contentSnippet: 'Click me',
          },
        ],
      };

      mockParseURL.mockResolvedValue(mockFeed);

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      // Should successfully filter out malicious content
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(0);
    });

    it('filters out story when content contains eval', async () => {
      const mockFeed = {
        title: 'CBC News',
        description: 'Top Stories',
        items: [
          {
            title: 'Malicious Story',
            link: 'https://example.com/story',
            pubDate: '2024-01-15T10:30:00Z',
            content: '<p>eval("alert(1)")</p>',
            contentSnippet: 'eval("alert(1)")',
          },
        ],
      };

      mockParseURL.mockResolvedValue(mockFeed);

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      // Should successfully filter out malicious content
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(0);
    });

    it('handles missing fields gracefully', async () => {
      const mockFeed = {
        title: 'CBC News',
        description: 'Top Stories',
        items: [
          {
            title: '',
            link: '',
            pubDate: '',
            content: undefined,
            contentSnippet: undefined,
          },
        ],
      };

      mockParseURL.mockResolvedValue(mockFeed);

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      // With strict validation, empty strings for link and pubDate will be filtered out
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(0); // Empty strings fail validation
    });

    it('handles RSS parser errors', async () => {
      mockParseURL.mockRejectedValue(new Error('Network error'));

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.type).toBe('SERVER_ERROR');
      expect(data.error.message).toBe('Failed to fetch RSS feed');
    });

    it('filters out malicious items while keeping safe ones', async () => {
      const mockFeed = {
        title: 'CBC News',
        description: 'Top Stories',
        items: [
          {
            title: 'Safe Story',
            link: 'https://example.com/safe',
            pubDate: '2024-01-15T10:30:00Z',
            content: '<p>Safe content</p>',
            contentSnippet: 'Safe content',
          },
          {
            title: 'Malicious Story',
            link: 'https://example.com/malicious',
            pubDate: '2024-01-15T10:30:00Z',
            content: '<script>alert("xss")</script>',
            contentSnippet: 'Malicious',
          },
        ],
      };

      mockParseURL.mockResolvedValue(mockFeed);

      const GET = await getRoute();
      const response = await GET();
      const data = await response.json();

      // Should successfully filter out malicious item while keeping safe one
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].title).toBe('Safe Story');
    });
  });
});

