import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Estimate from '@/lib/models/Estimate';
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

    const estimate = await Estimate.findById(id)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('inspectionId', 'inspectionDate overallCondition')
      .populate('services.serviceId', 'name')
      .populate('parts.partId', 'name partNumber');

    if (!estimate) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }

    // Generate HTML content for PDF
    const htmlContent = generateEstimateHTML(estimate);

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="estimate-${estimate._id.toString()}-${new Date().toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateEstimateHTML(estimate: any): string {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estimate Report</title>
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
            background: #F13F33;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        }

        .print-button:hover {
            background: #E03A2F;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #F13F33;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #F13F33;
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
            color: #F13F33;
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
            border-left: 4px solid #F13F33;
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
            background: #F13F33;
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
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-rejected { background: #fecaca; color: #991b1b; }
        .summary {
            background: #f8fafc;
            border: 2px solid #F13F33;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .summary h3 {
            color: #F13F33;
            margin-top: 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 1.1em;
        }
        .summary-total {
            font-size: 1.3em;
            font-weight: bold;
            color: #F13F33;
            border-top: 2px solid #F13F33;
            padding-top: 10px;
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
        <h1>Repair Estimate</h1>
        <p>TeraMotors Auto Repair</p>
    </div>

    <div class="section">
        <h2>Estimate Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <h3>Estimate Number</h3>
                <p>#${estimate._id.toString().slice(-8)}</p>
            </div>
            <div class="info-item">
                <h3>Status</h3>
                <p><span class="status-badge status-${estimate.status}">${estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}</span></p>
            </div>
            <div class="info-item">
                <h3>Valid Until</h3>
                <p>${formatDate(estimate.validUntil)}</p>
            </div>
            <div class="info-item">
                <h3>Created Date</h3>
                <p>${formatDate(estimate.createdAt)}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Customer & Vehicle Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <h3>Customer</h3>
                <p>${estimate.customerId?.firstName || 'N/A'} ${estimate.customerId?.lastName || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>Vehicle</h3>
                <p>${estimate.vehicleId?.year || 'N/A'} ${estimate.vehicleId?.make || 'N/A'} ${estimate.vehicleId?.model || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>License Plate</h3>
                <p>${estimate.vehicleId?.licensePlate || 'N/A'}</p>
            </div>
            <div class="info-item">
                <h3>Mechanic</h3>
                <p>${estimate.mechanicId?.displayName || `${estimate.mechanicId?.firstName || ''} ${estimate.mechanicId?.lastName || ''}`.trim() || 'N/A'}</p>
            </div>
        </div>
    </div>

    ${estimate.inspectionId ? `
    <div class="section">
        <h2>Inspection Details</h2>
        <div class="info-grid">
            <div class="info-item">
                <h3>Inspection Date</h3>
                <p>${formatDate(estimate.inspectionId.inspectionDate)}</p>
            </div>
            <div class="info-item">
                <h3>Overall Condition</h3>
                <p>${estimate.inspectionId.overallCondition || 'N/A'}</p>
            </div>
        </div>
    </div>
    ` : ''}

    ${estimate.services && estimate.services.length > 0 ? `
    <div class="section">
        <h2>Services Required</h2>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Quantity</th>
                    <th>Labor Cost</th>
                    <th>Parts Cost</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${estimate.services.map((service: any, index: number) => `
                <tr>
                    <td><strong>${service.name || 'N/A'}</strong></td>
                    <td>${service.quantity || 1}</td>
                    <td>${formatCurrency(service.laborCost || 0)}</td>
                    <td>${formatCurrency(service.partsCost || 0)}</td>
                    <td><strong>${formatCurrency(service.totalCost || 0)}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${estimate.parts && estimate.parts.length > 0 ? `
    <div class="section">
        <h2>Parts Required</h2>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Part Name</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${estimate.parts.map((part: any, index: number) => `
                <tr>
                    <td><strong>${part.name || 'N/A'}</strong></td>
                    <td>${part.quantity || 1}</td>
                    <td>${formatCurrency(part.unitCost || 0)}</td>
                    <td><strong>${formatCurrency(part.totalCost || 0)}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <div class="summary">
            <h3>Estimate Summary</h3>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(estimate.subtotal || 0)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (15%):</span>
                <span>${formatCurrency(estimate.tax || 0)}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>${formatCurrency(estimate.total || 0)}</span>
            </div>
        </div>
    </div>

    ${estimate.notes ? `
    <div class="section">
        <h2>Notes</h2>
        <p>${estimate.notes}</p>
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