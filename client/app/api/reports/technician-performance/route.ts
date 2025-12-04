import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

// GET /api/reports/technician-performance
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
      
      const invoiceMap = new Map(invoices.map(inv => [inv.jobCardId.toString(), inv.totalAmount]));
      const techPerformance: { [key: string]: { totalRevenue: number; jobsCompleted: number; totalTime: number, mechanicName: string } } = {};

      jobCards.forEach(jc => {
        const mechanicId = jc.mechanicId?._id.toString();
        if (!mechanicId) return;

        if (!techPerformance[mechanicId]) {
          techPerformance[mechanicId] = {
            totalRevenue: 0,
            jobsCompleted: 0,
            totalTime: 0,
            mechanicName: `${(jc.mechanicId as any)?.firstName || ''} ${(jc.mechanicId as any)?.lastName || 'Unknown'}`,
          };
        }

        const revenue = invoiceMap.get(jc._id.toString()) || 0;
        techPerformance[mechanicId].totalRevenue += revenue;
        techPerformance[mechanicId].jobsCompleted += 1;

        if (jc.actualStartTime && jc.actualEndTime) {
            const timeDiff = jc.actualEndTime.getTime() - jc.actualStartTime.getTime();
            techPerformance[mechanicId].totalTime += timeDiff;
        }
      });
      
      const report = Object.entries(techPerformance).map(([mechanicId, data]) => ({
        mechanicId,
        mechanicName: data.mechanicName,
        totalRevenue: data.totalRevenue,
        jobsCompleted: data.jobsCompleted,
        avgJobTime: data.jobsCompleted > 0 ? (data.totalTime / data.jobsCompleted) / (1000 * 60 * 60) : 0, // in hours
      })).sort((a,b) => b.totalRevenue - a.totalRevenue);

      return NextResponse.json(report);

    } catch (error) {
      console.error('Error fetching Technician Performance report:', error);
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
