import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Invoice, JobCard, Part, Service, Customer, Vehicle } from '@/lib/models';
import { getServerSession } from "@/lib/auth-server";
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    
    // Get language from query parameter or default to English
    const url = new URL(request.url);
    const language = url.searchParams.get('lang') || 'en';
    const isRTL = language === 'ar';

    const invoice = await Invoice.findById(id)
      .populate('customerId')
      .populate('vehicleId', 'make model year licensePlate');

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let jobCard: any = null;
    if (invoice.jobCardId) {
      jobCard = await JobCard.findById(invoice.jobCardId)
        .populate('services.serviceId')
        .populate('partsUsed.partId');
    }

    // Generate HTML content for PDF
    const htmlContent = generateInvoiceHTML(invoice, jobCard, language, isRTL);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice._id.toString()}-${new Date().toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating Invoice PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateInvoiceHTML(invoice: any, jobCard: any, language: string = 'en', isRTL: boolean = false): string {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ${isRTL ? 'ريال' : 'SAR'}`;

  // Translation object
  const translations = {
    en: {
      title: "Invoice",
      company: "TeraMotors Auto Repair",
      printButton: "🖨️ Print PDF",
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
    },
    ar: {
      title: "فاتورة",
      company: "تيرا موتورز لصيانة السيارات",
      printButton: "🖨️ طباعة PDF",
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
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Calculate totals
  const services = jobCard?.services || [];
  const parts = jobCard?.partsUsed || [];
  const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
  const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.quantity * p.cost), 0);
  const subtotal = servicesTotal + partsTotal;
  const tax = subtotal * 0.15;
  const grandTotal = subtotal + tax;

  // Generate QR code as data URL
  let qrCodeDataUrl = '';
  if (invoice.zatca?.qrCode) {
    QRCode.toDataURL(invoice.zatca.qrCode, { width: 100, margin: 1 })
      .then((url: string) => {
        qrCodeDataUrl = url;
      })
      .catch((error: any) => {
        console.error('Error generating QR code:', error);
      });
  }

  return `
<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
        }

        body {
            font-family: ${isRTL ? "'Segoe UI', 'Tahoma', 'Arial', sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"};
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            direction: ${isRTL ? 'rtl' : 'ltr'};
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        .header {
            text-align: ${isRTL ? 'right' : 'left'};
            border-bottom: 3px solid #F13F33;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #F13F33;
            margin: 0;
        }

        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
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

        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .info-section h3 {
            font-size: 18px;
            font-weight: bold;
            color: #F13F33;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }

        .info-section p {
            margin: 8px 0;
            color: #666;
        }

        .services-table, .parts-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .services-table th, .parts-table th {
            background: #F13F33;
            color: white;
            padding: 12px;
            text-align: ${isRTL ? 'right' : 'left'};
            font-weight: bold;
        }

        .services-table td, .parts-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: ${isRTL ? 'right' : 'left'};
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
        }

        .grand-total {
            font-weight: bold;
            font-size: 18px;
            color: #F13F33;
            border-top: 2px solid #F13F33;
            margin-top: 10px;
            padding-top: 10px;
        }

        .notes {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #F13F33;
        }

        .print-button {
            position: fixed;
            top: 20px;
            ${isRTL ? 'left: 20px;' : 'right: 20px;'}
            background: #F13F33;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }

        .print-button:hover {
            background: #d6352a;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">${t.printButton}</button>
    
    ${qrCodeDataUrl ? `
    <div class="qr-code">
        <img src="${qrCodeDataUrl}" alt="ZATCA QR" style="width: 100px; height: 100px;">
        <p style="font-size: 10px; color: #666; margin-top: 5px;">${t.zatcaCompliant}</p>
    </div>
    ` : ''}
    
    <div class="container">
        <div class="header">
            <h1 class="company-name">${t.company}</h1>
            <h2 class="invoice-title">${t.title} #${String(invoice._id || '').slice(-6)}</h2>
        </div>

        <div class="invoice-info">
            <div class="info-section">
                <h3>${t.invoiceNumber}${String(invoice._id || '').slice(-6)}</h3>
                <p><strong>${t.date}:</strong> ${formatDate(invoice.createdAt || Date.now())}</p>
                <p><strong>${t.dueDate}:</strong> ${formatDate(invoice.dueDate || Date.now())}</p>
                <p><strong>${t.status}:</strong> ${invoice.status || (isRTL ? 'معلق' : 'Pending')}</p>
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
                ` : ''}
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
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
                <span>${t.tax}:</span>
                <span>${formatCurrency(tax)}</span>
            </div>
            <div class="total-row grand-total">
                <span>${t.grandTotal}:</span>
                <span>${formatCurrency(grandTotal)}</span>
            </div>
        </div>

        ${invoice.notes ? `
        <div class="notes">
            <h3>${t.notes}</h3>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>${t.generatedOn} ${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
            <p>${t.systemName}</p>
        </div>
    </div>
</body>
</html>`;
}


