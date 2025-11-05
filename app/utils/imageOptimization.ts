/**
 * Optimizes images in HTML content by adding lazy loading and other performance attributes
 * Since we're using dangerouslySetInnerHTML, we can't use Next.js Image component directly,
 * but we can optimize the img tags with attributes for better performance.
 */
export function optimizeImagesInHTML(html: string): string {
  if (!html) return html;

  // Add lazy loading, decoding, and other optimizations to img tags
  return html.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      // Check if loading attribute already exists
      if (attributes.includes('loading=')) {
        return match; // Already has loading attribute
      }

      // Check if src exists
      if (!attributes.includes('src=')) {
        return match; // No src, skip
      }

      // Add loading="lazy", decoding="async", and fetchpriority="auto"
      let optimizedAttributes = attributes.trim();
      
      // Add loading="lazy" if not present
      if (!optimizedAttributes.includes('loading=')) {
        optimizedAttributes += ' loading="lazy"';
      }
      
      // Add decoding="async" for better performance
      if (!optimizedAttributes.includes('decoding=')) {
        optimizedAttributes += ' decoding="async"';
      }
      
      // Ensure images have alt attribute for accessibility
      if (!optimizedAttributes.includes('alt=')) {
        optimizedAttributes += ' alt=""';
      }

      return `<img${optimizedAttributes}>`;
    }
  );
}
