import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  content?: string;
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
        
        return {
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || '',
          contentSnippet: item.contentSnippet,
          content: item.content,
        };
      })
      .filter((item): item is RSSItem => item !== null);

    // Return successful response even if some stories were filtered
    return NextResponse.json({
      success: true,
      title: feed.title,
      description: feed.description,
      items,
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch RSS feed',
      },
      { status: 500 }
    );
  }
}

