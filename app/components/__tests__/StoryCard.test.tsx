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

    it('renders publication date in relative format', () => {
      render(<StoryCard story={mockStory} viewMode="grid" />);
      const dateElement = screen.getByText(/ago|just now/i);
      expect(dateElement).toBeInTheDocument();
      // Check that absolute time is in title attribute
      expect(dateElement).toHaveAttribute('title');
      const title = dateElement.getAttribute('title');
      expect(title).toMatch(/january|february|march|april|may|june|july|august|september|october|november|december/i);
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
      
      // Check for relative time format
      const dateElement = screen.getByText(/ago|just now/i);
      expect(dateElement).toBeInTheDocument();
      // Check that absolute time is in title attribute
      expect(dateElement).toHaveAttribute('title');
      const title = dateElement.getAttribute('title');
      expect(title).toMatch(/january|february|march|april|may|june|july|august|september|october|november|december/i);
      
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

    it('accordion has proper aria-controls attribute', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      expect(button).toHaveAttribute('aria-controls', `story-content-${mockStory.link}`);
    });

    it('accordion icon has aria-hidden attribute', () => {
      const { container } = render(<StoryCard story={mockStory} viewMode="list" />);
      const icon = container.querySelector('.accordion-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('supports keyboard navigation with Enter key', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      
      // Initially collapsed
      expect(screen.queryByText(/this is test content/i)).not.toBeInTheDocument();
      
      // Press Enter to expand
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Should now be expanded
      expect(screen.getByText(/this is test content/i)).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports keyboard navigation with Space key', () => {
      render(<StoryCard story={mockStory} viewMode="list" />);
      const button = screen.getByRole('button', { name: /test story title/i });
      
      // Initially collapsed
      expect(screen.queryByText(/this is test content/i)).not.toBeInTheDocument();
      
      // Press Space to expand
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      
      // Should now be expanded
      expect(screen.getByText(/this is test content/i)).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

