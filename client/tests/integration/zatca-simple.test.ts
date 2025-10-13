import { ZATCAValidator } from '@/zatca/zatca-validator'
import { ZATCAQRGenerator } from '@/zatca/zatca-qr-generator'
import { ZATCAUtils } from '@/zatca/zatca-utils'

describe('ZATCA Simple Tests', () => {
  test('should create ZATCAQRGenerator instance', () => {
    const generator = new ZATCAQRGenerator('TeraMotors', '7051569718')
    expect(generator).toBeDefined()
  })

  test('should create ZATCAValidator instance', () => {
    const validator = new ZATCAValidator()
    expect(validator).toBeDefined()
  })

  test('should calculate invoice totals', () => {
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
    expect(totals.totalAmount).toBe(115.00)
    expect(totals.totalVAT).toBe(15.00)
    expect(totals.subtotal).toBe(100.00)
  })

  test('should validate invoice data', () => {
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

    const validator = new ZATCAValidator()
    const result = validator.validateInvoice(invoiceData)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('should generate QR code for invoice', async () => {
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

    const generator = new ZATCAQRGenerator('TeraMotors', '7051569718')
    const result = await generator.generateInvoice(invoiceData)
    
    expect(result.success).toBe(true)
    expect(result.qrCode).toBeDefined()
    expect(typeof result.qrCode).toBe('string')
    expect(result.qrCode.length).toBeGreaterThan(0)
  })
})
