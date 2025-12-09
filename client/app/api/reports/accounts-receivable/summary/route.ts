import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

// GET /api/reports/accounts-receivable/summary
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const unpaidInvoices = await Invoice.find({
        tenantId,
        status: 'pending',
        dueDate: { $exists: true }
      }).select('totalAmount paidAmount dueDate').lean();

      const summary = {
        current: 0,
        '1-30': 0,
        '31-60': 0,
        '61-90': 0,
        '91+': 0,
        totalOutstanding: 0,
      };

      unpaidInvoices.forEach(invoice => {
        const outstandingAmount = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);
        if (outstandingAmount <= 0) return;

        summary.totalOutstanding += outstandingAmount;
        const daysOverdue = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue <= 0) {
          summary.current += outstandingAmount;
        } else if (daysOverdue <= 30) {
          summary['1-30'] += outstandingAmount;
        } else if (daysOverdue <= 60) {
          summary['31-60'] += outstandingAmount;
        } else if (daysOverdue <= 90) {
          summary['61-90'] += outstandingAmount;
        } else {
          summary['91+'] += outstandingAmount;
        }
      });

      return NextResponse.json(summary);

    } catch (error) {
      console.error('Error fetching A/R Aging summary:', error);
      return NextResponse.json({ error: 'Failed to fetch report summary' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
