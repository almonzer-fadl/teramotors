import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache (for production, use Redis)
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const cache = new MemoryCache();

// Clean up expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Cache key generator
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

// Cache middleware for API routes
export function withCache<T>(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    ttl?: number;
    keyGenerator?: (request: NextRequest) => string;
    skipCache?: (request: NextRequest) => boolean;
  } = {}
) {
  const { ttl = 300000, keyGenerator, skipCache } = options; // 5 minutes default

  return async (request: NextRequest) => {
    // Skip cache for non-GET requests or if skipCache returns true
    if (request.method !== 'GET' || (skipCache && skipCache(request))) {
      return handler(request);
    }

    const cacheKey = keyGenerator 
      ? keyGenerator(request)
      : generateCacheKey(request.url);

    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Timestamp': new Date().toISOString()
        }
      });
    }

    // Execute handler and cache response
    const response = await handler(request);
    
    if (response.ok) {
      const responseData = await response.json();
      cache.set(cacheKey, responseData, ttl);
      
      return NextResponse.json(responseData, {
        headers: {
          'X-Cache': 'MISS',
          'X-Cache-Timestamp': new Date().toISOString()
        }
      });
    }

    return response;
  };
}

// Cache invalidation helper
export function invalidateCache(pattern: string): void {
  // Simple pattern matching for cache invalidation
  // In production, use Redis with pattern matching
  const keys = Array.from(cache['cache'].keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}

// Database query caching helper
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 300000
): Promise<T> {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const result = await queryFn();
  cache.set(key, result, ttl);
  return result;
}

// Cache statistics
export function getCacheStats() {
  const entries = Array.from(cache['cache'].entries());
  const now = Date.now();
  
  return {
    totalEntries: entries.length,
    expiredEntries: entries.filter(([_, entry]) => now - entry.timestamp > entry.ttl).length,
    memoryUsage: JSON.stringify(entries).length
  };
}

// Cache configuration for different data types
export const cacheConfig = {
  // Short-lived cache for frequently changing data
  short: { ttl: 60000 }, // 1 minute
  
  // Medium-lived cache for moderately changing data
  medium: { ttl: 300000 }, // 5 minutes
  
  // Long-lived cache for rarely changing data
  long: { ttl: 1800000 }, // 30 minutes
  
  // Very long-lived cache for static data
  static: { ttl: 3600000 }, // 1 hour
};

export { cache };
