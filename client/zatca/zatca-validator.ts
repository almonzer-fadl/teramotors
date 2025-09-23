import { InvoiceData, Customer, InvoiceItem } from './zatca-types';
import { ZATCAUtils } from './zatca-utils';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ZATCAValidator {
  /**
   * Validate complete invoice data
   */
  static validateInvoice(invoiceData: InvoiceData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic invoice validation
    errors.push(...this.validateBasicInvoiceData(invoiceData));
    
    // Items validation
    errors.push(...this.validateInvoiceItems(invoiceData.items));
    
    // Customer validation (if provided)
    if (invoiceData.customer) {
      const customerValidation = this.validateCustomer(invoiceData.customer);
      errors.push(...customerValidation.errors);
      warnings.push(...customerValidation.warnings);
    }

    // Business logic validation
    errors.push(...this.validateBusinessLogic(invoiceData));
    warnings.push(...this.generateBusinessWarnings(invoiceData));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate basic invoice information
   */
  private static validateBasicInvoiceData(invoiceData: InvoiceData): string[] {
    const errors: string[] = [];

    // Invoice number
    if (!invoiceData.invoiceNumber?.trim()) {
      errors.push('Invoice number is required');
    } else if (invoiceData.invoiceNumber.length > 50) {
      errors.push('Invoice number must be 50 characters or less');
    }

    // Invoice date
    if (!invoiceData.invoiceDate) {
      errors.push('Invoice date is required');
    } else {
      // Check if date is not in the future
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      
      if (invoiceData.invoiceDate > now) {
        errors.push('Invoice date cannot be in the future');
      }

      // Check if date is not too old (1 year limit)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (invoiceData.invoiceDate < oneYearAgo) {
        errors.push('Invoice date cannot be more than 1 year old');
      }
    }

    // Due date validation
    if (invoiceData.dueDate && invoiceData.invoiceDate) {
      if (invoiceData.dueDate < invoiceData.invoiceDate) {
        errors.push('Due date cannot be before invoice date');
      }
    }

    // Currency
    if (invoiceData.currency && invoiceData.currency !== 'SAR') {
      errors.push('Only SAR currency is supported for ZATCA compliance');
    }

    // Payment method validation
    if (invoiceData.paymentMethod) {
      const validMethods = ['cash', 'card', 'bank_transfer', 'cheque', 'credit', 'other'];
      if (!validMethods.includes(invoiceData.paymentMethod)) {
        errors.push('Invalid payment method');
      }
    }

    return errors;
  }

  /**
   * Validate invoice items
   */
  private static validateInvoiceItems(items: InvoiceItem[]): string[] {
    const errors: string[] = [];

    // Must have at least one item
    if (!items || items.length === 0) {
      errors.push('Invoice must have at least one item');
      return errors;
    }

    // Validate each item
    items.forEach((item, index) => {
      const itemErrors = ZATCAUtils.validateInvoiceItem(item);
      errors.push(...itemErrors.map(error => `Item ${index + 1}: ${error}`));
    });

    // Check for duplicate item IDs
    const itemIds = items.map(item => item.id);
    const duplicateIds = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate item IDs found: ${duplicateIds.join(', ')}`);
    }

    return errors;
  }

  /**
   * Validate customer information
   */
  static validateCustomer(customer: Customer): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // VAT number validation (if provided)
    if (customer.vatNumber) {
      if (!ZATCAUtils.isValidSaudiVATNumber(customer.vatNumber)) {
        errors.push('Invalid customer VAT number format');
      }
    }

    // Email validation
    if (customer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone number validation
    if (customer.phone) {
      const formattedPhone = ZATCAUtils.formatSaudiPhoneNumber(customer.phone);
      if (!formattedPhone) {
        warnings.push('Phone number format may be invalid');
      }
    }

    // Address validation
    if (customer.address) {
      if (!customer.address.city?.trim()) {
        errors.push('Customer city is required when address is provided');
      }

      if (!customer.address.country?.trim()) {
        errors.push('Customer country is required when address is provided');
      } else if (customer.address.country !== 'SA') {
        warnings.push('Customer address is outside Saudi Arabia');
      }

      if (customer.address.postalCode && !ZATCAUtils.isValidSaudiPostalCode(customer.address.postalCode)) {
        errors.push('Invalid customer postal code format');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate business logic rules
   */
  private static validateBusinessLogic(invoiceData: InvoiceData): string[] {
    const errors: string[] = [];

    // Calculate totals for validation
    const totals = ZATCAUtils.calculateInvoiceTotals(invoiceData);

    // Minimum invoice amount (avoid zero or negative invoices)
    if (totals.totalAmount <= 0) {
      errors.push('Invoice total amount must be greater than zero');
    }

    // Maximum invoice amount (anti-fraud check)
    const maxAmount = 1000000; // 1 million SAR
    if (totals.totalAmount > maxAmount) {
      errors.push(`Invoice amount exceeds maximum limit of ${ZATCAUtils.formatCurrency(maxAmount)}`);
    }

    // VAT validation
    if (totals.totalVAT < 0) {
      errors.push('Total VAT amount cannot be negative');
    }

    // Discount validation
    if (invoiceData.globalDiscount && invoiceData.globalDiscount > totals.subtotal) {
      errors.push('Global discount cannot exceed subtotal amount');
    }

    // B2B specific validations
    if (ZATCAUtils.isB2BInvoice(invoiceData)) {
      if (!invoiceData.customer?.name?.trim()) {
        errors.push('Customer name is required for B2B invoices');
      }

      if (!invoiceData.customer?.address) {
        errors.push('Customer address is required for B2B invoices');
      }
    }

    return errors;
  }

  /**
   * Generate business warnings
   */
  private static generateBusinessWarnings(invoiceData: InvoiceData): string[] {
    const warnings: string[] = [];

    // Calculate totals for warnings
    const totals = ZATCAUtils.calculateInvoiceTotals(invoiceData);

    // Large amount warning
    if (totals.totalAmount > 100000) { // 100k SAR
      warnings.push('Large invoice amount - ensure accuracy');
    }

    // High discount warning
    const discountPercentage = (totals.totalDiscount / totals.subtotal) * 100;
    if (discountPercentage > 50) {
      warnings.push('High discount percentage - verify discount policy');
    }

    // Overdue invoice warning
    if (ZATCAUtils.isInvoiceOverdue(invoiceData)) {
      const daysPastDue = ZATCAUtils.daysBetween(invoiceData.dueDate!, new Date());
      warnings.push(`Invoice is ${daysPastDue} days overdue`);
    }

    // Mixed VAT rates warning
    const vatRates = [...new Set(invoiceData.items.map(item => item.vatRate))];
    if (vatRates.length > 2) {
      warnings.push('Multiple VAT rates detected - verify tax calculations');
    }

    // Weekend invoice warning
    const invoiceDay = invoiceData.invoiceDate.getDay();
    if (invoiceDay === 5 || invoiceDay === 6) { // Friday or Saturday
      warnings.push('Invoice issued on weekend');
    }

    return warnings;
  }

  /**
   * Validate QR code data before generation
   */
  static validateQRData(qrData: {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    totalAmount: string;
    vatAmount: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Seller name
    if (!qrData.sellerName?.trim()) {
      errors.push('Seller name is required for QR code');
    } else if (qrData.sellerName.length > 100) {
      errors.push('Seller name too long for QR code (max 100 characters)');
    }

    // VAT number
    if (!ZATCAUtils.isValidSaudiVATNumber(qrData.vatNumber)) {
      errors.push('Invalid VAT number for QR code');
    }

    // Timestamp
    try {
      const date = new Date(qrData.timestamp);
      if (isNaN(date.getTime())) {
        errors.push('Invalid timestamp format for QR code');
      }
    } catch {
      errors.push('Invalid timestamp for QR code');
    }

    // Amount validation
    const totalAmount = parseFloat(qrData.totalAmount);
    const vatAmount = parseFloat(qrData.vatAmount);

    if (isNaN(totalAmount) || totalAmount <= 0) {
      errors.push('Invalid total amount for QR code');
    }

    if (isNaN(vatAmount) || vatAmount < 0) {
      errors.push('Invalid VAT amount for QR code');
    }

    if (!isNaN(totalAmount) && !isNaN(vatAmount) && vatAmount > totalAmount) {
      errors.push('VAT amount cannot exceed total amount in QR code');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Quick validation for common errors
   */
  static quickValidate(invoiceData: InvoiceData): { isValid: boolean; criticalErrors: string[] } {
    const criticalErrors: string[] = [];

    // Must-have fields only
    if (!invoiceData.invoiceNumber?.trim()) {
      criticalErrors.push('Invoice number missing');
    }

    if (!invoiceData.invoiceDate) {
      criticalErrors.push('Invoice date missing');
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      criticalErrors.push('No invoice items');
    }

    // Quick totals check
    try {
      const totals = ZATCAUtils.calculateInvoiceTotals(invoiceData);
      if (totals.totalAmount <= 0) {
        criticalErrors.push('Invalid invoice total');
      }
    } catch {
      criticalErrors.push('Error calculating invoice totals');
    }

    return {
      isValid: criticalErrors.length === 0,
      criticalErrors,
    };
  }
}