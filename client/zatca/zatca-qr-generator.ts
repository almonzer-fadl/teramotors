import { 
  InvoiceData, 
  ZATCAInvoice, 
  InvoiceGenerationResult, 
  ZATCAQRData,
  InvoiceTotals 
} from './zatca-types';
import { ZATCAUtils } from './zatca-utils';
import { ZATCAValidator, ValidationResult } from './zatca-validator';
import { COMPANY_CONFIG } from '../config/company-config';

export class ZATCAQRGenerator {
  private companyName: string;
  private companyVATNumber: string;

  constructor(companyName?: string, companyVATNumber?: string) {
    this.companyName = companyName || COMPANY_CONFIG.name;
    this.companyVATNumber = companyVATNumber || COMPANY_CONFIG.vatNumber;
    
    // Validate company info
    if (!ZATCAUtils.isValidSaudiVATNumber(this.companyVATNumber)) {
      throw new Error('Invalid company VAT number provided to ZATCAQRGenerator');
    }
  }

  /**
   * Generate complete ZATCA-compliant invoice with QR code
   */
  async generateInvoice(invoiceData: InvoiceData): Promise<InvoiceGenerationResult> {
    try {
      // Validate invoice data
      const validator = new ZATCAValidator();
      const validation = validator.validateInvoice(invoiceData);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        };
      }

      // Calculate totals
      const totals = ZATCAUtils.calculateInvoiceTotals(invoiceData);

      // Generate QR code
      const qrCode = this.generateQRCode(invoiceData, totals);

