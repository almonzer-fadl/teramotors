import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

// GET /api/reports/vat/summary
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    let startDate: Date;
    let endDate: Date;

    if (fromParam && toParam) {
      startDate = new Date(fromParam);
      endDate = new Date(toParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    try {
      const invoices = await Invoice.find({
        tenantId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['paid', 'pending'] }
      }).select('zatca.vatAmount').lean();

      let totalVatCollected = 0;

      invoices.forEach(invoice => {
        totalVatCollected += invoice.zatca?.vatAmount || 0;
      });

      return NextResponse.json({
        totalVatCollected,
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch report summary' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
