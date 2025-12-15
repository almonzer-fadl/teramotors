import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import Part from '@/lib/models/Part';
import InspectionTemplate from '@/lib/models/InspectionTemplate';
import { getServerSession } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse('<html><body><h1>Unauthorized</h1></body></html>', {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    await connectToDatabase();

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'html';

    // Fetch only services that have unique codes
    const servicesWithCodes = await Service.find({
      isActive: true,
      uniqueCode: { $exists: true, $nin: [null, ''] }
    })
      .select('name description category uniqueCode laborRate laborHours partsRequired')
      .sort({ uniqueCode: 1 })
      .lean();

    // Fetch only parts that have unique codes
    const partsWithCodes = await Part.find({
      isActive: true,
      uniqueCode: { $exists: true, $nin: [null, ''] }
    })
      .select('name description category uniqueCode partNumber cost sellingPrice stockQuantity compatibleVehicles')
      .sort({ uniqueCode: 1 })
      .lean();

    // Fetch inspection template items with unique codes
    const templates = await InspectionTemplate.find({ isActive: true })
      .select('name description items')
      .lean();


    const templateItemsWithCodes = templates.flatMap(template =>
      (template.items || [])
        .filter((item: any) => item.uniqueCode && item.uniqueCode.trim() !== '')
        .map((item: any) => ({
          templateName: template.name,
          itemId: item.itemId,
          name: item.name,
          category: item.category || 'No Category',
          uniqueCode: item.uniqueCode
        }))
    );


    if (format === 'json') {
      return NextResponse.json({
        success: true,
        stats: {
          servicesWithCodes: servicesWithCodes.length,
          partsWithCodes: partsWithCodes.length,
          templateItemsWithCodes: templateItemsWithCodes.length
        },
        data: {
          services: servicesWithCodes,
          parts: partsWithCodes,
          templateItems: templateItemsWithCodes
        }
      });
    }

    // Generate HTML
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unique Codes - Services & Parts</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f8f9fa;
      border-bottom: 3px solid #667eea;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
    }
    .stat-number {
      font-size: 2.5em;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 1.8em;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-icon {
      width: 40px;
      height: 40px;
      background: #667eea;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2em;
    }
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .item-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .item-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
      border-color: #667eea;
    }
    .item-code {
      position: absolute;
      top: 15px;
      right: 15px;
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 1.1em;
      font-family: 'Courier New', monospace;
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }
    .item-name {
      font-size: 1.3em;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
      padding-right: 80px;
    }
    .item-category {
      display: inline-block;
      background: #f0f0f0;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.85em;
      color: #666;
      margin-bottom: 10px;
    }
    .item-details {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 0.9em;
    }
    .detail-label {
      color: #666;
      font-weight: 500;
    }
    .detail-value {
      color: #333;
      font-weight: 600;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    .empty-state-icon {
      font-size: 4em;
      margin-bottom: 20px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      border-top: 3px solid #667eea;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔢 Unique Codes System</h1>
      <p>Services & Parts with Unique Identification Codes</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${servicesWithCodes.length}</div>
        <div class="stat-label">Services</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${partsWithCodes.length}</div>
        <div class="stat-label">Parts</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${templateItemsWithCodes.length}</div>
        <div class="stat-label">Template Items</div>
      </div>
    </div>

    <div class="content">
      <!-- Services Section -->
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">🔧</span>
          Services
        </h2>
        ${servicesWithCodes.length > 0 ? `
          <div class="items-grid">
            ${servicesWithCodes.map((service: any) => `
              <div class="item-card">
                <div class="item-code">${service.uniqueCode}</div>
                <div class="item-name">${service.name}</div>
                ${service.category ? `<span class="item-category">${service.category}</span>` : ''}
                <div class="item-details">
                  <div class="detail-row">
                    <span class="detail-label">Labor Rate:</span>
                    <span class="detail-value">${service.laborRate} SAR/hr</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Labor Hours:</span>
                    <span class="detail-value">${service.laborHours} hrs</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Total Cost:</span>
                    <span class="detail-value">${(service.laborRate * service.laborHours).toFixed(2)} SAR</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>No services with unique codes found</p>
          </div>
        `}
      </div>

      <!-- Parts Section -->
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">🔩</span>
          Parts
        </h2>
        ${partsWithCodes.length > 0 ? `
          <div class="items-grid">
            ${partsWithCodes.map((part: any) => `
              <div class="item-card">
                <div class="item-code">${part.uniqueCode}</div>
                <div class="item-name">${part.name}</div>
                ${part.category ? `<span class="item-category">${part.category}</span>` : ''}
                ${part.partNumber ? `<div style="font-size: 0.85em; color: #999; margin-top: 5px;">Part #: ${part.partNumber}</div>` : ''}
                <div class="item-details">
                  <div class="detail-row">
                    <span class="detail-label">Cost:</span>
                    <span class="detail-value">${part.cost?.toFixed(2) || 0} SAR</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Selling Price:</span>
                    <span class="detail-value">${part.sellingPrice?.toFixed(2) || 0} SAR</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Stock:</span>
                    <span class="detail-value">${part.stockQuantity || 0} units</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>No parts with unique codes found</p>
          </div>
        `}
      </div>

      <!-- Template Items Section -->
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">📋</span>
          Inspection Template Items
        </h2>
        ${templateItemsWithCodes.length > 0 ? `
          <div class="items-grid">
            ${templateItemsWithCodes.map((item: any) => `
              <div class="item-card">
                <div class="item-code">${item.uniqueCode}</div>
                <div class="item-name">${item.name}</div>
                ${item.category ? `<span class="item-category">${item.category}</span>` : '<span class="item-category" style="background: #ffe0e0; color: #999;">No Category</span>'}
                <div class="item-details">
                  <div class="detail-row">
                    <span class="detail-label">Template:</span>
                    <span class="detail-value">${item.templateName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Item ID:</span>
                    <span class="detail-value">${item.itemId}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>No inspection template items with unique codes found</p>
            <p style="font-size: 0.9em; margin-top: 10px; color: #999;">
              Add unique codes to your inspection template items to see them here
            </p>
          </div>
        `}
      </div>
    </div>

    <div class="footer">
      <p>Generated on ${new Date().toLocaleString('ar-SA')}</p>
      <p style="margin-top: 5px; font-size: 0.9em;">
        <a href="?format=json" style="color: #667eea; text-decoration: none;">View as JSON</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    return new NextResponse(`
      <html>
        <body>
          <h1>Error</h1>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
