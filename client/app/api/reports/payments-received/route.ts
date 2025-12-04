import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Payment from '@/lib/models/Payment';

// GET /api/reports/payments-received
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

      const payments = await Payment.find({
        tenantId,
        paymentDate: { $gte: startDate, $lte: endDate },
        status: 'completed' // Only count completed payments
      }).populate({
        path: 'invoiceId',
        select: 'invoiceNumber customerId',
        populate: {
            path: 'customerId',
            select: 'firstName lastName'
        }
      }).lean();

      let totalPaymentsReceived = 0;
      const paymentsByMethod: { [key: string]: number } = {};

      payments.forEach(payment => {
        totalPaymentsReceived += payment.amount;
        paymentsByMethod[payment.paymentMethod] = (paymentsByMethod[payment.paymentMethod] || 0) + payment.amount;
      });

      return NextResponse.json({
        totalPaymentsReceived,
        paymentsByMethod: Object.entries(paymentsByMethod).map(([method, amount]) => ({ method, amount })),
        paymentCount: payments.length,
        payments,
      });

    } catch (error) {
      console.error('Error fetching Payments Received report:', error);
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
