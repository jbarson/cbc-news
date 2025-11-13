import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DarkModeToggle from '../DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document theme attribute
    document.documentElement.removeAttribute('data-theme');
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders dark mode toggle button', async () => {
    render(<DarkModeToggle />);
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('shows light mode icon initially', async () => {
    render(<DarkModeToggle />);
    await waitFor(() => {
      expect(screen.getByText(/🌙 dark mode/i)).toBeInTheDocument();
    });
  });

  it('toggles theme when clicked', async () => {
    render(<DarkModeToggle />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    
    // Initially should be light mode
    expect(screen.getByText(/🌙 dark mode/i)).toBeInTheDocument();
    
    // Click to toggle to dark mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/☀️ light mode/i)).toBeInTheDocument();
    });
    
    // Click again to toggle back to light mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/🌙 dark mode/i)).toBeInTheDocument();
    });
  });

  it('saves theme preference to localStorage', async () => {
    render(<DarkModeToggle />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    
    // Click to toggle to dark mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('dark');
    });
    
    // Click again to toggle back to light mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  it('sets data-theme attribute on document element', async () => {
    render(<DarkModeToggle />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    
    // Wait for initial theme to be set
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
    
    // Click to toggle to dark mode
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('loads saved theme preference from localStorage', async () => {
    // Pre-set dark mode in localStorage
    localStorage.setItem('theme', 'dark');
    
    render(<DarkModeToggle />);
    
    await waitFor(() => {
      expect(screen.getByText(/☀️ light mode/i)).toBeInTheDocument();
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('respects system preference when no saved preference', async () => {
    // Mock prefers-color-scheme: dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    render(<DarkModeToggle />);
    
    await waitFor(() => {
      expect(screen.getByText(/☀️ light mode/i)).toBeInTheDocument();
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('has proper aria-label', async () => {
    render(<DarkModeToggle />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  it('has proper title attribute', async () => {
    render(<DarkModeToggle />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });
  });
});
