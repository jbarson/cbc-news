import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import {
  StoryLink,
  DateString,
  createStoryLink,
  createDateString,
  createServerError,
  type ErrorType,
} from '@/app/types';

const parser = new Parser();

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export interface RSSItem {
  title: string;
  link: StoryLink;
  pubDate: DateString;
  contentSnippet?: string;
  content?: string;
}

export interface RSSSuccessResponse {
  success: true;
  title: string;
  description: string;
  items: RSSItem[];
}

export interface RSSErrorResponse {
  success: false;
  error: ErrorType;
}

function containsJavaScript(content: string): boolean {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  
  // Check for script tags
  if (/<script[\s>]/.test(lowerContent)) {
    return true;
  }
  
  // Check for javascript: protocol
  if (/javascript:/i.test(content)) {
    return true;
  }
  
  // Check for common event handlers
  const eventHandlers = [
    'onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown',
    'onkeypress', 'onkeyup', 'onabort', 'onbeforeunload', 'ondblclick',
    'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover',
    'ondragstart', 'ondrop', 'oninput', 'oninvalid', 'onmousedown',
    'onmousemove', 'onmouseup', 'onreset', 'onresize', 'onscroll',
    'onselect', 'onunload'
  ];
  
  if (eventHandlers.some((handler) => new RegExp(`\\b${handler}\\s*=`, 'i').test(content))) {
    return true;
  }
  
  // Check for eval, setTimeout, setInterval
  if (/\beval\s*\(/i.test(content) ||
      /\bsetTimeout\s*\(/i.test(content) ||
      /\bsetInterval\s*\(/i.test(content)) {
    return true;
  }
  
  return false;
}

export async function GET() {
  try {
    const feed = await parser.parseURL('https://www.cbc.ca/webfeed/rss/rss-topstories');

    // Filter out problematic stories instead of failing the entire request
    const items: RSSItem[] = feed.items
      .map((item): RSSItem | null => {
        const content = item.content || item.contentSnippet || '';
        
        // Check for JavaScript in content
        if (containsJavaScript(content)) {
          console.warn(`Filtered out story: "${item.title || 'Untitled'}" - contains JavaScript`);
          return null; // Filter out instead of throwing
        }
        
        // Validate and create branded types
        try {
          const link = createStoryLink(item.link || '');
          const pubDate = createDateString(item.pubDate || '');
          
          return {
            title: item.title || '',
            link,
            pubDate,
            contentSnippet: item.contentSnippet,
            content: item.content,
          };
        } catch (validationError) {
          console.warn(
            `Filtered out story: "${item.title || 'Untitled'}" - validation failed`,
            validationError
          );
          return null;
        }
      })
      .filter((item): item is RSSItem => item !== null);

    // Return successful response even if some stories were filtered
    const response: RSSSuccessResponse = {
      success: true,
      title: feed.title || '',
      description: feed.description || '',
      items,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    
    const errorResponse: RSSErrorResponse = {
      success: false,
      error: createServerError(500, 'Failed to fetch RSS feed'),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

