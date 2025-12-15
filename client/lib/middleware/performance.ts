import { NextRequest, NextResponse } from 'next/server';

// Response compression middleware
export function compressResponse(response: NextResponse): NextResponse {
  // Add compression headers
  response.headers.set('Content-Encoding', 'gzip');
  response.headers.set('Vary', 'Accept-Encoding');
  
  return response;
}

// Image optimization helper
export function optimizeImageUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
} = {}): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // Cloudinary transformation parameters
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  // Add optimization flags
  transformations.push('fl_progressive'); // Progressive JPEG
  transformations.push('fl_immutable_cache'); // Cache optimization
  
  const baseUrl = url.split('/upload/')[0];
  const path = url.split('/upload/')[1];
  
  return `${baseUrl}/upload/${transformations.join(',')}/${path}`;
}

// Lazy loading helper for images
export function createLazyImageProps(src: string, alt: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: 'blur' | 'empty';
}) {
  const optimizedSrc = optimizeImageUrl(src, {
    width: options?.width,
    height: options?.height,
    quality: options?.quality
  });

  return {
    src: optimizedSrc,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    style: {
      width: options?.width ? `${options.width}px` : 'auto',
      height: options?.height ? `${options.height}px` : 'auto',
    }
  };
}

// Performance monitoring helper
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((value) => {
      const end = performance.now();
      return value;
    });
  } else {
    const end = performance.now();
    return result;
  }
}

// Cache control headers helper
export function setCacheHeaders(response: NextResponse, options: {
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  public?: boolean;
  private?: boolean;
} = {}): NextResponse {
  const {
    maxAge = 3600, // 1 hour default
    sMaxAge,
    staleWhileRevalidate = 86400, // 1 day default
    public: isPublic = true,
    private: isPrivate = false
  } = options;

  let cacheControl = '';
  
  if (isPrivate) {
    cacheControl = 'private';
  } else if (isPublic) {
    cacheControl = 'public';
  }
  
  cacheControl += `, max-age=${maxAge}`;
  
  if (sMaxAge) {
    cacheControl += `, s-maxage=${sMaxAge}`;
  }
  
  cacheControl += `, stale-while-revalidate=${staleWhileRevalidate}`;
  
  response.headers.set('Cache-Control', cacheControl);
  
  return response;
}
