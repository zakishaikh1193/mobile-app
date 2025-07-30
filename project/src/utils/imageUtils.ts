/**
 * Generates responsive image sources for different screen sizes
 * @param basePath - Base path to the image without extension
 * @param options - Configuration options
 */
export function getResponsiveImage(
  basePath: string,
  options: {
    formats: ('webp' | 'jpg' | 'png' | 'avif')[];
    sizes?: Array<{ width: number; suffix?: string }>;
  } = {
    formats: ['webp', 'jpg'],
    sizes: [
      { width: 640, suffix: '-sm' },
      { width: 768, suffix: '-md' },
      { width: 1024, suffix: '-lg' },
      { width: 1280, suffix: '-xl' },
      { width: 1536, suffix: '-2xl' },
    ],
  }
): {
  src: string;
  srcSet: string;
  srcSetWebp: string;
  sizes: string;
} {
  const { formats, sizes = [] } = options;
  const hasWebp = formats.includes('webp');
  const fallbackFormat = formats.find((f) => f !== 'webp') || 'jpg';

  // Generate srcSet for default format
  const srcSet = sizes
    .map(({ width, suffix }) => {
      const src = `${basePath}${suffix || `-${width}w`}.${fallbackFormat}`;
      return `${src} ${width}w`;
    })
    .join(', ');

  // Generate srcSet for webp if available
  let srcSetWebp = '';
  if (hasWebp) {
    srcSetWebp = sizes
      .map(({ width, suffix }) => {
        const src = `${basePath}${suffix || `-${width}w`}.webp`;
        return `${src} ${width}w`;
      })
      .join(', ');
  }

  // Generate sizes attribute
  const sizesAttr = sizes
    .map(({ width }, index) => {
      if (index === sizes.length - 1) {
        return `${width}px`; // Default size for the largest breakpoint
      }
      return `(max-width: ${width}px) ${width}px`;
    })
    .join(', ');

  return {
    src: `${basePath}.${fallbackFormat}`,
    srcSet,
    srcSetWebp,
    sizes: sizesAttr,
  };
}

/**
 * Creates a blurred image placeholder as a base64 string
 * @param width - Width of the image
 * @param height - Height of the image
 * @param color - Background color in hex
 * @returns Base64 encoded SVG placeholder
 */
export function createBlurredPlaceholder(
  width: number,
  height: number,
  color: string = '#e5e7eb'
): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'><rect width='${width}' height='${height}' fill='${color}'/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Preloads an image for better performance
 * @param src - Image source URL
 */
export function preloadImage(src: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  
  // Add to the document head
  document.head.appendChild(link);
  
  // Clean up after the image is loaded
  const img = new Image();
  img.onload = () => document.head.removeChild(link);
  img.src = src;
}

/**
 * Converts an image to WebP format if the browser supports it
 * @param src - Source image path
 * @returns WebP path if supported, original path otherwise
 */
export function getWebPSource(src: string): string {
  if (typeof window === 'undefined') return src;
  
  // Check if WebP is supported
  const supportsWebP = (() => {
    const elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  })();
  
  if (!supportsWebP) return src;
  
  // Replace extension with .webp
  const parts = src.split('.');
  if (parts.length > 1) {
    parts[parts.length - 1] = 'webp';
    return parts.join('.');
  }
  
  return `${src}.webp`;
}
