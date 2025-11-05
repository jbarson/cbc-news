import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StoryCardSkeleton from '../StoryCardSkeleton';

describe('StoryCardSkeleton', () => {
  describe('Grid View', () => {
    it('renders skeleton elements for grid view', () => {
      render(<StoryCardSkeleton viewMode="grid" />);
      const article = screen.getByRole('article');
      expect(article).toHaveClass('story-card-skeleton');
      
      // Check for skeleton elements
      const title = article.querySelector('.skeleton-title');
      const contentLines = article.querySelectorAll('.skeleton-content-line');
      const meta = article.querySelector('.skeleton-meta');
      
      expect(title).toBeInTheDocument();
      expect(contentLines.length).toBeGreaterThan(0);
      expect(meta).toBeInTheDocument();
    });
  });

  describe('List View', () => {
    it('renders skeleton elements for list view', () => {
      render(<StoryCardSkeleton viewMode="list" />);
      const article = screen.getByRole('article');
      expect(article).toHaveClass('story-card-skeleton');
      expect(article).toHaveClass('story-card-list');
      
      // Check for skeleton elements
      const title = article.querySelector('.skeleton-title');
      const content = article.querySelector('.skeleton-content');
      
      expect(title).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });
});
