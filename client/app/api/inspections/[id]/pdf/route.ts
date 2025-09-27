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
      .populate('vehicleId', 'make model year licensePlate')
      .populate('customerId', 'firstName lastName')
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('templateId', 'name');

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    // Generate HTML content for PDF
    const htmlContent = generateInspectionHTML(inspection);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="inspection-${(inspection.vehicleId as any)?.licensePlate || 'unknown'}-${new Date(inspection.inspectionDate).toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generateInspectionHTML(inspection: any): string {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inspection Report</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
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
    <button class="print-button no-print" onclick="window.print()">🖨️ Print PDF</button>
    
    <div class="header">
        <h1>Vehicle Inspection Report</h1>
        <p>TeraMotors Auto Repair</p>
    </div>

    <div class="section">
        <h2>Vehicle Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <h3>Make & Model</h3>
                <p>${inspection.vehicleId?.make || 'N/A'} ${inspection.vehicleId?.model || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>Year</h3>
                <p>${inspection.vehicleId?.year || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>License Plate</h3>
                <p>${inspection.vehicleId?.licensePlate || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>Mileage</h3>
                <p>${inspection.mileage?.toLocaleString() || 'N/A'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Inspection Details</h2>
        <div class="info-grid">
            <div class="info-item">
                <h3>Customer</h3>
                <p>${inspection.customerId?.firstName || 'N/A'} ${inspection.customerId?.lastName || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>Mechanic</h3>
                <p>${inspection.mechanicId?.displayName || `${inspection.mechanicId?.firstName || ''} ${inspection.mechanicId?.lastName || ''}`.trim() || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>Inspection Date</h3>
                <p>${formatDate(inspection.inspectionDate)}</p>
            </div>
            <div class="info-item">
                <h3>Overall Condition</h3>
                <p>${inspection.overallCondition || 'N/A'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Inspection Items</h2>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item ID</th>
                    <th>Category</th>
                    <th>Condition</th>
                </tr>
            </thead>
            <tbody>
                ${inspection.items?.map((item: any, index: number) => `
                <tr>
                    <td><strong>${item.itemId || 'N/A'}</strong></td>
                    <td>${item.category || 'N/A'}</td>
                    <td><span class="condition-badge condition-${item.condition || 'unknown'}">${item.condition || 'N/A'}</span></td>
                </tr>
                `).join('') || '<tr><td colspan="3" style="text-align: center; color: #6b7280;">No items found</td></tr>'}
            </tbody>
        </table>
    </div>

    ${inspection.recommendations ? `
    <div class="section">
        <div class="recommendations">
            <h3>Recommendations</h3>
            <p>${inspection.recommendations}</p>
        </div>
    </div>
    ` : ''}

    ${inspection.nextInspectionDate ? `
    <div class="section">
        <div class="info-item">
            <h3>Next Inspection Due</h3>
            <p>${formatDate(inspection.nextInspectionDate)}</p>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>TeraMotors Auto Repair Management System</p>
    </div>
</body>
</html>
  `;
}

