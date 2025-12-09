import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import JobCard from '@/lib/models/JobCard';

// GET /api/reports/profit-and-loss/summary
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
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
    } else {
      // Default to last 30 days if no date range is provided
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
      }).select('totalAmount jobCardId').lean();

      if (invoices.length === 0) {
        return NextResponse.json({
          totalRevenue: 0,
          totalCogs: 0,
          grossProfit: 0,
        });
      }

      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const jobCardIds = invoices.map(inv => inv.jobCardId).filter(id => id);

      const jobCards = await JobCard.find({
        _id: { $in: jobCardIds }
      }).select('partsUsed').lean();
      
      let totalCogs = 0;

      jobCards.forEach(jc => {
        if (jc.partsUsed && jc.partsUsed.length > 0) {
          const cogsForJob = jc.partsUsed.reduce((sum, part) => sum + (part.quantity * part.cost), 0);
          totalCogs += cogsForJob;
        }
      });
      
      const grossProfit = totalRevenue - totalCogs;

      return NextResponse.json({
        totalRevenue,
        totalCogs,
        grossProfit,
      });

    } catch (error) {
      console.error('Error fetching P&L summary report:', error);
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
