'use client';

import { useState, useRef, useEffect } from 'react';
import { RSSItem } from '../api/rss/route';

interface StoryCardProps {
  story: RSSItem;
  viewMode: 'grid' | 'list';
}

export default function StoryCard({ story, viewMode }: StoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management for accordion expansion
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      // Set focus to the first focusable element in the expanded content
      const firstLink = contentRef.current.querySelector('a');
      if (firstLink) {
        (firstLink as HTMLElement).focus();
      }
    }
  }, [isExpanded]);

  // Helper function to calculate anniversary-based difference (months or years)
  const calculateAnniversaryBasedDiff = (
    startDate: Date,
    endDate: Date,
    unit: 'month' | 'year'
  ): number => {
    const nowMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0);
    
    if (unit === 'month') {
      // Calculate naive months difference
      let diff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      // Construct anniversary date in current month using original day (let it roll over if needed)
      const anniversary = new Date(endDate.getFullYear(), endDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
      if (nowMidnight.getTime() < anniversary.getTime()) {
        diff -= 1;
      }
      return Math.max(diff, 0);
    }
    
    // Calculate naive years difference
    let diff = endDate.getFullYear() - startDate.getFullYear();
    // Handle edge cases where date.getDate() doesn't exist in current year (e.g., Feb 29 in non-leap year)
    const lastDayOfAnniversaryMonth = new Date(endDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const anniversaryDay = Math.min(startDate.getDate(), lastDayOfAnniversaryMonth);
    const anniversary = new Date(endDate.getFullYear(), startDate.getMonth(), anniversaryDay, 0, 0, 0, 0);
    if (nowMidnight.getTime() < anniversary.getTime()) {
      diff -= 1;
    }
    return Math.max(diff, 0);
  };

  const formatDate = (dateString: string): { relativeTime: string; absoluteTime: string } => {
    if (!dateString) {
      return { relativeTime: '', absoluteTime: '' };
    }
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Check if date is in the future - handle early to avoid misleading "0 months/years ago"
      if (date.getTime() > now.getTime()) {
        const absoluteTime = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return { relativeTime: 'in the future', absoluteTime };
      }
      
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      
      // Calculate months and years difference using anniversary-based approach
      const diffMonths = calculateAnniversaryBasedDiff(date, now, 'month');
      const diffYears = calculateAnniversaryBasedDiff(date, now, 'year');

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
  const formattedDate = formatDate(story.pubDate);

  if (viewMode === 'list') {
    return (
      <article className="story-card story-card-list">
        <h2>
          <button
            ref={toggleButtonRef}
            type="button"
            className="story-accordion-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            onKeyDown={(e) => {
              // Add keyboard support for expanding/collapsing
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }
            }}
            aria-expanded={isExpanded}
            aria-controls={`story-content-${story.link}`}
          >
            {story.title}
            <span className="accordion-icon" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
          </button>
        </h2>
        {isExpanded && (
          <div ref={contentRef}>
            {content && (
              <div 
                id={`story-content-${story.link}`}
                className="story-accordion-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
            <div className="story-accordion-meta">
              <span className="story-date" title={formattedDate.absoluteTime}>
                {formattedDate.relativeTime}
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
          </div>
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
        <span className="story-date" title={formattedDate.absoluteTime}>
          {formattedDate.relativeTime}
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

