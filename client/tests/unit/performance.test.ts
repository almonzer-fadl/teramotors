import { 
  DatabaseOptimizer, 
  QueryOptimizer, 
  PerformanceMonitor,
  MemoryOptimizer 
} from '@/lib/performance';

// Mock database connection
jest.mock('@/lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(undefined)
}));

// Mock models
jest.mock('@/lib/models/Customer', () => ({
  collection: {
    createIndex: jest.fn().mockResolvedValue(undefined)
  },
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      })
    })
  }),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

jest.mock('@/lib/models/Vehicle', () => ({
  collection: {
    createIndex: jest.fn().mockResolvedValue(undefined)
  },
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        })
      })
    })
  }),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

jest.mock('@/lib/models/Appointment', () => ({
  collection: {
    createIndex: jest.fn().mockResolvedValue(undefined)
  },
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([])
              })
            })
          })
        })
      })
    })
  }),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

jest.mock('@/lib/models/JobCard', () => ({
  collection: {
    createIndex: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('@/lib/models/Invoice', () => ({
  collection: {
    createIndex: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('@/lib/models/Estimate', () => ({
  collection: {
    createIndex: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('@/lib/models/Part', () => ({
  collection: {
    createIndex: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock cache service
jest.mock('@/lib/cache', () => ({
  cacheService: {
    withCache: jest.fn().mockImplementation(async (key, fetchFn) => {
      return await fetchFn();
    })
  }
}));

describe('Performance Tests', () => {
  describe('DatabaseOptimizer', () => {
    test('should create customer indexes', async () => {
      await expect(DatabaseOptimizer.optimizeCustomerQueries()).resolves.not.toThrow();
    });

    test('should create vehicle indexes', async () => {
      await expect(DatabaseOptimizer.optimizeVehicleQueries()).resolves.not.toThrow();
    });

    test('should create appointment indexes', async () => {
      await expect(DatabaseOptimizer.optimizeAppointmentQueries()).resolves.not.toThrow();
    });

    test('should create job card indexes', async () => {
      await expect(DatabaseOptimizer.optimizeJobCardQueries()).resolves.not.toThrow();
    });

    test('should create invoice indexes', async () => {
      await expect(DatabaseOptimizer.optimizeInvoiceQueries()).resolves.not.toThrow();
    });

    test('should create estimate indexes', async () => {
      await expect(DatabaseOptimizer.optimizeEstimateQueries()).resolves.not.toThrow();
    });

    test('should create part indexes', async () => {
      await expect(DatabaseOptimizer.optimizePartQueries()).resolves.not.toThrow();
    });

    test('should create all indexes', async () => {
      await expect(DatabaseOptimizer.createAllIndexes()).resolves.not.toThrow();
    });
  });

  describe('QueryOptimizer', () => {
    test('should get customers with pagination', async () => {
      const result = await QueryOptimizer.getCustomersWithPagination(1, 20);
      
      expect(result).toHaveProperty('customers');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    test('should get customers with search', async () => {
      const result = await QueryOptimizer.getCustomersWithPagination(1, 20, 'john');
      
      expect(result).toHaveProperty('customers');
      expect(result).toHaveProperty('total');
    });

    test('should get customers with filters', async () => {
      const filters = { isActive: true };
      const result = await QueryOptimizer.getCustomersWithPagination(1, 20, undefined, filters);
      
      expect(result).toHaveProperty('customers');
      expect(result).toHaveProperty('total');
    });

    test('should get vehicles with pagination', async () => {
      const result = await QueryOptimizer.getVehiclesWithPagination(1, 20);
      
      expect(result).toHaveProperty('vehicles');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
    });

    test('should get appointments with pagination', async () => {
      const result = await QueryOptimizer.getAppointmentsWithPagination(1, 20);
      
      expect(result).toHaveProperty('appointments');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
    });

    test('should get dashboard stats', async () => {
      const result = await QueryOptimizer.getDashboardStats();
      
      expect(result).toHaveProperty('totalCustomers');
      expect(result).toHaveProperty('totalVehicles');
      expect(result).toHaveProperty('totalAppointments');
      expect(result).toHaveProperty('totalJobCards');
      expect(result).toHaveProperty('totalInvoices');
      expect(result).toHaveProperty('totalEstimates');
      expect(result).toHaveProperty('totalParts');
      expect(result).toHaveProperty('recentAppointments');
      expect(result).toHaveProperty('recentJobCards');
      expect(result).toHaveProperty('lowStockParts');
    });
  });

  describe('PerformanceMonitor', () => {
    beforeEach(() => {
      PerformanceMonitor.clearMetrics();
    });

    test('should measure execution time', () => {
      const endTimer = PerformanceMonitor.startTimer('test-operation');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait for 10ms
      }
      
      endTimer();
      
      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics).toHaveProperty('test-operation');
      expect(metrics['test-operation'].count).toBe(1);
      expect(metrics['test-operation'].average).toBeGreaterThan(0);
    });

    test('should track multiple measurements', () => {
      // Make multiple measurements
      for (let i = 0; i < 5; i++) {
        const endTimer = PerformanceMonitor.startTimer('test-operation');
        const start = Date.now();
        while (Date.now() - start < 5) {
          // Busy wait for 5ms
        }
        endTimer();
      }
      
      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics['test-operation'].count).toBe(5);
      expect(metrics['test-operation'].average).toBeGreaterThan(0);
    });

    test('should calculate average time correctly', () => {
      // Make measurements with known durations
      const durations = [10, 20, 30, 40, 50];
      
      durations.forEach(duration => {
        const endTimer = PerformanceMonitor.startTimer('test-operation');
        const start = Date.now();
        while (Date.now() - start < duration) {
          // Busy wait for specified duration
        }
        endTimer();
      });
      
      const average = PerformanceMonitor.getAverageTime('test-operation');
      const expectedAverage = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      
      expect(average).toBeCloseTo(expectedAverage, 1);
    });

    test('should clear metrics', () => {
      const endTimer = PerformanceMonitor.startTimer('test-operation');
      endTimer();
      
      expect(PerformanceMonitor.getMetrics()).toHaveProperty('test-operation');
      
      PerformanceMonitor.clearMetrics();
      
      expect(PerformanceMonitor.getMetrics()).toEqual({});
    });
  });

  describe('MemoryOptimizer', () => {
    test('should optimize images', () => {
      const images = [
        'https://res.cloudinary.com/test/image/upload/v1234567890/sample.jpg',
        'https://example.com/image.png',
        'https://res.cloudinary.com/test/image/upload/v1234567890/another.jpg'
      ];
      
      const optimized = MemoryOptimizer.optimizeImages(images);
      
      expect(optimized).toHaveLength(3);
      expect(optimized[0]).toContain('q_auto,f_auto,w_800');
      expect(optimized[1]).toBe(images[1]); // Non-Cloudinary URLs should remain unchanged
      expect(optimized[2]).toContain('q_auto,f_auto,w_800');
    });

    test('should compress data by removing empty values', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '',
        address: null,
        age: 30,
        notes: undefined,
        tags: ['tag1', '', 'tag2'],
        nested: {
          value: 'test',
          empty: '',
          nullValue: null
        }
      };
      
      const compressed = MemoryOptimizer.compressData(data);
      
      expect(compressed).toHaveProperty('name', 'John Doe');
      expect(compressed).toHaveProperty('email', 'john@example.com');
      expect(compressed).toHaveProperty('age', 30);
      expect(compressed).not.toHaveProperty('phone');
      expect(compressed).not.toHaveProperty('address');
      expect(compressed).not.toHaveProperty('notes');
      expect(compressed.tags).toEqual(['tag1', 'tag2']);
      expect(compressed.nested).toHaveProperty('value', 'test');
      expect(compressed.nested).not.toHaveProperty('empty');
      expect(compressed.nested).not.toHaveProperty('nullValue');
    });

    test('should handle arrays correctly', () => {
      const data = [
        { name: 'John', email: 'john@example.com', phone: '' },
        { name: 'Jane', email: 'jane@example.com', phone: '123-456-7890' }
      ];
      
      const compressed = MemoryOptimizer.compressData(data);
      
      expect(compressed).toHaveLength(2);
      expect(compressed[0]).toHaveProperty('name', 'John');
      expect(compressed[0]).toHaveProperty('email', 'john@example.com');
      expect(compressed[0]).not.toHaveProperty('phone');
      expect(compressed[1]).toHaveProperty('phone', '123-456-7890');
    });

    test('should handle primitive values', () => {
      expect(MemoryOptimizer.compressData('test')).toBe('test');
      expect(MemoryOptimizer.compressData(123)).toBe(123);
      expect(MemoryOptimizer.compressData(true)).toBe(true);
      expect(MemoryOptimizer.compressData(null)).toBe(null);
      expect(MemoryOptimizer.compressData(undefined)).toBe(undefined);
    });
  });
});
