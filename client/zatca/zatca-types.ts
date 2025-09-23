
export interface InvoiceItem {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    vatRate: number; // Percentage (e.g., 15 for 15%)
    discount?: number;
    category?: string;
  }
  
  // Customer information (optional for B2C)
  export interface Customer {
    id?: string;
    name?: string;
    vatNumber?: string;
    email?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  }
  
  // Main invoice data structure
  export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate?: Date;
    currency: string; // Default: "SAR"
    
    // Customer info (optional for B2C)
    customer?: Customer;
    
    // Invoice items
    items: InvoiceItem[];
    
    // Additional charges/discounts
    globalDiscount?: number;
    shippingCost?: number;
    additionalFees?: number;
    
    // Payment info
    paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'other';
    paymentStatus?: 'paid' | 'pending' | 'overdue';
    
    // Notes
    notes?: string;
    internalNotes?: string;
  }
  
  // Calculated invoice totals
  export interface InvoiceTotals {
    subtotal: number;          // Sum of all items before VAT
    totalDiscount: number;     // Total discounts applied
    totalAdditionalFees: number; // Shipping, fees, etc.
    taxableAmount: number;     // Amount subject to VAT
    totalVAT: number;          // Total VAT amount
    totalAmount: number;       // Final amount including VAT
  }
  
  // ZATCA QR code data structure
  export interface ZATCAQRData {
    sellerName: string;
    vatNumber: string;
    timestamp: string;        // ISO 8601 format
    totalAmount: string;      // Including VAT
    vatAmount: string;
    invoiceHash?: string;     // For Phase 2
    digitalSignature?: string; // For Phase 2
    publicKey?: string;       // For Phase 2
    certificateSignature?: string; // For Phase 2
  }
  
  // Complete invoice with ZATCA compliance
  export interface ZATCAInvoice {
    // Basic invoice data
    invoiceData: InvoiceData;
    
    // Calculated totals
    totals: InvoiceTotals;
    
    // ZATCA compliance data
    zatca: {
      qrCode: string;           // Base64 encoded QR data
      qrCodeImage?: string;     // Data URL for QR image (optional)
      compliance: {
        phase: 1 | 2;
        isCompliant: boolean;
        errors: string[];
        warnings: string[];
      };
    };
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
    version: string;
  }
  
  // Result of invoice generation
  export interface InvoiceGenerationResult {
    success: boolean;
    invoice?: ZATCAInvoice;
    qrCode?: string;
    errors: string[];
    warnings: string[];
  }
  
  // VAT rate definitions for Saudi Arabia
  export const SAUDI_VAT_RATES = {
    STANDARD: 15,     // Standard VAT rate (15%)
    ZERO: 0,         // Zero-rated supplies
    EXEMPT: 0,       // VAT-exempt supplies
  } as const;
  
  // Invoice types for different business scenarios
  export type InvoiceType = 
    | 'sale'           // Regular sale
    | 'return'         // Return/refund
    | 'credit_note'    // Credit note
    | 'debit_note'     // Debit note
    | 'proforma'       // Proforma invoice
    | 'quote';         // Price quotation
  
  // Payment methods recognized by ZATCA
  export type PaymentMethod = 
    | 'cash'
    | 'card'
    | 'bank_transfer'
    | 'cheque'
    | 'credit'
    | 'other';
  
  // Business categories (update based on your business)
  export type BusinessCategory = 
    | 'retail'
    | 'wholesale'
    | 'services'
    | 'manufacturing'
    | 'restaurant'
    | 'healthcare'
    | 'education'
    | 'technology'
    | 'construction'
    | 'other';
  
  // Configuration for ZATCA integration
  export interface ZATCAConfig {
    companyName: string;
    vatNumber: string;
    businessCategory: BusinessCategory;
    defaultCurrency: string;
    defaultVATRate: number;
    environment: 'sandbox' | 'production';
    
    // Invoice numbering
    invoicePrefix: string;
    startingNumber: number;
    
    // Display preferences
    generateQRImage: boolean;
    includeLogo: boolean;
    
    // Compliance settings
    strictValidation: boolean;
    autoGenerate: boolean;
  }