'use client';

import { useState } from 'react';
import { RSSItem } from '../api/rss/route';

interface StoryCardProps {
  story: RSSItem;
  viewMode: 'grid' | 'list';
}

export default function StoryCard({ story, viewMode }: StoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string): { relativeTime: string; absoluteTime: string } => {
    if (!dateString) {
      return { relativeTime: '', absoluteTime: '' };
    }
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      // Format relative time
      let relativeTime = '';
      if (diffSeconds < 60) {
        relativeTime = 'Just now';
      } else if (diffMinutes < 60) {
        relativeTime = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        relativeTime = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        relativeTime = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else if (diffWeeks < 4) {
        relativeTime = `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
      } else if (diffMonths < 12) {
        relativeTime = `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
      } else {
        relativeTime = `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
      }

      // Format absolute time for tooltip
      const absoluteTime = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return { relativeTime, absoluteTime };
    } catch {
      return { relativeTime: dateString, absoluteTime: dateString };
    }
  };

  const content = story.content || story.contentSnippet || '';

  if (viewMode === 'list') {
    return (
      <article className="story-card story-card-list">
        <h2>
          <button
            type="button"
            className="story-accordion-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={`story-content-${story.link}`}
          >
            {story.title}
            <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
          </button>
        </h2>
        {isExpanded && (
          <>
            {content && (
              <div 
                id={`story-content-${story.link}`}
                className="story-accordion-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
            <div className="story-accordion-meta">
              <span className="story-date" title={formatDate(story.pubDate).absoluteTime}>
                {formatDate(story.pubDate).relativeTime}
              </span>
              <a
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
                className="story-link"
              >
                Read full story →
              </a>
            </div>
          </>
        )}
      </article>
    );
  }

  return (
    <article className="story-card">
      <h2>
        <a href={story.link} target="_blank" rel="noopener noreferrer">
          {story.title}
        </a>
      </h2>
      {content && (
        <div 
          className="story-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      <div className="story-meta">
        <span className="story-date" title={formatDate(story.pubDate).absoluteTime}>
          {formatDate(story.pubDate).relativeTime}
        </span>
        <a
          href={story.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#c00', fontWeight: '500' }}
        >
          Read more →
        </a>
      </div>
    </article>
  );
}

