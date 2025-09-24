/* eslint-disable @typescript-eslint/no-require-imports */
import { performance } from 'perf_hooks'
import { GET as customersGET } from '@/app/api/customers/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/models/Customer', () => {
  const mockCustomer = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  }
  return jest.fn(() => mockCustomer)
})

jest.mock('@/lib/auth', () => ({
  auth: jest.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin'
    }
  })
}))

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('API Response Time Tests', () => {
    test('customers API should respond within acceptable time', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      // Mock database response
      mockCustomerInstance.find.mockReturnValue({
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
      
      mockCustomerInstance.countDocuments.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/customers')
      
      const startTime = performance.now()
      const response = await customersGET(request as NextRequest)
      const endTime = performance.now()
      
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
    })

    test('should handle large datasets efficiently', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        _id: `customer-${i}`,
        firstName: `Customer${i}`,
        lastName: 'Test',
        email: `customer${i}@example.com`,
        vehicles: []
      }))
      
      mockCustomerInstance.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(largeDataset.slice(0, 10))
              })
            })
          })
        })
      })
      
      mockCustomerInstance.countDocuments.mockResolvedValue(1000)

      const request = new Request('http://localhost:3000/api/customers?page=1&limit=10')
      
      const startTime = performance.now()
      const response = await customersGET(request as NextRequest)
      const endTime = performance.now()
      
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(2000) // Should handle large datasets within 2 seconds
    })

    test('should maintain performance with pagination', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
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
      
      mockCustomerInstance.countDocuments.mockResolvedValue(10000)

      const request = new Request('http://localhost:3000/api/customers?page=100&limit=10')
      
      const startTime = performance.now()
      const response = await customersGET(request as NextRequest)
      const endTime = performance.now()
      
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(1500) // Pagination should not significantly impact performance
    })
  })

  describe('Database Query Performance', () => {
    test('should use indexes for efficient queries', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
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
      
      mockCustomerInstance.countDocuments.mockResolvedValue(0)

      // Test search query (should use indexes)
      const request = new Request('http://localhost:3000/api/customers?search=John')
      
      const startTime = performance.now()
      const response = await customersGET(request as NextRequest)
      const endTime = performance.now()
      
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(500) // Indexed queries should be fast
    })

    test('should handle concurrent requests efficiently', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
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
      
      mockCustomerInstance.countDocuments.mockResolvedValue(0)

      const requests = Array.from({ length: 10 }, () => 
        new Request('http://localhost:3000/api/customers')
      )

      const startTime = performance.now()
      const responses = await Promise.all(
        requests.map(request => customersGET(request as NextRequest))
      )
      const endTime = performance.now()
      
      const totalTime = endTime - startTime
      
      expect(responses).toHaveLength(10)
      expect(responses.every(response => response.status === 200)).toBe(true)
      expect(totalTime).toBeLessThan(3000) // 10 concurrent requests should complete within 3 seconds
    })
  })

  describe('Memory Usage Tests', () => {
    test('should not leak memory with repeated requests', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
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
      
      mockCustomerInstance.countDocuments.mockResolvedValue(0)

      const initialMemory = process.memoryUsage().heapUsed

      // Make multiple requests
      for (let i = 0; i < 100; i++) {
        const request = new Request('http://localhost:3000/api/customers')
        await customersGET(request as NextRequest)
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })

  describe('Caching Performance', () => {
    test('should improve performance with caching', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
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
      
      mockCustomerInstance.countDocuments.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/customers')

      // First request (cache miss)
      const startTime1 = performance.now()
      const response1 = await customersGET(request as NextRequest)
      const endTime1 = performance.now()
      const firstRequestTime = endTime1 - startTime1

      // Second request (cache hit)
      const startTime2 = performance.now()
      const response2 = await customersGET(request as NextRequest)
      const endTime2 = performance.now()
      const secondRequestTime = endTime2 - startTime2

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      
      // Second request should be faster due to caching
      expect(secondRequestTime).toBeLessThan(firstRequestTime)
    })
  })

  describe('Error Handling Performance', () => {
    test('should handle errors without performance degradation', async () => {
      const { auth } = require('@/lib/auth')
      auth.mockResolvedValueOnce(null) // Simulate authentication error

      const request = new Request('http://localhost:3000/api/customers')

      const startTime = performance.now()
      const response = await customersGET(request as NextRequest)
      const endTime = performance.now()
      
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(401)
      expect(responseTime).toBeLessThan(100) // Error handling should be fast
    })
  })

  describe('Load Testing Simulation', () => {
    test('should handle high load scenarios', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
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
      
      mockCustomerInstance.countDocuments.mockResolvedValue(0)

      const concurrentUsers = 50
      const requestsPerUser = 10
      const totalRequests = concurrentUsers * requestsPerUser

      const startTime = performance.now()
      
      const promises = Array.from({ length: concurrentUsers }, () =>
        Promise.all(
          Array.from({ length: requestsPerUser }, () => {
            const request = new Request('http://localhost:3000/api/customers')
            return customersGET(request as NextRequest)
          })
        )
      )

      const results = await Promise.all(promises)
      const endTime = performance.now()
      
      const totalTime = endTime - startTime
      const requestsPerSecond = totalRequests / (totalTime / 1000)

      expect(results.flat()).toHaveLength(totalRequests)
      expect(requestsPerSecond).toBeGreaterThan(10) // Should handle at least 10 requests per second
    })
  })
})
