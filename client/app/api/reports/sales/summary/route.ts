import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import JobCard from '@/lib/models/JobCard';

// GET /api/reports/sales/summary
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
          totalSales: 0,
          salesByServiceCategory: [],
        });
      }

      const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const jobCardIds = invoices.map(inv => inv.jobCardId).filter(id => id);

      const jobCards = await JobCard.find({
        _id: { $in: jobCardIds }
      })
      .populate('services.serviceId', 'name category')
      .lean();

      const salesByServiceCategory: { [key: string]: number } = {};

      jobCards.forEach(jc => {
        jc.services.forEach((s: any) => {
          const serviceCategory = s.serviceId?.category || 'Uncategorized';
          const revenue = s.laborHours * s.laborRate;
          salesByServiceCategory[serviceCategory] = (salesByServiceCategory[serviceCategory] || 0) + revenue;
        });
      });

      const sortedServiceCategories = Object.entries(salesByServiceCategory)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3); // Top 3 service categories

      return NextResponse.json({
        totalSales,
        salesByServiceCategory: sortedServiceCategories,
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
