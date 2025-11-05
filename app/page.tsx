'use client';

import { useState, useEffect } from 'react';
import StoryCard from './components/StoryCard';
import StoryCardSkeleton from './components/StoryCardSkeleton';
import { RSSItem } from './api/rss/route';

interface RSSResponse {
  success: boolean;
  title?: string;
  description?: string;
  items?: RSSItem[];
  error?: string;
}

type ViewMode = 'grid' | 'list';

const SKELETON_COUNT = 6;

export default function Home() {
  const [stories, setStories] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Check window availability for SSR/build time
    if (typeof window === 'undefined') {
      return 'grid';
    }
    const saved = localStorage.getItem('viewMode') as ViewMode;
    return saved === 'grid' || saved === 'list' ? saved : 'grid';
  });

  const fetchStories = async () => {
    try {
      setError(null);
      const response = await fetch('/api/rss');
      const data: RSSResponse = await response.json();

      if (data.success && data.items) {
        setStories(data.items);
      } else if (response.status === 429) {
        // Provide more specific error messages based on context
        setError('Too many requests. Please wait a moment before refreshing.');
      } else if (response.status >= 500) {
        setError('Unable to fetch stories. The server may be temporarily unavailable. Please try again in a few moments.');
      } else if (response.status === 404) {
        setError('RSS feed not found. Please check back later.');
      } else {
        setError(data.error || 'Failed to fetch stories. Please check your connection and try again.');
      }
    } catch (err) {
      // Network errors or other fetch failures
      setError('Failed to connect to the server. Please check your internet connection and try again.');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStories();
  };

  if (loading) {
    // Generate skeleton loaders without using array index as key
    const skeletonKeys = Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${viewMode}-${Date.now()}-${i}`);
    
    return (
      <div className="container">
        <div className="header">
          <h1>CBC News Top Stories</h1>
          <p>Loading the latest stories...</p>
        </div>
        <div className={viewMode === 'grid' ? 'stories-grid' : 'stories-list'}>
          {skeletonKeys.map((key) => (
            <StoryCardSkeleton key={key} viewMode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>CBC News Top Stories</h1>
        </div>
        <div className="error">
          <p>{error}</p>
          <button type="button" className="refresh-button" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>CBC News Top Stories</h1>
        <p>Stay informed with the latest news from CBC</p>
        <div className="header-controls">
          <button
            type="button"
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Stories'}
          </button>
          <button
            type="button"
            className="view-toggle-button"
            onClick={() => {
              const newMode = viewMode === 'grid' ? 'list' : 'grid';
              setViewMode(newMode);
              localStorage.setItem('viewMode', newMode);
            }}
            aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? '📋 List View' : '🔲 Grid View'}
          </button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="loading">No stories available</div>
      ) : (
        <div className={viewMode === 'grid' ? 'stories-grid' : 'stories-list'}>
          {stories.map((story, index) => (
            <StoryCard key={story.link || index} story={story} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}

