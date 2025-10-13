import { InvoiceData, InvoiceItem, InvoiceTotals, SAUDI_VAT_RATES } from './zatca-types';

export class ZATCAUtils {
  /**
   * Calculate totals for an invoice
   */
  static calculateInvoiceTotals(invoiceData: InvoiceData): InvoiceTotals {
    let subtotal = 0;
    let totalVAT = 0;
    let totalDiscount = 0;

    // Calculate item totals
    invoiceData.items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const itemTotal = itemSubtotal - itemDiscount;
      const itemVAT = this.calculateVAT(itemTotal, item.vatRate);

      subtotal += itemTotal;
      totalVAT += itemVAT;
      totalDiscount += itemDiscount;
    });

    // Apply global adjustments
    const globalDiscount = invoiceData.globalDiscount || 0;
    const shippingCost = invoiceData.shippingCost || 0;
    const additionalFees = invoiceData.additionalFees || 0;

    totalDiscount += globalDiscount;
    const totalAdditionalFees = shippingCost + additionalFees;
    
    // Calculate final amounts
    const taxableAmount = subtotal - globalDiscount + totalAdditionalFees;
    const totalAmount = taxableAmount + totalVAT;

    return {
      subtotal,
      totalDiscount,
      totalAdditionalFees,
      taxableAmount,
      totalVAT,
      totalAmount,
    };
  }

  /**
   * Calculate VAT amount for a given base amount and rate
   */
  static calculateVAT(baseAmount: number, vatRate: number): number {
    return (baseAmount * vatRate) / 100;
  }

  /**
   * Calculate base amount from VAT-inclusive amount
   */
  static calculateBaseFromInclusive(inclusiveAmount: number, vatRate: number): number {
    return inclusiveAmount / (1 + vatRate / 100);
  }

  /**
   * Format date for ZATCA compliance (ISO 8601)
   */
  static formatDateForZATCA(date: Date): string {
    return date.toISOString();
  }

  /**
   * Format date for display
   */
  static formatDateDisplay(date: Date, locale: string = 'en-SA'): string {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = 'SAR'): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Generate unique invoice number
   */
  static generateInvoiceNumber(prefix: string = 'INV', counter: number): string {
    const year = new Date().getFullYear();
    const formattedCounter = counter.toString().padStart(6, '0');
    return `${prefix}-${year}-${formattedCounter}`;
  }

  /**
   * Generate UUID for invoice ID
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate Saudi VAT number (Unified National Number)
   */
  static isValidSaudiVATNumber(vatNumber: string): boolean {
    const vatRegex = /^\d{10}$/;
    return vatRegex.test(vatNumber);
  }

  /**
   * Validate Saudi postal code
   */
  static isValidSaudiPostalCode(postalCode: string): boolean {
    const postalRegex = /^\d{5}$/;
    return postalRegex.test(postalCode);
  }

  /**
   * Clean and validate phone number
   */
  static formatSaudiPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check for Saudi mobile numbers
    if (cleaned.length === 10 && cleaned.startsWith('05')) {
      return `+966${cleaned.substring(1)}`;
    }
    
    // Check for international format
    if (cleaned.length === 12 && cleaned.startsWith('966')) {
      return `+${cleaned}`;
    }
    
    return null;
  }

  /**
   * Round amount to 2 decimal places (for currency)
   */
  static roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Convert percentage to decimal
   */
  static percentageToDecimal(percentage: number): number {
    return percentage / 100;
  }

  /**
   * Check if invoice is B2B (has customer VAT number) or B2C
   */
  static isB2BInvoice(invoiceData: InvoiceData): boolean {
    return !!(invoiceData.customer?.vatNumber && 
             this.isValidSaudiVATNumber(invoiceData.customer.vatNumber));
  }

  /**
   * Calculate days between two dates
   */
  static daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if invoice is overdue
   */
  static isInvoiceOverdue(invoiceData: InvoiceData): boolean {
    if (!invoiceData.dueDate) return false;
    return new Date() > invoiceData.dueDate;
  }

  /**
   * Get standard VAT rate
   */
  static getStandardVATRate(): number {
    return SAUDI_VAT_RATES.STANDARD;
  }

  /**
   * Validate invoice item
   */
  static validateInvoiceItem(item: InvoiceItem): string[] {
    const errors: string[] = [];

    if (!item.name.trim()) {
      errors.push(`Item ${item.id}: Name is required`);
    }

    if (item.quantity <= 0) {
      errors.push(`Item ${item.id}: Quantity must be greater than 0`);
    }

    if (item.unitPrice < 0) {
      errors.push(`Item ${item.id}: Unit price cannot be negative`);
    }

    if (item.vatRate < 0 || item.vatRate > 100) {
      errors.push(`Item ${item.id}: VAT rate must be between 0 and 100`);
    }

    if (item.discount && item.discount < 0) {
      errors.push(`Item ${item.id}: Discount cannot be negative`);
    }

    return errors;
  }

  /**
   * Create TLV field for QR code
   */
  static createTLVField(tag: number, value: string): Buffer {
    const valueBuffer = Buffer.from(value, 'utf8');
    const tagBuffer = Buffer.from([tag]);
    const lengthBuffer = Buffer.from([valueBuffer.length]);
    
    return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
  }

  /**
   * Parse QR code back to data (for testing/debugging)
   */
  static parseQRCode(base64QR: string): Record<number, string> {
    try {
      const buffer = Buffer.from(base64QR, 'base64');
      const result: Record<number, string> = {};
      let offset = 0;

      while (offset < buffer.length) {
        const tag = buffer[offset];
        const length = buffer[offset + 1];
        const value = buffer.slice(offset + 2, offset + 2 + length).toString('utf8');
        
        result[tag] = value;
        offset += 2 + length;
      }

      return result;
    } catch (error) {
      throw new Error('Invalid QR code format');
    }
  }

  /**
   * Calculate invoice statistics
   */
  static calculateInvoiceStats(invoices: InvoiceData[]): {
    totalInvoices: number;
    totalAmount: number;
    totalVAT: number;
    averageAmount: number;
    b2bCount: number;
    b2cCount: number;
  } {
    const stats = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      totalVAT: 0,
      averageAmount: 0,
      b2bCount: 0,
      b2cCount: 0,
    };

    invoices.forEach(invoice => {
      const totals = this.calculateInvoiceTotals(invoice);
      stats.totalAmount += totals.totalAmount;
      stats.totalVAT += totals.totalVAT;
      
      if (this.isB2BInvoice(invoice)) {
        stats.b2bCount++;
      } else {
        stats.b2cCount++;
      }
    });

    stats.averageAmount = stats.totalInvoices > 0 ? 
                         stats.totalAmount / stats.totalInvoices : 0;

    return stats;
  }
}