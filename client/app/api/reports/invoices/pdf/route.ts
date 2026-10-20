import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Invoice } from '@/lib/models';
import Tenant from '@/lib/models/Tenant';
import { getServerSession } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const role = (session.user as any).role;
    if (!['admin', 'finance'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'Tenant ID not found' }), { status: 400 });
    }

    await connectToDatabase();

    const invoices = await Invoice.find({ tenantId })
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .sort({ createdAt: -1 })
      .lean();

    const tenant = await Tenant.findById(tenantId).select('companyInfo').lean();
    const companyName = (tenant as any)?.companyInfo?.name || 'TeraMotor Workshop';

    let totalAmount = 0;
    let totalVat = 0;
    let pendingCount = 0;
    let paidCount = 0;

    const rows = invoices.map((inv: any, idx: number) => {
      const vat = typeof inv?.zatca?.vatAmount === 'number' ? inv.zatca.vatAmount : 0;
      const amount = Number(inv.totalAmount ?? 0);
      totalAmount += amount;
      totalVat += vat;
      if (inv.status === 'paid') paidCount += 1; else pendingCount += 1;

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${String(inv.invoiceNumber ?? '').replace(/[<>&]/g, '')}</td>
          <td>${String(inv.customerId?.firstName ?? '')} ${String(inv.customerId?.lastName ?? '')}</td>
          <td>${String(inv.vehicleId?.year ?? '')} ${String(inv.vehicleId?.make ?? '')} ${String(inv.vehicleId?.model ?? '')}</td>
          <td>${String(inv.vehicleId?.licensePlate ?? '')}</td>
          <td>${inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : ''}</td>
          <td>${inv.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}</td>
          <td>${vat.toFixed(2)}</td>
          <td>${amount.toFixed(2)}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<title>تقرير جميع الفواتير</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; margin: 24px; color: #111; background: #fff; }
  h1 { font-size: 22px; margin: 0 0 4px 0; }
  .sub { color: #555; font-size: 13px; margin-bottom: 16px; }
  .summary { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 20px; }
  .summary div { background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 10px 16px; }
  .summary b { font-size: 18px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #999; padding: 6px 8px; text-align: center; }
  th { background: #222; color: #fff; }
  tr:nth-child(even) td { background: #f7f7f7; }
  .print-btn { position: fixed; top: 12px; left: 12px; background: #111; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-size: 14px; }
  @media print {
    .print-btn { display: none; }
    body { margin: 0; }
  }
  @page { size: A4 landscape; margin: 12mm; }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">طباعة / حفظ PDF</button>
<h1>${companyName} - تقرير جميع الفواتير</h1>
<div class="sub">تاريخ التقرير: ${new Date().toLocaleDateString('en-GB')} - عدد الفواتير: ${invoices.length}</div>
<div class="summary">
  <div>إجمالي المبالغ<br><b>${totalAmount.toFixed(2)} ر.س</b></div>
  <div>إجمالي الضريبة<br><b>${totalVat.toFixed(2)} ر.س</b></div>
  <div>فواتير مدفوعة<br><b>${paidCount}</b></div>
  <div>فواتير غير مدفوعة<br><b>${pendingCount}</b></div>
</div>
<table>
<thead>
<tr>
  <th>#</th><th>رقم الفاتورة</th><th>العميل</th><th>المركبة</th><th>اللوحة</th><th>التاريخ</th><th>الحالة</th><th>الضريبة</th><th>الإجمالي (ر.س)</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 400); }</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate PDF report' }), { status: 500 });
  }
}
