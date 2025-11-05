'use client';

import { useState } from 'react';
import { RSSItem } from '../api/rss/route';

interface StoryCardProps {
  story: RSSItem;
  viewMode: 'grid' | 'list';
}

export default function StoryCard({ story, viewMode }: StoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const content = story.content || story.contentSnippet || '';

  if (viewMode === 'list') {
    return (
      <article className="story-card story-card-list">
        <h2>
          <button
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
              <span className="story-date">{formatDate(story.pubDate)}</span>
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
        <span className="story-date">{formatDate(story.pubDate)}</span>
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