      // Create complete ZATCA invoice
      const zatcaInvoice: ZATCAInvoice = {
        invoiceData,
        totals,
        zatca: {
          qrCode,
          compliance: {
            phase: 1,
            isCompliant: true,
            errors: [],
            warnings: validation.warnings,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      };

      return {
        success: true,
        invoice: zatcaInvoice,
        qrCode,
        errors: [],
        warnings: validation.warnings,
      };

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
      };
    }
  }

  /**
   * Generate only the QR code (for quick operations)
   */
  private generateQRCode(invoiceData: InvoiceData, totals: InvoiceTotals): string {
    const qrData: ZATCAQRData = {
      sellerName: this.companyName,
      vatNumber: this.companyVATNumber,
      timestamp: ZATCAUtils.formatDateForZATCA(invoiceData.invoiceDate),
      totalAmount: totals.totalAmount.toFixed(2),
      vatAmount: totals.totalVAT.toFixed(2),
    };

    return this.createTLVQRCode(qrData);
  }

  /**
   * Create TLV (Tag-Length-Value) encoded QR code as per ZATCA specs
   */
  private createTLVQRCode(qrData: ZATCAQRData): string {
    const tlvFields: Buffer[] = [];

    // Tag 1: Seller Name
    tlvFields.push(ZATCAUtils.createTLVField(1, qrData.sellerName));
    
    // Tag 2: VAT Registration Number  
    tlvFields.push(ZATCAUtils.createTLVField(2, qrData.vatNumber));
    
    // Tag 3: Invoice Date & Time (ISO 8601)
    tlvFields.push(ZATCAUtils.createTLVField(3, qrData.timestamp));
    
    // Tag 4: Invoice Total (including VAT)
    tlvFields.push(ZATCAUtils.createTLVField(4, qrData.totalAmount));
    
    // Tag 5: VAT Amount
    tlvFields.push(ZATCAUtils.createTLVField(5, qrData.vatAmount));

    // Phase 2 fields (optional for now)
    if (qrData.invoiceHash) {
      tlvFields.push(ZATCAUtils.createTLVField(6, qrData.invoiceHash));
    }

    if (qrData.digitalSignature) {
      tlvFields.push(ZATCAUtils.createTLVField(7, qrData.digitalSignature));
    }

    if (qrData.publicKey) {
      tlvFields.push(ZATCAUtils.createTLVField(8, qrData.publicKey));
    }

    if (qrData.certificateSignature) {
      tlvFields.push(ZATCAUtils.createTLVField(9, qrData.certificateSignature));
    }

    // Combine all TLV fields and encode as Base64
    const tlvBuffer = Buffer.concat(tlvFields);
    return tlvBuffer.toString('base64');
  }

  /**
   * Generate QR code from minimal data (for POS systems)
   */
  generateQuickQR(params: {
    invoiceNumber: string;
    totalAmount: number;
    vatAmount?: number;
    date?: Date;
  }): string {
    const date = params.date || new Date();
    const vatAmount = params.vatAmount || ZATCAUtils.calculateVAT(
      params.totalAmount - (params.vatAmount || 0), 
      ZATCAUtils.getStandardVATRate()
    );

    const qrData: ZATCAQRData = {
      sellerName: this.companyName,
      vatNumber: this.companyVATNumber,
      timestamp: ZATCAUtils.formatDateForZATCA(date),
      totalAmount: params.totalAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
    };

    return this.createTLVQRCode(qrData);
  }

  /**
   * Validate existing QR code (for testing)
   */
  validateQRCode(qrCodeBase64: string): { isValid: boolean; data?: Record<number, string>; errors: string[] } {
    try {
      const parsedData = ZATCAUtils.parseQRCode(qrCodeBase64);
      
      // Check required fields
      const errors: string[] = [];
      
      if (!parsedData[1]) errors.push('Missing seller name (Tag 1)');
      if (!parsedData[2]) errors.push('Missing VAT number (Tag 2)');
      if (!parsedData[3]) errors.push('Missing timestamp (Tag 3)');
      if (!parsedData[4]) errors.push('Missing total amount (Tag 4)');
      if (!parsedData[5]) errors.push('Missing VAT amount (Tag 5)');

      // Validate VAT number format
      if (parsedData[2] && !ZATCAUtils.isValidSaudiVATNumber(parsedData[2])) {
        errors.push('Invalid VAT number format');
      }

      // Validate amounts
      const totalAmount = parseFloat(parsedData[4] || '0');
      const vatAmount = parseFloat(parsedData[5] || '0');
      
      if (totalAmount <= 0) errors.push('Invalid total amount');
      if (vatAmount < 0) errors.push('Invalid VAT amount');
      if (vatAmount > totalAmount) errors.push('VAT amount exceeds total');

      return {
        isValid: errors.length === 0,
        data: parsedData,
        errors,
      };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid QR code format'],
      };
    }
  }

  /**
   * Get QR code as displayable image (requires qrcode library)
   */
  async generateQRImage(qrCodeData: string): Promise<string> {
    try {
      // Import QRCode dynamically to avoid build issues
      const QRCode = await import('qrcode');
      return await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Failed to generate QR code image:', error);
      // Return a placeholder if QR generation fails
      return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    }
  }

  /**
   * Batch generate QR codes for multiple invoices
   */
  async batchGenerateQR(invoicesData: InvoiceData[]): Promise<{
    successful: Array<{ invoiceNumber: string; qrCode: string }>;
    failed: Array<{ invoiceNumber: string; errors: string[] }>;
  }> {
    const successful: Array<{ invoiceNumber: string; qrCode: string }> = [];
    const failed: Array<{ invoiceNumber: string; errors: string[] }> = [];

    for (const invoiceData of invoicesData) {
      try {
        // Quick validation
        const validator = new ZATCAValidator();
        const quickValidation = validator.quickValidate(invoiceData);
        
        if (!quickValidation.isValid) {
          failed.push({
            invoiceNumber: invoiceData.invoiceNumber,
            errors: quickValidation.criticalErrors,
          });
          continue;
        }

        // Generate QR code
        const totals = ZATCAUtils.calculateInvoiceTotals(invoiceData);
        const qrCode = this.generateQRCode(invoiceData, totals);
        
        successful.push({
          invoiceNumber: invoiceData.invoiceNumber,
          qrCode,
        });

      } catch (error) {
        failed.push({
          invoiceNumber: invoiceData.invoiceNumber,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Update company information
   */
  updateCompanyInfo(companyName: string, companyVATNumber: string): void {
    if (!ZATCAUtils.isValidSaudiVATNumber(companyVATNumber)) {
      throw new Error('Invalid company VAT number');
    }

    this.companyName = companyName;
    this.companyVATNumber = companyVATNumber;
  }

  /**
   * Get current company information
   */
  getCompanyInfo(): { name: string; vatNumber: string } {
    return {
      name: this.companyName,
      vatNumber: this.companyVATNumber,
    };
  }
}