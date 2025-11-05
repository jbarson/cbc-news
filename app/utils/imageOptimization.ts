/**
 * Optimizes image tags in HTML content for better performance and compatibility
 * Adds loading="lazy", decoding="async", and ensures proper attributes
 */
export function optimizeImagesInHTML(html: string): string {
  if (!html) return html;
  
  return html.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      let optimizedAttributes = attributes.trim();
      
      // Add loading="lazy" if not present
      if (!optimizedAttributes.includes('loading=')) {
        optimizedAttributes += ' loading="lazy"';
      }
      
      // Add decoding="async" if not present
      if (!optimizedAttributes.includes('decoding=')) {
        optimizedAttributes += ' decoding="async"';
      }
      
      // Ensure alt attribute exists (empty string if not present)
      if (!optimizedAttributes.includes('alt=')) {
        optimizedAttributes += ' alt=""';
      }
      
      return `<img${optimizedAttributes}>`;
    }
  );
}
