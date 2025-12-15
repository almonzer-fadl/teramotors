import { createClient } from 'redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

class CacheService {
  private client: any;
  private isConnected: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // Only initialize Redis if URL is provided
      if (!process.env.REDIS_URL) {
        this.isConnected = false;
        return;
      }

      this.client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 10000,
        },
      });

      this.client.on('error', (err: any) => {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
        }
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        if (process.env.NODE_ENV === 'development') {
        }
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        if (process.env.NODE_ENV === 'development') {
        }
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
      }
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      }
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || 3600; // Default 1 hour

      await this.client.setEx(key, ttl, serializedValue);

      // Store tags for invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await this.client.sAdd(`tag:${tag}`, key);
          await this.client.expire(`tag:${tag}`, ttl);
        }
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      }
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      }
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.sMembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.client.del(...keys);
        await this.client.del(`tag:${tag}`);
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      }
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      }
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      }
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      }
      return false;
    }
  }

  // Cache wrapper functions
  async withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Cache the result
    await this.set(key, data, options);
    
    return data;
  }

  // Specific cache keys for different data types
  static getCustomerKey(id: string): string {
    return `customer:${id}`;
  }

  static getVehicleKey(id: string): string {
    return `vehicle:${id}`;
  }

  static getAppointmentKey(id: string): string {
    return `appointment:${id}`;
  }

  static getJobCardKey(id: string): string {
    return `jobcard:${id}`;
  }

  static getInvoiceKey(id: string): string {
    return `invoice:${id}`;
  }

  static getEstimateKey(id: string): string {
    return `estimate:${id}`;
  }

  static getPartKey(id: string): string {
    return `part:${id}`;
  }

  static getDashboardStatsKey(): string {
    return 'dashboard:stats';
  }

  static getInventoryAlertsKey(): string {
    return 'inventory:alerts';
  }

  static getRecentJobsKey(): string {
    return 'jobs:recent';
  }

  // Cache invalidation helpers
  static async invalidateCustomerCache(customerId: string): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getCustomerKey(customerId));
    await cache.invalidateByTag('customers');
  }

  static async invalidateVehicleCache(vehicleId: string): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getVehicleKey(vehicleId));
    await cache.invalidateByTag('vehicles');
  }

  static async invalidateAppointmentCache(appointmentId: string): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getAppointmentKey(appointmentId));
    await cache.invalidateByTag('appointments');
  }

  static async invalidateJobCardCache(jobCardId: string): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getJobCardKey(jobCardId));
    await cache.invalidateByTag('jobcards');
  }

  static async invalidateInvoiceCache(invoiceId: string): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getInvoiceKey(invoiceId));
    await cache.invalidateByTag('invoices');
  }

  static async invalidateEstimateCache(estimateId: string): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getEstimateKey(estimateId));
    await cache.invalidateByTag('estimates');
  }

  static async invalidatePartCache(partId: string): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getPartKey(partId));
    await cache.invalidateByTag('parts');
  }

  static async invalidateDashboardCache(): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getDashboardStatsKey());
    await cache.invalidateByTag('dashboard');
  }

  static async invalidateInventoryCache(): Promise<void> {
    const cache = new CacheService();
    await cache.del(CacheService.getInventoryAlertsKey());
    await cache.invalidateByTag('inventory');
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Cache middleware for API routes
export function withCache<T>(
  keyGenerator: (req: any) => string,
  options: CacheOptions = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0];
      const cacheKey = keyGenerator(req);
      
      return await cacheService.withCache(
        cacheKey,
        () => method.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}

export default cacheService;
