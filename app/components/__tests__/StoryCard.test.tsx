import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryCard from '../StoryCard';
import { RSSItem } from '../../api/rss/route';

describe('StoryCard', () => {
  const mockStory: RSSItem = {
    title: 'Test Story Title',
    link: 'https://example.com/story',
    pubDate: '2024-01-15T10:30:00Z',
    content: '<p>This is test content</p>',
    contentSnippet: 'This is test content',
  };

  describe('Grid View', () => {
    it('renders story title as a link', () => {
      render(<StoryCard story={mockStory} viewMode="grid" />);
      const link = screen.getByRole('link', { name: /test story title/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', mockStory.link);
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders story content', () => {
      render(<StoryCard story={mockStory} viewMode="grid" />);
      expect(screen.getByText(/this is test content/i)).toBeInTheDocument();
    });

    it('renders publication date', () => {
      render(<StoryCard story={mockStory} viewMode="grid" />);
      expect(screen.getByText(/january 15, 2024/i)).toBeInTheDocument();
    });

    it('renders read more link', () => {
      render(<StoryCard story={mockStory} viewMode="grid" />);
      const readMoreLink = screen.getByRole('link', { name: /read more/i });
      expect(readMoreLink).toBeInTheDocument();
      expect(readMoreLink).toHaveAttribute('href', mockStory.link);
    });

    it('handles missing content gracefully', () => {
      const storyWithoutContent: RSSItem = {
        ...mockStory,
        content: undefined,
        contentSnippet: undefined,
      };
      render(<StoryCard story={storyWithoutContent} viewMode="grid" />);
      expect(screen.getByRole('link', { name: /test story title/i })).toBeInTheDocument();
    });
  });

  describe('List View', () => {
    it('renders story title as a button', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows expand icon when collapsed', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('expands accordion when title is clicked', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      
      // Initially collapsed
      expect(screen.queryByText(/this is test content/i)).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(button);
      
      // Should now be expanded
      expect(screen.getByText(/this is test content/i)).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('−')).toBeInTheDocument();
    });

    it('collapses accordion when title is clicked again', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      
      // Expand
      fireEvent.click(button);
      expect(screen.getByText(/this is test content/i)).toBeInTheDocument();
      
      // Collapse
      fireEvent.click(button);
      expect(screen.queryByText(/this is test content/i)).not.toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows publication date and link when expanded', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      
      fireEvent.click(button);
      
      expect(screen.getByText(/january 15, 2024/i)).toBeInTheDocument();
      const readMoreLink = screen.getByRole('link', { name: /read full story/i });
      expect(readMoreLink).toBeInTheDocument();
      expect(readMoreLink).toHaveAttribute('href', mockStory.link);
    });

    it('handles empty date string', () => {
      const storyWithoutDate: RSSItem = {
        ...mockStory,
        pubDate: '',
      };
      render(<StoryCard story={storyWithoutDate} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      fireEvent.click(button);
      
      // Should not crash, date should be empty string
      expect(screen.getByRole('link', { name: /read full story/i })).toBeInTheDocument();
    });
  });
});

