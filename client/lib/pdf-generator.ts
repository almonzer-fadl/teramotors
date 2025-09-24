// PDF Generator for TeraMotors
// This file provides PDF generation utilities for invoices and estimates

export interface PDFInvoiceData {
  invoice: {
    number: string;
    date: string;
    dueDate: string;
    status: string;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    vatNumber: string;
  };
  customer: {
    name: string;
    address: string;
    phone: string;
    email: string;
    vatNumber?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    vatRate: number;
  }>;
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  zatca: {
    qrCode: string;
    compliance: boolean;
  };
}

export class PDFGenerator {
  static generateInvoicePDF(data: PDFInvoiceData): string {
    // For now, return a simple HTML representation
    // This can be enhanced later with proper PDF generation
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${data.invoice.number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info h1 { color: #1f2937; margin: 0; }
          .invoice-details { text-align: right; }
          .customer-section { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f3f4f6; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; width: 200px; margin: 5px 0; }
          .total-final { border-top: 1px solid #ddd; padding-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>TeraMotors</h1>
            <p>Professional Auto Repair Services</p>
            <p>${data.company.address}</p>
            <p>Phone: ${data.company.phone}</p>
            <p>Email: ${data.company.email}</p>
            <p>VAT: ${data.company.vatNumber}</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p>Invoice #: ${data.invoice.number}</p>
            <p>Date: ${data.invoice.date}</p>
            <p>Due: ${data.invoice.dueDate}</p>
            <p>Status: ${data.invoice.status}</p>
          </div>
        </div>

        <div class="customer-section">
          <h3>Bill To:</h3>
          <p>${data.customer.name}</p>
          <p>${data.customer.address}</p>
          <p>Phone: ${data.customer.phone}</p>
          <p>Email: ${data.customer.email}</p>
          ${data.customer.vatNumber ? `<p>VAT: ${data.customer.vatNumber}</p>` : ''}
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>SAR ${item.unitPrice.toFixed(2)}</td>
                <td>SAR ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>SAR ${data.totals.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>VAT (15%):</span>
            <span>SAR ${data.totals.vatAmount.toFixed(2)}</span>
          </div>
          <div class="total-row total-final">
            <span>Total:</span>
            <span>SAR ${data.totals.total.toFixed(2)}</span>
          </div>
        </div>

        ${data.zatca.qrCode ? `
          <div style="margin-top: 20px; padding: 10px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
            <h4>ZATCA QR Code</h4>
            <p>QR Code: ${data.zatca.qrCode}</p>
            <p>Compliance: ${data.zatca.compliance ? 'Yes' : 'No'}</p>
          </div>
        ` : ''}

        <div style="margin-top: 40px; text-align: center; color: #6b7280;">
          <p>Thank you for choosing TeraMotors!</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateEstimatePDF(data: any): string {
    // Similar structure for estimates
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estimate ${data.estimateNumber || 'EST-001'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info h1 { color: #1f2937; margin: 0; }
          .estimate-details { text-align: right; }
          .customer-section { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f3f4f6; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; width: 200px; margin: 5px 0; }
          .total-final { border-top: 1px solid #ddd; padding-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>TeraMotors</h1>
            <p>Professional Auto Repair Services</p>
            <p>${data.company?.address || 'Address not provided'}</p>
            <p>Phone: ${data.company?.phone || 'Phone not provided'}</p>
            <p>Email: ${data.company?.email || 'Email not provided'}</p>
            <p>VAT: ${data.company?.vatNumber || 'VAT not provided'}</p>
          </div>
          <div class="estimate-details">
            <h2>ESTIMATE</h2>
            <p>Estimate #: ${data.estimateNumber || 'EST-001'}</p>
            <p>Date: ${data.date || new Date().toLocaleDateString()}</p>
            <p>Valid Until: ${data.validUntil || '30 days'}</p>
            <p>Status: ${data.status || 'Pending'}</p>
          </div>
        </div>

        <div class="customer-section">
          <h3>Bill To:</h3>
          <p>${data.customer?.name || 'Customer Name'}</p>
          <p>${data.customer?.address || 'Customer Address'}</p>
          <p>Phone: ${data.customer?.phone || 'Customer Phone'}</p>
          <p>Email: ${data.customer?.email || 'Customer Email'}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items?.map((item: any) => `
              <tr>
                <td>${item.description || 'Service'}</td>
                <td>${item.quantity || 1}</td>
                <td>SAR ${(item.unitPrice || 0).toFixed(2)}</td>
                <td>SAR ${(item.total || 0).toFixed(2)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No items</td></tr>'}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>SAR ${(data.totals?.subtotal || 0).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>VAT (15%):</span>
            <span>SAR ${(data.totals?.vatAmount || 0).toFixed(2)}</span>
          </div>
          <div class="total-row total-final">
            <span>Total:</span>
            <span>SAR ${(data.totals?.total || 0).toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #6b7280;">
          <p>Thank you for choosing TeraMotors!</p>
        </div>
      </body>
      </html>
    `;
  }

  static async generatePDFBuffer(html: string): Promise<Buffer> {
    // This would use a library like puppeteer or similar to convert HTML to PDF
    // For now, return a placeholder
    return Buffer.from(html, 'utf-8');
  }
}

export default PDFGenerator;
