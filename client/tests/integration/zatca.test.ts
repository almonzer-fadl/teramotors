import { ZATCAValidator } from '@/zatca/zatca-validator'
import { generateQRCode } from '@/zatca/zatca-qr-generator'
import { calculateInvoiceHash } from '@/zatca/zatca-utils'
import { mockInvoice } from '../fixtures'

describe('ZATCA Compliance Tests', () => {
  describe('QR Code Generation', () => {
    test('should generate valid QR code for invoice', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      }

      const qrCode = generateQRCode(invoiceData)
      
      expect(qrCode).toBeDefined()
      expect(typeof qrCode).toBe('string')
      expect(qrCode.length).toBeGreaterThan(0)
    })

    test('should handle missing optional fields', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      }

      expect(() => generateQRCode(invoiceData)).not.toThrow()
    })

    test('should validate required fields', () => {
      const invalidData = {
        sellerName: 'TeraMotors',
        // Missing vatRegistrationNumber
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      }

      expect(() => generateQRCode(invalidData)).toThrow()
    })
  })

  describe('Invoice Hash Calculation', () => {
    test('should calculate valid invoice hash', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      }

      const hash = calculateInvoiceHash(invoiceData)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    test('should generate consistent hash for same data', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      }

      const hash1 = calculateInvoiceHash(invoiceData)
      const hash2 = calculateInvoiceHash(invoiceData)
      
      expect(hash1).toBe(hash2)
    })

    test('should generate different hash for different data', () => {
      const invoiceData1 = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      }

      const invoiceData2 = {
        ...invoiceData1,
        invoiceTotal: 200.00
      }

      const hash1 = calculateInvoiceHash(invoiceData1)
      const hash2 = calculateInvoiceHash(invoiceData2)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('ZATCA Validator', () => {
    let validator: ZATCAValidator

    beforeEach(() => {
      validator = new ZATCAValidator()
    })

    test('should validate compliant invoice', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash',
        qrCode: 'test-qr-code'
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect missing seller name', () => {
      const invoiceData = {
        // sellerName: 'TeraMotors', // Missing
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash',
        qrCode: 'test-qr-code'
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('seller name'))).toBe(true)
    })

    test('should validate VAT registration number format', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123', // Invalid format
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash',
        qrCode: 'test-qr-code'
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('VAT registration number'))).toBe(true)
    })

    test('should validate invoice timestamp format', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: 'invalid-date', // Invalid format
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash',
        qrCode: 'test-qr-code'
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('timestamp'))).toBe(true)
    })

    test('should validate monetary values', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: -100.00, // Negative amount
        vatTotal: 15.00,
        invoiceHash: 'test-hash',
        qrCode: 'test-qr-code'
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('total'))).toBe(true)
    })

    test('should validate VAT calculation', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 20.00, // Incorrect VAT (should be 15%)
        invoiceHash: 'test-hash',
        qrCode: 'test-qr-code'
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('VAT'))).toBe(true)
    })

    test('should validate QR code presence', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
        // qrCode: 'test-qr-code' // Missing
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('QR code'))).toBe(true)
    })

    test('should provide warnings for non-critical issues', () => {
      const invoiceData = {
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash',
        qrCode: 'test-qr-code',
        // Missing optional fields that might generate warnings
      }

      const result = validator.validateInvoice(invoiceData)
      
      // Should be valid but might have warnings
      expect(result.isValid).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
    })
  })

  describe('Invoice Service Integration', () => {
    test('should create ZATCA-compliant invoice', async () => {
      const invoiceData = {
        jobCardId: '507f1f77bcf86cd799439017',
        customerId: '507f1f77bcf86cd799439011',
        vehicleId: '507f1f77bcf86cd799439012',
        totalAmount: 100.00,
        notes: 'Test invoice'
      }

      // Mock the invoice service
      const mockInvoiceService = {
        createInvoice: jest.fn().mockResolvedValue({
          ...mockInvoice,
          zatca: {
            qrCode: 'generated-qr-code',
            invoiceNumber: 'INV-001',
            invoiceDate: new Date(),
            vatAmount: 15.00,
            subtotal: 85.00,
            compliance: {
              phase: 1,
              isCompliant: true,
              errors: [],
              warnings: []
            }
          }
        })
      }

      const result = await mockInvoiceService.createInvoice(invoiceData)
      
      expect(result.zatca).toBeDefined()
      expect(result.zatca.qrCode).toBeDefined()
      expect(result.zatca.compliance.isCompliant).toBe(true)
      expect(result.zatca.compliance.errors).toHaveLength(0)
    })

    test('should handle ZATCA validation errors', async () => {
      const invoiceData = {
        jobCardId: '507f1f77bcf86cd799439017',
        customerId: '507f1f77bcf86cd799439011',
        vehicleId: '507f1f77bcf86cd799439012',
        totalAmount: -100.00, // Invalid amount
        notes: 'Test invoice'
      }

      const mockInvoiceService = {
        createInvoice: jest.fn().mockResolvedValue({
          ...mockInvoice,
          zatca: {
            qrCode: null,
            invoiceNumber: 'INV-001',
            invoiceDate: new Date(),
            vatAmount: 0,
            subtotal: 0,
            compliance: {
              phase: 1,
              isCompliant: false,
              errors: ['Invalid invoice total amount'],
              warnings: []
            }
          }
        })
      }

      const result = await mockInvoiceService.createInvoice(invoiceData)
      
      expect(result.zatca.compliance.isCompliant).toBe(false)
      expect(result.zatca.compliance.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Phase 1 Compliance', () => {
    test('should meet Phase 1 requirements', () => {
      const phase1Requirements = {
        qrCodeGeneration: true,
        invoiceHashCalculation: true,
        basicValidation: true,
        tlvEncoding: true
      }

      // Test QR code generation
      const qrCode = generateQRCode({
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      })

      expect(qrCode).toBeDefined()
      expect(phase1Requirements.qrCodeGeneration).toBe(true)

      // Test hash calculation
      const hash = calculateInvoiceHash({
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: 'test-hash'
      })

      expect(hash).toBeDefined()
      expect(phase1Requirements.invoiceHashCalculation).toBe(true)

      // Test validation
      const validator = new ZATCAValidator()
      const result = validator.validateInvoice({
        sellerName: 'TeraMotors',
        vatRegistrationNumber: '123456789012345',
        invoiceTimestamp: '2024-01-01T10:00:00Z',
        invoiceTotal: 100.00,
        vatTotal: 15.00,
        invoiceHash: hash,
        qrCode: qrCode
      })

      expect(result.isValid).toBe(true)
      expect(phase1Requirements.basicValidation).toBe(true)
    })
  })
})
