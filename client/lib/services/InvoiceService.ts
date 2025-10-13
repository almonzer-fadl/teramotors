import { 
  InvoiceData, 
  ZATCAInvoice, 
  InvoiceGenerationResult, 
  InvoiceItem,
  Customer,
  InvoiceTotals
} from '../../zatca/zatca-types';
import { ZATCAQRGenerator } from '../../zatca/zatca-qr-generator';
import { ZATCAUtils } from '../../zatca/zatca-utils';
import { COMPANY_CONFIG } from '../../config/company-config';

export class InvoiceService {
  private qrGenerator: ZATCAQRGenerator;
  private invoiceCounter: number = 1;

  constructor() {
    this.qrGenerator = new ZATCAQRGenerator();
  }

  /**
   * Create invoice from job card data (main integration point)
   */
  async createInvoiceFromJobCard(jobCardData: {
    jobCardId: string;
    customerId: any;
    vehicleId: any;
    services: any[];
    partsUsed: any[];
    notes?: string;
    dueDate?: Date;
    paymentMethod?: string;
  }): Promise<InvoiceGenerationResult> {
    try {
      // Convert job card data to ZATCA invoice format
      const invoiceData = this.convertJobCardToInvoiceData(jobCardData);
      
      // Generate ZATCA-compliant invoice
      const result = await this.qrGenerator.generateInvoice(invoiceData);
      
      if (result.success && result.invoice && result.qrCode) {
        // Generate QR code image
        const qrCodeImage = await this.qrGenerator.generateQRImage(result.qrCode);
        
        // Store additional metadata for database integration
        (result.invoice as any).metadata = {
          jobCardId: jobCardData.jobCardId,
          customerId: jobCardData.customerId._id,
          vehicleId: jobCardData.vehicleId._id,
          originalServices: jobCardData.services,
          originalParts: jobCardData.partsUsed,
        };
        
        // Add QR code image to the result
        result.invoice.zatca.qrCodeImage = qrCodeImage;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
      };
    }
  }

  /**
   * Convert job card data to ZATCA invoice format
   */
  private convertJobCardToInvoiceData(jobCardData: any): InvoiceData {
    const items: InvoiceItem[] = [];
    
    // Convert services to invoice items
    jobCardData.services.forEach((service: any, index: number) => {
      const totalServicePrice = (service.laborHours || 0) * (service.laborRate || 0);
      items.push({
        id: `service-${index}`,
        name: service.serviceId?.name || 'Service',
        description: `Labor hours: ${service.laborHours}`,
        quantity: service.quantity || 1,
        unitPrice: totalServicePrice,
        vatRate: ZATCAUtils.getStandardVATRate(),
        category: 'service',
      });
    });

    // Convert parts to invoice items
    jobCardData.partsUsed.forEach((part: any, index: number) => {
      items.push({
        id: `part-${index}`,
        name: part.partId?.name || 'Part',
        description: 'Auto part',
        quantity: part.quantity || 1,
        unitPrice: part.cost || 0,
        vatRate: ZATCAUtils.getStandardVATRate(),
        category: 'part',
      });
    });

    // Create customer info
    const customer: Customer = {
      name: `${jobCardData.customerId.firstName} ${jobCardData.customerId.lastName}`,
      email: jobCardData.customerId.email,
      phone: jobCardData.customerId.phone,
    };

    // Generate invoice number
    const invoiceNumber = ZATCAUtils.generateInvoiceNumber('INV', this.invoiceCounter++);

    return {
      status: 'draft', // Required by InvoiceData
      invoiceNumber,
      invoiceDate: new Date(),
      dueDate: jobCardData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currency: 'SAR',
      customer,
      items,
      paymentMethod: jobCardData.paymentMethod as any || 'cash',
      notes: jobCardData.notes,
    };
  }

