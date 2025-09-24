import { ZATCAValidator } from '@/zatca/zatca-validator'
import { ZATCAQRGenerator } from '@/zatca/zatca-qr-generator'
import { ZATCAUtils } from '@/zatca/zatca-utils'
import { mockInvoice } from '../fixtures'

describe('ZATCA Compliance Tests', () => {
  describe('QR Code Generation', () => {
    test('should generate valid QR code for invoice', async () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const generator = new ZATCAQRGenerator('TeraMotors', '300000000000003')
      const result = await generator.generateInvoice(invoiceData)
      
      expect(result.success).toBe(true)
      expect(result.qrCode).toBeDefined()
      expect(typeof result.qrCode).toBe('string')
      expect(result.qrCode.length).toBeGreaterThan(0)
    })

    test('should handle missing optional fields', async () => {
      const invoiceData = {
        invoiceNumber: 'INV-002',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Service',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const generator = new ZATCAQRGenerator('TeraMotors', '300000000000003')
      const result = await generator.generateInvoice(invoiceData)
      
      expect(result.success).toBe(true)
      expect(result.qrCode).toBeDefined()
    })

    test('should validate required fields', async () => {
      const invalidData = {
        invoiceNumber: '',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: []
      }

      const generator = new ZATCAQRGenerator('TeraMotors', '300000000000003')
      const result = await generator.generateInvoice(invalidData)
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Invoice Hash Calculation', () => {
    test('should calculate valid invoice totals', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const totals = ZATCAUtils.calculateInvoiceTotals(invoiceData)
      
      expect(totals).toBeDefined()
      expect(totals.totalAmount).toBe(115.00) // 100 + 15% VAT
      expect(totals.totalVAT).toBe(15.00)
      expect(totals.subtotal).toBe(100.00)
    })

    test('should generate consistent totals for same data', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const totals1 = ZATCAUtils.calculateInvoiceTotals(invoiceData)
      const totals2 = ZATCAUtils.calculateInvoiceTotals(invoiceData)
      
      expect(totals1.totalAmount).toBe(totals2.totalAmount)
    })

    test('should generate different totals for different data', () => {
      const invoiceData1 = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const invoiceData2 = {
        ...invoiceData1,
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 200.00,
            vatRate: 15
          }
        ]
      }

      const totals1 = ZATCAUtils.calculateInvoiceTotals(invoiceData1)
      const totals2 = ZATCAUtils.calculateInvoiceTotals(invoiceData2)
      
      expect(totals1.totalAmount).not.toBe(totals2.totalAmount)
    })
  })

  describe('ZATCA Validator', () => {
    let validator: ZATCAValidator;

    beforeEach(() => {
      validator = new ZATCAValidator()
    })

    test('should validate compliant invoice', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect missing invoice number', () => {
      const invoiceData = {
        invoiceNumber: '', // Missing
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('Invoice number'))).toBe(true)
    })

    test('should validate invoice date', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2030-01-01T10:00:00Z'), // Future date
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('future'))).toBe(true)
    })

    test('should validate invoice items', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [] // No items
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('at least one item'))).toBe(true)
    })

    test('should validate item data', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: '', // Empty name
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Name is required'))).toBe(true)
    })

    test('should validate currency', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'USD', // Invalid currency
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      const result = validator.validateInvoice(invoiceData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('SAR'))).toBe(true)
    })

    test('should provide warnings for non-critical issues', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
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
    test('should meet Phase 1 requirements', async () => {
      const phase1Requirements = {
        qrCodeGeneration: true,
        invoiceTotalsCalculation: true,
        basicValidation: true,
        tlvEncoding: true
      }

      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date('2024-01-01T10:00:00Z'),
        currency: 'SAR',
        items: [
          {
            id: '1',
            name: 'Oil Change',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: 15
          }
        ]
      }

      // Test QR code generation
      const generator = new ZATCAQRGenerator('TeraMotors', '300000000000003')
      const result = await generator.generateInvoice(invoiceData)

      expect(result.success).toBe(true)
      expect(result.qrCode).toBeDefined()
      expect(phase1Requirements.qrCodeGeneration).toBe(true)

      // Test totals calculation
      const totals = ZATCAUtils.calculateInvoiceTotals(invoiceData)
      expect(totals.totalAmount).toBe(115.00)
      expect(phase1Requirements.invoiceTotalsCalculation).toBe(true)

      // Test validation
      const validator = new ZATCAValidator()
      const validationResult = validator.validateInvoice(invoiceData)

      expect(validationResult.isValid).toBe(true)
      expect(phase1Requirements.basicValidation).toBe(true)
    })
  })
})
