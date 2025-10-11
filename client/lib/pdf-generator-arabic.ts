import { Browser, Page } from 'puppeteer';
import QRCode from 'qrcode';
import { Invoice, JobCard } from '@/lib/models';
import { getPuppeteerBrowser } from './puppeteer-config';

export interface ArabicPDFOptions {
  language: 'ar' | 'en';
  includeQRCode?: boolean;
  format?: 'A4' | 'Letter';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export class ArabicPDFGenerator {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await getPuppeteerBrowser();
    }
  }

  async close() {
    // Note: We don't close the browser here as it's managed by the singleton
    // The browser will be closed when the application shuts down
    this.browser = null;
  }

  async generateInvoicePDF(
    invoice: any, 
    jobCard: any, 
    options: ArabicPDFOptions = { language: 'ar' }
  ): Promise<Uint8Array> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set Arabic font support
      await page.evaluateOnNewDocument(() => {
        // Add Arabic font support
        const style = document.createElement('style');
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');
        `;
        document.head.appendChild(style);
      });

      const html = await this.generateInvoiceHTML(invoice, jobCard, options);
      
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Generate PDF with Arabic support
      const pdf = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  private async generateInvoiceHTML(invoice: any, jobCard: any, options: ArabicPDFOptions): Promise<string> {
    const isRTL = options.language === 'ar';
    const t = this.getTranslations(options.language);

    // Calculate totals
    const services = jobCard?.services || [];
    const parts = jobCard?.partsUsed || [];
    const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
    const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.quantity * p.cost), 0);
    const subtotal = servicesTotal + partsTotal;
    const tax = subtotal * 0.15;
    const grandTotal = subtotal + tax;

    return `
<!DOCTYPE html>
<html lang="${options.language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${isRTL ? "'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"};
            line-height: 1.6;
            color: #333;
            direction: ${isRTL ? 'rtl' : 'ltr'};
            background: white;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: ${isRTL ? 'right' : 'left'};
            border-bottom: 3px solid #F13F33;
            padding-bottom: 20px;
            margin-bottom: 30px;
            position: relative;
        }

        .company-name {
            font-size: 28px;
            font-weight: 700;
            color: #F13F33;
            margin: 0;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .invoice-title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin: 10px 0;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .qr-code {
            position: absolute;
            top: 0;
            ${isRTL ? 'left: 0;' : 'right: 0;'}
            width: 120px;
            height: 120px;
            text-align: center;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
        }

        .qr-code img {
            width: 100px;
            height: 100px;
            border-radius: 4px;
        }

        .qr-label {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .info-section h3 {
            font-size: 18px;
            font-weight: 600;
            color: #F13F33;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .info-section p {
            margin: 8px 0;
            color: #666;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .services-table, .parts-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }

        .services-table th, .parts-table th {
            background: #F13F33;
            color: white;
            padding: 12px 8px;
            text-align: ${isRTL ? 'right' : 'left'};
            font-weight: 600;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .services-table td, .parts-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            text-align: ${isRTL ? 'right' : 'left'};
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .services-table tr:nth-child(even), .parts-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .totals {
            margin-top: 30px;
            text-align: ${isRTL ? 'left' : 'right'};
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .grand-total {
            font-weight: 700;
            font-size: 18px;
            color: #F13F33;
            border-top: 2px solid #F13F33;
            margin-top: 10px;
            padding-top: 10px;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .notes {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-${isRTL ? 'right' : 'left'}: 4px solid #F13F33;
        }

        .notes h3 {
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
            font-weight: 600;
            color: #F13F33;
            margin-bottom: 10px;
        }

        .notes p {
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
            color: #666;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-paid {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
        }

        @media print {
            body { margin: 0; }
            .container { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="company-name">${t.company}</h1>
            <h2 class="invoice-title">${t.title} #${String(invoice._id || '').slice(-6)}</h2>
            
            ${invoice.zatca?.qrCode ? `
            <div class="qr-code">
                <img src="data:image/png;base64,${await this.generateQRCodeImage(invoice.zatca.qrCode)}" alt="ZATCA QR">
                <div class="qr-label">${t.zatcaCompliant}</div>
            </div>
            ` : ''}
        </div>

        <div class="invoice-info">
            <div class="info-section">
                <h3>${t.invoiceNumber}${String(invoice._id || '').slice(-6)}</h3>
                <p><strong>${t.date}:</strong> ${this.formatDate(invoice.createdAt || Date.now(), isRTL)}</p>
                <p><strong>${t.dueDate}:</strong> ${this.formatDate(invoice.dueDate || Date.now(), isRTL)}</p>
                <p><strong>${t.status}:</strong> <span class="status-badge status-${invoice.status || 'pending'}">${this.getStatusText(invoice.status, isRTL)}</span></p>
            </div>
            
            <div class="info-section">
                <h3>${t.customerInfo}</h3>
                <p><strong>${t.customer}:</strong> ${(invoice.customerId?.firstName || '') + ' ' + (invoice.customerId?.lastName || '')}</p>
                ${invoice.customerId?.email ? `<p><strong>Email:</strong> ${invoice.customerId.email}</p>` : ''}
                ${invoice.customerId?.phone ? `<p><strong>Phone:</strong> ${invoice.customerId.phone}</p>` : ''}
            </div>
            
            <div class="info-section">
                <h3>${t.vehicleInfo}</h3>
                ${invoice.vehicleId ? `
                    <p><strong>${t.vehicle}:</strong> ${invoice.vehicleId.year} ${invoice.vehicleId.make} ${invoice.vehicleId.model}</p>
                    ${invoice.vehicleId.licensePlate ? `<p><strong>${t.licensePlate}:</strong> ${invoice.vehicleId.licensePlate}</p>` : ''}
                ` : '<p>No vehicle information</p>'}
            </div>
        </div>

        ${services.length > 0 ? `
        <table class="services-table">
            <thead>
                <tr>
                    <th>${t.service}</th>
                    <th>${t.quantity}</th>
                    <th>${t.laborHours}</th>
                    <th>${t.laborRate}</th>
                    <th>${t.total}</th>
                </tr>
            </thead>
            <tbody>
                ${services.map((s: any) => `
                    <tr>
                        <td>${s.serviceId?.name || ''}</td>
                        <td>${s.quantity}</td>
                        <td>${s.laborHours}</td>
                        <td>${s.laborRate.toFixed(2)}</td>
                        <td>${(s.laborHours * s.laborRate).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${parts.length > 0 ? `
        <table class="parts-table">
            <thead>
                <tr>
                    <th>${t.partName}</th>
                    <th>${t.quantity}</th>
                    <th>${t.unitCost}</th>
                    <th>${t.total}</th>
                </tr>
            </thead>
            <tbody>
                ${parts.map((p: any) => `
                    <tr>
                        <td>${p.partId?.name || ''}</td>
                        <td>${p.quantity}</td>
                        <td>${p.cost.toFixed(2)}</td>
                        <td>${(p.quantity * p.cost).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        <div class="totals">
            <div class="total-row">
                <span>${t.subtotal}:</span>
                <span>${this.formatCurrency(subtotal, isRTL)}</span>
            </div>
            <div class="total-row">
                <span>${t.tax}:</span>
                <span>${this.formatCurrency(tax, isRTL)}</span>
            </div>
            <div class="total-row grand-total">
                <span>${t.grandTotal}:</span>
                <span>${this.formatCurrency(grandTotal, isRTL)}</span>
            </div>
        </div>

        ${invoice.notes ? `
        <div class="notes">
            <h3>${t.notes}</h3>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>${t.generatedOn} ${this.formatDate(new Date(), isRTL)}</p>
            <p>${t.systemName}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getTranslations(language: 'ar' | 'en') {
    return {
      ar: {
        title: "فاتورة",
        company: "تيرا موتورز لصيانة السيارات",
        invoiceNumber: "رقم الفاتورة #",
        date: "التاريخ",
        dueDate: "تاريخ الاستحقاق",
        customerInfo: "معلومات العميل",
        customer: "العميل",
        vehicleInfo: "معلومات المركبة",
        vehicle: "المركبة",
        year: "السنة",
        licensePlate: "رقم اللوحة",
        services: "الخدمات",
        service: "الخدمة",
        quantity: "الكمية",
        laborHours: "الساعات",
        laborRate: "المعدل",
        total: "المجموع",
        parts: "القطع",
        partName: "اسم القطعة",
        partNumber: "رقم القطعة",
        unitCost: "تكلفة الوحدة",
        subtotal: "المجموع الفرعي",
        tax: "الضريبة (15%)",
        grandTotal: "المجموع الإجمالي",
        notes: "ملاحظات",
        generatedOn: "تم الإنشاء في",
        systemName: "نظام إدارة صيانة السيارات تيرا موتورز",
        status: "الحالة",
        zatcaCompliant: "متوافق مع ZATCA"
      },
      en: {
        title: "Invoice",
        company: "TeraMotors Auto Repair",
        invoiceNumber: "Invoice #",
        date: "Date",
        dueDate: "Due Date",
        customerInfo: "Customer Information",
        customer: "Customer",
        vehicleInfo: "Vehicle Information",
        vehicle: "Vehicle",
        year: "Year",
        licensePlate: "License Plate",
        services: "Services",
        service: "Service",
        quantity: "Quantity",
        laborHours: "Hours",
        laborRate: "Rate",
        total: "Total",
        parts: "Parts",
        partName: "Part Name",
        partNumber: "Part #",
        unitCost: "Unit Cost",
        subtotal: "Subtotal",
        tax: "Tax (15%)",
        grandTotal: "Grand Total",
        notes: "Notes",
        generatedOn: "Generated on",
        systemName: "TeraMotors Auto Repair Management System",
        status: "Status",
        zatcaCompliant: "ZATCA Compliant"
      }
    }[language];
  }

  private formatDate(date: Date | string | number, isRTL: boolean): string {
    const d = new Date(date);
    // Always use Latin numbers for dates
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  private formatCurrency(amount: number, isRTL: boolean): string {
    // Always use Latin numbers and Riyal symbol
    return `ر.س ${amount.toFixed(2)}`;
  }

  private getStatusText(status: string, isRTL: boolean): string {
    const statusMap = {
      ar: {
        pending: 'معلق',
        paid: 'مدفوع',
        cancelled: 'ملغي'
      },
      en: {
        pending: 'Pending',
        paid: 'Paid',
        cancelled: 'Cancelled'
      }
    };
    
    return statusMap[isRTL ? 'ar' : 'en'][status as keyof typeof statusMap.ar] || status;
  }

  private async generateQRCodeImage(qrCodeBase64: string): Promise<string> {
    try {
      // The qrCodeBase64 is already a TLV-encoded base64 string from ZATCA
      // We need to generate a QR code image from this data
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeBase64, { 
        width: 200, 
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      // Extract base64 part from data URL
      return qrCodeDataUrl.split(',')[1];
    } catch (error) {
      console.error('Error generating QR code image:', error);
      // Return a placeholder or empty string if QR generation fails
      return '';
    }
  }
}
