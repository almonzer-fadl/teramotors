import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import Invoice from '@/lib/models/Invoice';

// GET /api/reports/technician-performance/summary
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
      const jobCards = await JobCard.find({
        tenantId,
        status: 'completed',
        mechanicId: { $exists: true },
        actualEndTime: { $gte: startDate, $lte: endDate }
      }).populate('mechanicId', 'firstName lastName').lean();

      const invoices = await Invoice.find({
        tenantId,
        jobCardId: { $in: jobCards.map(jc => jc._id) }
      }).select('jobCardId totalAmount').lean();
      
      const invoiceMap = new Map(
        invoices
          .filter(inv => inv.jobCardId)
          .map(inv => [
            (inv.jobCardId as unknown as { toString(): string }).toString(),
            Number(inv.totalAmount ?? 0),
          ])
      );
      const techPerformance: { [key: string]: { totalRevenue: number; mechanicName: string } } = {};

      jobCards.forEach(jc => {
        const mechanicId = jc.mechanicId?._id.toString();
        if (!mechanicId) return;

        if (!techPerformance[mechanicId]) {
          techPerformance[mechanicId] = {
            totalRevenue: 0,
            mechanicName: `${(jc.mechanicId as any)?.firstName || ''} ${(jc.mechanicId as any)?.lastName || 'Unknown'}`,
          };
        }

        const revenue = invoiceMap.get(jc._id.toString()) || 0;
        techPerformance[mechanicId].totalRevenue += revenue;
      });
      
      const report = Object.entries(techPerformance).map(([mechanicId, data]) => ({
        mechanicId,
        mechanicName: data.mechanicName,
        totalRevenue: data.totalRevenue,
      })).sort((a,b) => b.totalRevenue - a.totalRevenue).slice(0,3); // Top 3

      return NextResponse.json(report);

    } catch (error) {
      console.error('Error fetching Technician Performance summary:', error);
      return NextResponse.json({ error: 'Failed to fetch report summary' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
