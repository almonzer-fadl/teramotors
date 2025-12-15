import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import VehicleInspection from '@/lib/models/VehicleInspection';
import { getServerSession } from "@/lib/auth-server";

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
    const inspection = await VehicleInspection.findById(id)
      .populate({
        path: 'jobCardId',
        populate: [
          { path: 'customerId', select: 'firstName lastName' },
          { path: 'vehicleId', select: 'make model year licensePlate' }
        ]
      })
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('templateId', 'name');

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    const jobCard = (inspection.jobCardId as any);
    if (!jobCard) {
      return NextResponse.json({ error: 'Job card not found for inspection' }, { status: 404 });
    }

    // Get language from query parameter or default to English
    const url = new URL(request.url);
    const language = url.searchParams.get('lang') || 'en';
    const isRTL = language === 'ar';

    // Generate HTML content for PDF
    const htmlContent = generateInspectionHTML(inspection, jobCard, language, isRTL);

    // Sanitize filename to ASCII-only to avoid ByteString errors in headers
    const rawName = `inspection-${jobCard.vehicleId?.licensePlate || 'unknown'}-${new Date(inspection.inspectionDate).toISOString().split('T')[0]}`;
    const safeName = rawName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/[^\x00-\x7F]/g, '') // remove non-ascii
      .replace(/\s+/g, '_')
      .replace(/[^A-Za-z0-9._-]/g, '') || 'inspection';

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${safeName}.html"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generateInspectionHTML(inspection: any, jobCard: any, language: string = 'en', isRTL: boolean = false): string {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  
  // Translation object
  const translations = {
    en: {
      title: "Vehicle Inspection Report",
      company: "TeraMotors Auto Repair",
      printButton: "🖨️ Print PDF",
      vehicleInfo: "Vehicle Information",
      makeModel: "Make & Model",
      year: "Year",
      licensePlate: "License Plate",
      inspectionDate: "Inspection Date",
      mileage: "Mileage",
      overallCondition: "Overall Condition",
      inspectionItems: "Inspection Items",
      itemId: "Item ID",
      category: "Category",
      condition: "Condition",
      recommendations: "Recommendations",
      nextInspectionDue: "Next Inspection Due",
      generatedOn: "Generated on",
      systemName: "TeraMotors Auto Repair Management System",
      noItems: "No items found",
      customer: "Customer",
      mechanic: "Mechanic",
      inspectionDetails: "Inspection Details"
    },
    ar: {
      title: "تقرير فحص المركبة",
      company: "تيرا موتورز لصيانة السيارات",
      printButton: "🖨️ طباعة PDF",
      vehicleInfo: "معلومات المركبة",
      makeModel: "الماركة والنوع",
      year: "السنة",
      licensePlate: "رقم اللوحة",
      inspectionDate: "تاريخ الفحص",
      mileage: "المسافة المقطوعة",
      overallCondition: "الحالة العامة",
      inspectionItems: "عناصر الفحص",
      itemId: "معرف العنصر",
      category: "الفئة",
      condition: "الحالة",
      recommendations: "التوصيات",
      nextInspectionDue: "موعد الفحص التالي",
      generatedOn: "تم الإنشاء في",
      systemName: "نظام إدارة تيرا موتورز لصيانة السيارات",
      noItems: "لم يتم العثور على عناصر",
      customer: "العميل",
      mechanic: "الميكانيكي",
      inspectionDetails: "تفاصيل الفحص"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;
  
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
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
            direction: ${isRTL ? 'rtl' : 'ltr'};
            text-align: ${isRTL ? 'right' : 'left'};
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            ${isRTL ? 'left: 20px;' : 'right: 20px;'}
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #1d4ed8;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 1.1em;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .info-item h3 {
            margin: 0 0 5px 0;
            color: #374151;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-item p {
            margin: 0;
            font-size: 1.1em;
            font-weight: 600;
            color: #111827;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .items-table th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .condition-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .condition-good { background: #d1fae5; color: #065f46; }
        .condition-fair { background: #fef3c7; color: #92400e; }
        .condition-poor { background: #fed7aa; color: #c2410c; }
        .condition-critical { background: #fecaca; color: #991b1b; }
        .priority-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .priority-critical { background: #fecaca; color: #991b1b; }
        .priority-safety { background: #fed7aa; color: #c2410c; }
        .priority-recommended { background: #dbeafe; color: #1e40af; }
        .priority-optional { background: #e5e7eb; color: #374151; }
        .recommendations {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .recommendations h3 {
            color: #92400e;
            margin-top: 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">${t.printButton}</button>
    
    <div class="header">
        <h1>${t.title}</h1>
        <p>${t.company}</p>
    </div>

    <div class="section">
        <h2>${t.vehicleInfo}</h2>
        <div class="info-grid">
            <div class="info-item">
                <h3>${t.makeModel}</h3>
                <p>${jobCard.vehicleId?.make || 'N/A'} ${jobCard.vehicleId?.model || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>${t.year}</h3>
                <p>${jobCard.vehicleId?.year || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>${t.licensePlate}</h3>
                <p>${jobCard.vehicleId?.licensePlate || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>${t.mileage}</h3>
                <p>${inspection.mileage?.toLocaleString() || 'N/A'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>${t.inspectionDetails}</h2>
        <div class="info-grid">
            <div class="info-item">
                <h3>${t.customer}</h3>
                <p>${jobCard.customerId?.firstName || 'N/A'} ${jobCard.customerId?.lastName || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>${t.mechanic}</h3>
                <p>${inspection.mechanicId?.displayName || `${inspection.mechanicId?.firstName || ''} ${inspection.mechanicId?.lastName || ''}`.trim() || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>${t.inspectionDate}</h3>
                <p>${formatDate(inspection.inspectionDate)}</p>
            </div>
            <div class="info-item">
                <h3>${t.overallCondition}</h3>
                <p>${inspection.overallCondition || 'N/A'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>${t.inspectionItems}</h2>
        <table class="items-table">
            <thead>
                <tr>
                    <th>${t.itemId}</th>
                    <th>${t.category}</th>
                    <th>${t.condition}</th>
                </tr>
            </thead>
            <tbody>
                ${inspection.items?.map((item: any, index: number) => `
                <tr>
                    <td><strong>${item.itemId || 'N/A'}</strong></td>
                    <td>${item.category || 'N/A'}</td>
                    <td><span class="condition-badge condition-${item.condition || 'unknown'}">${item.condition || 'N/A'}</span></td>
                </tr>
                `).join('') || `<tr><td colspan="3" style="text-align: center; color: #6b7280;">${t.noItems}</td></tr>`}
            </tbody>
        </table>
    </div>

    ${inspection.recommendations ? `
    <div class="section">
        <div class="recommendations">
            <h3>${t.recommendations}</h3>
            <p>${inspection.recommendations}</p>
        </div>
    </div>
    ` : ''}

    ${inspection.nextInspectionDate ? `
    <div class="section">
        <div class="info-item">
            <h3>${t.nextInspectionDue}</h3>
            <p>${formatDate(inspection.nextInspectionDate)}</p>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>${t.generatedOn} ${new Date().toLocaleString()}</p>
        <p>${t.systemName}</p>
    </div>
</body>
</html>
  `;
}

