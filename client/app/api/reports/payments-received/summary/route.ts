import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Payment from '@/lib/models/Payment';

// GET /api/reports/payments-received/summary
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
      const payments = await Payment.find({
        tenantId,
        paymentDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }).select('amount').lean();

      let totalPaymentsReceived = 0;
      payments.forEach(payment => {
        totalPaymentsReceived += payment.amount;
      });

      return NextResponse.json({
        totalPaymentsReceived,
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch report summary' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
