import { 
    InvoiceData, 
    InvoiceItem, 
    Customer, 
    ZATCAInvoice,
    InvoiceGenerationResult,
    SAUDI_VAT_RATES 
  } from '../../../zatca/zatca-types';
  import { ZATCAQRGenerator } from '../../../zatca/zatca-qr-generator';
  import { ZATCAUtils } from '../../../zatca/zatca-utils';
  import { COMPANY_CONFIG } from '../../../config/company-config';
  
  export class InvoiceService {
    private qrGenerator: ZATCAQRGenerator;
    private invoiceCounter: number = 1;
  
    constructor() {
      this.qrGenerator = new ZATCAQRGenerator(
        COMPANY_CONFIG.name,
        COMPANY_CONFIG.vatNumber
      );
      
      // Load counter from storage/database if available
      this.loadInvoiceCounter();
    }
  
    /**
     * Create a new invoice with ZATCA compliance
     */
    async createInvoice(params: {
      items: Array<{
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        vatRate?: number;
        discount?: number;
      }>;
      customer?: {
        name?: string;
        email?: string;
        phone?: string;
        vatNumber?: string;
        address?: {
          street: string;
          city: string;
          postalCode: string;
        };
      };
      paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'other';
      notes?: string;
      dueDate?: Date;
      globalDiscount?: number;
      shippingCost?: number;
    }): Promise<InvoiceGenerationResult> {
  
      try {
        // Generate unique invoice number
        const invoiceNumber = this.generateInvoiceNumber();
        
        // Convert items to invoice format
        const invoiceItems: InvoiceItem[] = params.items.map((item, index) => ({
          id: `item_${index + 1}`,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate || SAUDI_VAT_RATES.STANDARD,
          discount: item.discount || 0,
        }));
  
        // Convert customer data if provided
        const customer: Customer | undefined = params.customer ? {
          name: params.customer.name,
          email: params.customer.email,
          phone: params.customer.phone,
          vatNumber: params.customer.vatNumber,
          address: params.customer.address ? {
            street: params.customer.address.street,
            city: params.customer.address.city,
            postalCode: params.customer.address.postalCode,
            country: 'SA',
          } : undefined,
        } : undefined;
  
        // Create invoice data
        const invoiceData: InvoiceData = {
          invoiceNumber,
          invoiceDate: new Date(),
          dueDate: params.dueDate,
          currency: 'SAR',
          customer,
          items: invoiceItems,
          globalDiscount: params.globalDiscount,
          shippingCost: params.shippingCost,
          paymentMethod: params.paymentMethod || 'cash',
          paymentStatus: 'pending',
          notes: params.notes,
        };
  
        // Generate ZATCA compliant invoice
        const result = await this.qrGenerator.generateInvoice(invoiceData);
  
        if (result.success) {
          // Increment counter for next invoice
          this.incrementInvoiceCounter();
          
          // Save invoice (implement your storage logic here)
          await this.saveInvoice(result.invoice!);
        }
  
        return result;
  
      } catch (error) {
        return {
          success: false,
          errors: [error instanceof Error ? error.message : 'Failed to create invoice'],
          warnings: [],
        };
      }
    }
  
    /**
     * Create a quick cash sale (for POS systems)
     */
    async createQuickSale(params: {
      items: Array<{
        name: string;
        quantity: number;
        price: number;
      }>;
      customerName?: string;
      paymentMethod?: 'cash' | 'card';
      discount?: number;
    }): Promise<InvoiceGenerationResult> {
  
      const invoiceItems = params.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        vatRate: SAUDI_VAT_RATES.STANDARD,
      }));
  
      return await this.createInvoice({
        items: invoiceItems,
        customer: params.customerName ? { name: params.customerName } : undefined,
        paymentMethod: params.paymentMethod || 'cash',
        globalDiscount: params.discount,
      });
    }
  
    /**
     * Create return/refund invoice
     */
    async createReturnInvoice(params: {
      originalInvoiceNumber: string;
      returnItems: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        vatRate?: number;
      }>;
      reason?: string;
    }): Promise<InvoiceGenerationResult> {
  
      const invoiceItems: InvoiceItem[] = params.returnItems.map((item, index) => ({
        id: `return_${index + 1}`,
        name: `RETURN: ${item.name}`,
        description: `Return for invoice ${params.originalInvoiceNumber}`,
        quantity: -Math.abs(item.quantity), // Negative quantity for returns
        unitPrice: item.unitPrice,
        vatRate: item.vatRate || SAUDI_VAT_RATES.STANDARD,
      }));
  
      const invoiceData: InvoiceData = {
        invoiceNumber: this.generateReturnInvoiceNumber(params.originalInvoiceNumber),
        invoiceDate: new Date(),
        currency: 'SAR',
        items: invoiceItems,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        notes: `Return/Refund for invoice ${params.originalInvoiceNumber}. Reason: ${params.reason || 'Not specified'}`,
      };
  
      const result = await this.qrGenerator.generateInvoice(invoiceData);
  
      if (result.success) {
        await this.saveInvoice(result.invoice!);
      }
  
      return result;
    }
  
    /**
     * Get invoice by number
     */
    async getInvoice(invoiceNumber: string): Promise<ZATCAInvoice | null> {
      // Implement your storage retrieval logic here
      // This is a placeholder - replace with your actual storage system
      return this.loadInvoiceFromStorage(invoiceNumber);
    }
  
    /**
     * Get all invoices for a date range
     */
    async getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<ZATCAInvoice[]> {
      // Implement your storage retrieval logic here
      return this.loadInvoicesFromStorageByDateRange(startDate, endDate);
    }
  
    /**
     * Update invoice payment status
     */
    async updatePaymentStatus(
      invoiceNumber: string, 
      status: 'paid' | 'pending' | 'overdue'
    ): Promise<boolean> {
      try {
        const invoice = await this.getInvoice(invoiceNumber);
        if (!invoice) {
          throw new Error('Invoice not found');
        }
  
        invoice.invoiceData.paymentStatus = status;
        invoice.updatedAt = new Date();
  
        await this.saveInvoice(invoice);
        return true;
  
      } catch (error) {
        console.error('Failed to update payment status:', error);
        return false;
      }
    }
  
    /**
     * Generate invoice report
     */
    async generateReport(params: {
      startDate: Date;
      endDate: Date;
      groupBy?: 'day' | 'month' | 'customer';
    }): Promise<{
      totalInvoices: number;
      totalAmount: number;
      totalVAT: number;
      averageAmount: number;
      paymentStatus: {
        paid: number;
        pending: number;
        overdue: number;
      };
      topCustomers?: Array<{ name: string; totalSpent: number; invoiceCount: number }>;
    }> {
      const invoices = await this.getInvoicesByDateRange(params.startDate, params.endDate);
      
      const report = {
        totalInvoices: invoices.length,
        totalAmount: 0,
        totalVAT: 0,
        averageAmount: 0,
        paymentStatus: {
          paid: 0,
          pending: 0,
          overdue: 0,
        },
        topCustomers: [] as Array<{ name: string; totalSpent: number; invoiceCount: number }>,
      };
  
      const customerStats = new Map<string, { totalSpent: number; invoiceCount: number }>();
  
      invoices.forEach(invoice => {
        report.totalAmount += invoice.totals.totalAmount;
        report.totalVAT += invoice.totals.totalVAT;
  
        // Payment status count
        const status = invoice.invoiceData.paymentStatus || 'pending';
        report.paymentStatus[status]++;
  
        // Customer statistics
        if (invoice.invoiceData.customer?.name) {
          const customerName = invoice.invoiceData.customer.name;
          const existing = customerStats.get(customerName) || { totalSpent: 0, invoiceCount: 0 };
          existing.totalSpent += invoice.totals.totalAmount;
          existing.invoiceCount += 1;
          customerStats.set(customerName, existing);
        }
      });
  
      report.averageAmount = report.totalInvoices > 0 ? report.totalAmount / report.totalInvoices : 0;
  
      // Top customers
      report.topCustomers = Array.from(customerStats.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);
  
      return report;
    }
  
    /**
     * Regenerate QR code for existing invoice
     */
    async regenerateQR(invoiceNumber: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
      try {
        const invoice = await this.getInvoice(invoiceNumber);
        if (!invoice) {
          return { success: false, error: 'Invoice not found' };
        }
  
        const newQRCode = this.qrGenerator.generateQRCode(invoice.invoiceData, invoice.totals);
        
        // Update invoice with new QR code
        invoice.zatca.qrCode = newQRCode;
        invoice.updatedAt = new Date();
        
        await this.saveInvoice(invoice);
  
        return { success: true, qrCode: newQRCode };
  
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to regenerate QR code' 
        };
      }
    }
  
    // Private helper methods
  
    private generateInvoiceNumber(): string {
      const year = new Date().getFullYear();
      const paddedCounter = this.invoiceCounter.toString().padStart(6, '0');
      return `INV-${year}-${paddedCounter}`;
    }
  
    private generateReturnInvoiceNumber(originalInvoiceNumber: string): string {
      return `RET-${originalInvoiceNumber}`;
    }
  
    private incrementInvoiceCounter(): void {
      this.invoiceCounter++;
      this.saveInvoiceCounter();
    }
  
    private loadInvoiceCounter(): void {
      // Load from localStorage, database, or file
      // This is a placeholder - implement based on your storage system
      try {
        const saved = localStorage?.getItem('zatca_invoice_counter');
        if (saved) {
          this.invoiceCounter = parseInt(saved, 10) || 1;
        }
      } catch {
        // Fallback for environments without localStorage
        this.invoiceCounter = 1;
      }
    }
  
    private saveInvoiceCounter(): void {
      // Save to localStorage, database, or file
      try {
        localStorage?.setItem('zatca_invoice_counter', this.invoiceCounter.toString());
      } catch {
        // Handle environments without localStorage
        console.warn('Could not save invoice counter');
      }
    }
  
    private async saveInvoice(invoice: ZATCAInvoice): Promise<void> {
      // Implement your storage logic here
      // Examples: Database, file system, cloud storage, etc.
      
      try {
        // Placeholder - replace with your actual storage implementation
        const invoicesKey = 'zatca_invoices';
        const existing = JSON.parse(localStorage?.getItem(invoicesKey) || '[]');
        existing.push({
          ...invoice,
          invoiceData: {
            ...invoice.invoiceData,
            invoiceDate: invoice.invoiceData.invoiceDate.toISOString(),
            dueDate: invoice.invoiceData.dueDate?.toISOString(),
          },
          createdAt: invoice.createdAt.toISOString(),
          updatedAt: invoice.updatedAt.toISOString(),
        });
        
        localStorage?.setItem(invoicesKey, JSON.stringify(existing));
        console.log(`💾 Saved invoice: ${invoice.invoiceData.invoiceNumber}`);
        
      } catch (error) {
        console.error('Failed to save invoice:', error);
        throw error;
      }
    }
  
    private async loadInvoiceFromStorage(invoiceNumber: string): Promise<ZATCAInvoice | null> {
      // Implement your storage retrieval logic here
      try {
        const invoicesKey = 'zatca_invoices';
        const invoices = JSON.parse(localStorage?.getItem(invoicesKey) || '[]');
        const found = invoices.find((inv: any) => inv.invoiceData.invoiceNumber === invoiceNumber);
        
        if (found) {
          // Convert date strings back to Date objects
          return {
            ...found,
            invoiceData: {
              ...found.invoiceData,
              invoiceDate: new Date(found.invoiceData.invoiceDate),
              dueDate: found.invoiceData.dueDate ? new Date(found.invoiceData.dueDate) : undefined,
            },
            createdAt: new Date(found.createdAt),
            updatedAt: new Date(found.updatedAt),
          };
        }
        
        return null;
      } catch {
        return null;
      }
    }
  
    private async loadInvoicesFromStorageByDateRange(startDate: Date, endDate: Date): Promise<ZATCAInvoice[]> {
      // Implement your storage retrieval logic here
      try {
        const invoicesKey = 'zatca_invoices';
        const allInvoices = JSON.parse(localStorage?.getItem(invoicesKey) || '[]');
        
        return allInvoices
          .map((inv: any) => ({
            ...inv,
            invoiceData: {
              ...inv.invoiceData,
              invoiceDate: new Date(inv.invoiceData.invoiceDate),
              dueDate: inv.invoiceData.dueDate ? new Date(inv.invoiceData.dueDate) : undefined,
            },
            createdAt: new Date(inv.createdAt),
            updatedAt: new Date(inv.updatedAt),
          }))
          .filter((inv: ZATCAInvoice) => {
            const invoiceDate = inv.invoiceData.invoiceDate;
            return invoiceDate >= startDate && invoiceDate <= endDate;
          });
      } catch {
        return [];
      }
    }
  }