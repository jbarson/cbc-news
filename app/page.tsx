'use client';

import { useState, useEffect } from 'react';
import StoryCard from './components/StoryCard';
import { RSSItem } from './api/rss/route';

interface RSSResponse {
  success: boolean;
  title?: string;
  description?: string;
  items?: RSSItem[];
  error?: string;
}

type ViewMode = 'grid' | 'list';

export default function Home() {
  const [stories, setStories] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const fetchStories = async () => {
    try {
      setError(null);
      const response = await fetch('/api/rss');
      const data: RSSResponse = await response.json();

      if (data.success && data.items) {
        setStories(data.items);
      } else {
        setError(data.error || 'Failed to fetch stories');
      }
    } catch (err) {
      setError('An error occurred while fetching stories');
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
    return (
      <div className="container">
        <div className="header">
          <h1>CBC News Top Stories</h1>
          <p>Loading the latest stories...</p>
        </div>
        <div className="loading">Loading stories...</div>
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
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
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

