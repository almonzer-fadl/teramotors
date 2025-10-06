import QRCode from 'qrcode';

interface InvoiceData {
  invoice: any;
  jobCard?: any;
  qrCodeData?: string;
  language?: string;
  isRTL?: boolean;
}

export async function generateInvoiceHTML(data: InvoiceData): Promise<string> {
  const { invoice, jobCard, qrCodeData, language = 'en', isRTL = false } = data;
  
  const services = jobCard?.services || [];
  const parts = jobCard?.partsUsed || [];
  const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
  const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.quantity * p.cost), 0);
  const subtotal = servicesTotal + partsTotal;
  const grandTotal = typeof invoice.totalAmount === 'number' ? invoice.totalAmount : subtotal;

  // Translation object
  const translations = {
    en: {
      title: "Invoice",
      company: "TeraMotors Auto Repair",
      invoiceNumber: "Invoice #",
      date: "Date",
      customerInfo: "Customer Information",
      customer: "Customer",
      vehicleInfo: "Vehicle Information",
      vehicle: "Vehicle",
      year: "Year",
      licensePlate: "License Plate",
      services: "Services",
      service: "Service",
      quantity: "Qty",
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
      status: "Status"
    },
    ar: {
      title: "فاتورة",
      company: "تيرا موتورز لصيانة السيارات",
      invoiceNumber: "رقم الفاتورة #",
      date: "التاريخ",
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
      status: "الحالة"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Generate QR code as data URL
  let qrCodeDataUrl = '';
  if (qrCodeData) {
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { width: 100, margin: 1 });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  return `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.title}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: ${isRTL ? "'Noto Sans Arabic', Arial, sans-serif" : "'Inter', Arial, sans-serif"};
                direction: ${isRTL ? 'rtl' : 'ltr'};
                background: white;
                color: #333;
                line-height: 1.6;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 10px;
            }
            
            .invoice-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                flex-wrap: wrap;
            }
            
            .info-section {
                flex: 1;
                margin: 0 10px;
                min-width: 200px;
            }
            
            .info-section h3 {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 5px;
            }
            
            .info-section p {
                font-size: 14px;
                color: #6b7280;
                margin: 5px 0;
            }
            
            .qr-code {
                position: absolute;
                top: 20px;
                ${isRTL ? 'left: 20px;' : 'right: 20px;'}
                width: 100px;
                height: 100px;
                text-align: center;
            }
            
            .qr-code img {
                width: 80px;
                height: 80px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
            }
            
            .qr-code p {
                font-size: 10px;
                color: #6b7280;
                margin-top: 5px;
            }
            
            .section {
                margin-bottom: 25px;
            }
            
            .section h2 {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 15px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
            }
            
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .table th {
                background: #f3f4f6;
                color: #374151;
                font-weight: 600;
                padding: 12px;
                text-align: center;
                border: 1px solid #e5e7eb;
                font-size: 14px;
            }
            
            .table td {
                padding: 12px;
                text-align: center;
                border: 1px solid #e5e7eb;
                font-size: 14px;
                color: #4b5563;
            }
            
            .table tr:nth-child(even) {
                background: #f9fafb;
            }
            
            .totals {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
                border: 1px solid #e5e7eb;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 16px;
            }
            
            .total-row.grand-total {
                font-weight: 700;
                font-size: 18px;
                color: #1f2937;
                border-top: 2px solid #e5e7eb;
                padding-top: 10px;
                margin-top: 15px;
            }
            
            .notes {
                margin-top: 30px;
                padding: 15px;
                background: #fef3c7;
                border-radius: 8px;
                border-right: 4px solid #f59e0b;
            }
            
            .notes h3 {
                font-size: 16px;
                font-weight: 600;
                color: #92400e;
                margin-bottom: 8px;
            }
            
            .notes p {
                color: #78350f;
                font-size: 14px;
            }
            
            @media print {
                body { margin: 0; }
                .qr-code { position: fixed; }
            }
        </style>
    </head>
    <body>
        ${qrCodeDataUrl ? `
        <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="ZATCA QR" style="width: 100px; height: 100px;">
            <p>ZATCA QR</p>
        </div>
        ` : ''}
        
        <div class="header">
            <h1>${t.title} #${String(invoice._id || '').slice(-6)}</h1>
        </div>
        
        <div class="invoice-info">
            <div class="info-section">
                <h3>${t.invoiceNumber}${String(invoice._id || '').slice(-6)}</h3>
                <p><strong>${t.date}:</strong> ${new Date(invoice.createdAt || Date.now()).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                <p><strong>${t.date}:</strong> ${new Date(invoice.dueDate || Date.now()).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                <p><strong>${t.status}:</strong> ${invoice.status || (isRTL ? 'معلق' : 'Pending')}</p>
            </div>
            
            <div class="info-section">
                <h3>${t.customerInfo}</h3>
                <p><strong>${t.customer}:</strong> ${(invoice.customerId?.firstName || '') + ' ' + (invoice.customerId?.lastName || '')}</p>
                ${invoice.customerId?.email ? `<p><strong>البريد الإلكتروني:</strong> ${invoice.customerId.email}</p>` : ''}
                ${invoice.customerId?.phone ? `<p><strong>الهاتف:</strong> ${invoice.customerId.phone}</p>` : ''}
            </div>
            
            <div class="info-section">
                <h3>${t.vehicleInfo}</h3>
                ${invoice.vehicleId ? `
                    <p><strong>${t.vehicle}:</strong> ${invoice.vehicleId.year} ${invoice.vehicleId.make} ${invoice.vehicleId.model}</p>
                    ${invoice.vehicleId.licensePlate ? `<p><strong>${t.licensePlate}:</strong> ${invoice.vehicleId.licensePlate}</p>` : ''}
                ` : ''}
            </div>
        </div>
        
        ${services.length > 0 ? `
        <div class="section">
            <h2>${t.services}</h2>
            <table class="table">
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
        </div>
        ` : ''}
        
        ${parts.length > 0 ? `
        <div class="section">
            <h2>${t.parts}</h2>
            <table class="table">
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
        </div>
        ` : ''}
        
        <div class="totals">
            <div class="total-row">
                <span>${t.subtotal}:</span>
                <span>${subtotal.toFixed(2)} ${isRTL ? 'ريال' : 'SAR'}</span>
            </div>
            <div class="total-row grand-total">
                <span>${t.grandTotal}:</span>
                <span>${grandTotal.toFixed(2)} ${isRTL ? 'ريال' : 'SAR'}</span>
            </div>
        </div>
        
        ${invoice.notes ? `
        <div class="notes">
            <h3>${t.notes}</h3>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}
    </body>
    </html>
  `;
}
