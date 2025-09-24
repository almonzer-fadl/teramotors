/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest } from 'next/server'
import { GET as customersGET, POST as customersPOST } from '@/app/api/customers/route'
import { mockCustomer, mockApiResponses, createMockRequest } from '../fixtures'

// Mock the database connection and models
jest.mock('@/lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/models/Customer', () => {
  const mockCustomer = {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

describe('Customers API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/customers', () => {
    test('should return customers with pagination', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([mockCustomer])
              })
            })
          })
        })
      })
      
      mockCustomerInstance.countDocuments.mockResolvedValue(1)

      const request = createMockRequest('GET')
      const response = await customersGET(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBe(1)
    })

    test('should handle search query', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([mockCustomer])
              })
            })
          })
        })
      })
      
      mockCustomerInstance.countDocuments.mockResolvedValue(1)

      const request = new Request('http://localhost:3000/api/customers?search=John')
      const response = await customersGET(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })

    test('should handle pagination parameters', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([mockCustomer])
              })
            })
          })
        })
      })
      
      mockCustomerInstance.countDocuments.mockResolvedValue(1)

      const request = new Request('http://localhost:3000/api/customers?page=2&limit=5')
      const response = await customersGET(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(5)
    })

    test('should return 401 for unauthenticated requests', async () => {
      const { auth } = require('@/lib/auth')
      auth.mockResolvedValueOnce(null)

      const request = createMockRequest('GET')
      const response = await customersGET(request as NextRequest)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/customers', () => {
    test('should create a new customer', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.findOne.mockResolvedValue(null) // No existing customer
      mockCustomerInstance.save.mockResolvedValue(mockCustomer)

      const request = createMockRequest('POST', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      })

      const response = await customersPOST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.customer).toBeDefined()
    })

    test('should return 409 for duplicate email', async () => {
      const Customer = require('@/lib/models/Customer')
      const mockCustomerInstance = new Customer()
      
      mockCustomerInstance.findOne.mockResolvedValue(mockCustomer) // Existing customer

      const request = createMockRequest('POST', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      })

      const response = await customersPOST(request as NextRequest)

      expect(response.status).toBe(409)
    })

    test('should return 401 for unauthenticated requests', async () => {
      const { auth } = require('@/lib/auth')
      auth.mockResolvedValueOnce(null)

      const request = createMockRequest('POST', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      })

      const response = await customersPOST(request as NextRequest)

      expect(response.status).toBe(401)
    })

    test('should validate required fields', async () => {
      const request = createMockRequest('POST', {
        firstName: 'John'
        // Missing lastName, email, phone
      })

      const response = await customersPOST(request as NextRequest)

      expect(response.status).toBe(500) // Should handle validation error
    })
  })
})

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const User = require('@/lib/models/User')
      const mockUserInstance = new User()
      
      mockUserInstance.findOne.mockResolvedValue(null) // No existing user
      mockUserInstance.save.mockResolvedValue({
        _id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'mechanic'
      })

      const request = createMockRequest('POST', {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User'
      })

      const { POST } = await import('@/app/api/auth/register/route')
      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
    })

    test('should validate password strength', async () => {
      const request = createMockRequest('POST', {
        email: 'test@example.com',
        password: 'weak', // Weak password
        fullName: 'Test User'
      })

      const { POST } = await import('@/app/api/auth/register/route')
      const response = await POST(request as NextRequest)

      expect(response.status).toBe(400)
    })

    test('should validate email format', async () => {
      const request = createMockRequest('POST', {
        email: 'invalid-email',
        password: 'Password123!',
        fullName: 'Test User'
      })

      const { POST } = await import('@/app/api/auth/register/route')
      const response = await POST(request as NextRequest)

      expect(response.status).toBe(400)
    })
  })
})

describe('File Upload API', () => {
  describe('POST /api/upload', () => {
    test('should upload a valid image file', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })

      const { POST } = await import('@/app/api/upload/route')
      const response = await POST(request as NextRequest)

      expect(response.status).toBe(200)
    })

    test('should reject invalid file types', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })

      const { POST } = await import('@/app/api/upload/route')
      const response = await POST(request as NextRequest)

      expect(response.status).toBe(400)
    })

    test('should reject oversized files', async () => {
      // Create a large file (simulate)
      const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
      const mockFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', mockFile)

      const request = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      })

      const { POST } = await import('@/app/api/upload/route')
      const response = await POST(request as NextRequest)

      expect(response.status).toBe(400)
    })
  })
})
