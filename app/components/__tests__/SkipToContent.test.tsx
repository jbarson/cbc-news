import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkipToContent from '../SkipToContent';

describe('SkipToContent', () => {
  it('renders skip to content link', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
  });

  it('has correct href to main content', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('has proper accessibility class', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveClass('skip-to-content');
  });
});
