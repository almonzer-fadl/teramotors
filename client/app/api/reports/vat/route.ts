import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

// GET /api/reports/vat
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ error: 'Date range parameters (from, to) are required.' }, { status: 400 });
    }

    try {
      const startDate = new Date(from);
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999); 

      const invoices = await Invoice.find({
        tenantId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['paid', 'pending'] }
      }).select('invoiceNumber createdAt totalAmount zatca.vatAmount').lean();

      let totalVatCollected = 0;
      let totalSalesWithoutVat = 0;

      invoices.forEach(invoice => {
        const vatAmount = invoice.zatca?.vatAmount || 0;
        totalVatCollected += vatAmount;
        totalSalesWithoutVat += (invoice.totalAmount - vatAmount);
      });

      return NextResponse.json({
        totalVatCollected,
        totalSalesWithoutVat,
        invoiceCount: invoices.length,
        invoices: invoices.map(inv => ({
            invoiceNumber: inv.invoiceNumber,
            date: inv.createdAt,
            totalAmount: inv.totalAmount,
            vatAmount: inv.zatca?.vatAmount || 0
        }))
      });

    } catch (error) {
      console.error('Error fetching VAT report:', error);
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