  /**
   * Create a simple B2C sale (as shown in examples)
   */
  async createInvoice(invoiceData: {
    items: Array<{
      name: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      vatRate?: number;
    }>;
    customer?: Customer;
    paymentMethod?: string;
    notes?: string;
    dueDate?: Date;
    globalDiscount?: number;
  }): Promise<InvoiceGenerationResult> {
    try {
      const items: InvoiceItem[] = invoiceData.items.map((item, index) => ({
        id: `item-${index}`,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate || ZATCAUtils.getStandardVATRate(),
      }));

      const zatcaInvoiceData: InvoiceData = {
        invoiceNumber: ZATCAUtils.generateInvoiceNumber('INV', this.invoiceCounter++),
        invoiceDate: new Date(),
        dueDate: invoiceData.dueDate,
        currency: 'SAR',
        status: 'draft', // Added required 'status' property with a default value
        customer: invoiceData.customer,
        items,
        globalDiscount: invoiceData.globalDiscount,
        paymentMethod: invoiceData.paymentMethod as any || 'cash',
        notes: invoiceData.notes,
      };

      const result = await this.qrGenerator.generateInvoice(zatcaInvoiceData);
      
      if (result.success && result.invoice && result.qrCode) {
        // Generate QR code image
        const qrCodeImage = await this.qrGenerator.generateQRImage(result.qrCode);
        result.invoice.zatca.qrCodeImage = qrCodeImage;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
      };
    }
  }

  /**
   * Create quick sale for POS systems
   */
  async createQuickSale(params: {
    items: Array<{ name: string; quantity: number; price: number }>;
    customerName?: string;
    paymentMethod?: string;
    discount?: number;
  }): Promise<InvoiceGenerationResult> {
    const items: InvoiceItem[] = params.items.map((item, index) => ({
      id: `pos-${index}`,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      vatRate: ZATCAUtils.getStandardVATRate(),
    }));

    const customer: Customer = {
      name: params.customerName || 'Walk-in Customer',
    };

    return await this.createInvoice({
      items,
      customer,
      paymentMethod: params.paymentMethod || 'cash',
      globalDiscount: params.discount,
    });
  }

  /**
   * Generate QR code for existing invoice
   */
  async generateQRForInvoice(invoiceData: InvoiceData): Promise<string> {
    const result = await this.qrGenerator.generateInvoice(invoiceData);
    if (!result.success || !result.qrCode) {
      throw new Error('Failed to generate QR code');
    }
    return result.qrCode;
  }

  /**
   * Validate invoice data
   */
  validateInvoice(invoiceData: InvoiceData): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!invoiceData.invoiceNumber) {
      errors.push('Invoice number is required');
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (!invoiceData.invoiceDate) {
      errors.push('Invoice date is required');
    }

    // Validate items
    invoiceData.items.forEach((item, index) => {
      const itemErrors = ZATCAUtils.validateInvoiceItem(item);
      errors.push(...itemErrors.map(err => `Item ${index + 1}: ${err}`));
    });

    // Validate customer VAT number if provided
    if (invoiceData.customer?.vatNumber && 
        !ZATCAUtils.isValidSaudiVATNumber(invoiceData.customer.vatNumber)) {
      errors.push('Invalid customer VAT number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get invoice totals
   */
  calculateTotals(invoiceData: InvoiceData): InvoiceTotals {
    return ZATCAUtils.calculateInvoiceTotals(invoiceData);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return ZATCAUtils.formatCurrency(amount);
  }

  /**
   * Check if invoice is B2B
   */
  isB2BInvoice(invoiceData: InvoiceData): boolean {
    return ZATCAUtils.isB2BInvoice(invoiceData);
  }

  /**
   * Update invoice counter (for persistence)
   */
  setInvoiceCounter(counter: number): void {
    this.invoiceCounter = counter;
  }

  /**
   * Get current invoice counter
   */
  getInvoiceCounter(): number {
    return this.invoiceCounter;
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
