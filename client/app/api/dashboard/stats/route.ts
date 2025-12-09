export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import Appointment from '@/lib/models/Appointment';
import JobCard from '@/lib/models/JobCard';
import Part from '@/lib/models/Part';
import Invoice from '@/lib/models/Invoice';
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/dashboard/stats - Get dashboard stats for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all stats in parallel with tenant filter
    const [
      totalCustomers,
      totalVehicles,
      pendingAppointments,
      activeJobCards,
      monthlyRevenue,
      lastMonthRevenue,
      avgJobTime,
      lowStockParts,
    ] = await Promise.all([
      Customer.countDocuments({ tenantId, isActive: true }),
      Vehicle.countDocuments({ tenantId, isActive: true }),
      Appointment.countDocuments({
        tenantId,
        status: 'scheduled',
        appointmentDate: { $gte: now },
      }),
      JobCard.countDocuments({
        tenantId,
        status: { $in: ['pending', 'in-progress'] },
      }),
      Invoice.aggregate([
        {
          $match: {
            tenantId,
            status: 'paid',
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),
      Invoice.aggregate([
        {
          $match: {
            tenantId,
            status: 'paid',
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),
      JobCard.aggregate([
        {
          $match: {
            tenantId,
            status: 'completed',
            actualStartTime: { $exists: true },
            actualEndTime: { $exists: true },
          },
        },
        {
          $addFields: {
            durationHours: {
              $divide: [
                { $subtract: ['$actualEndTime', '$actualStartTime'] },
                3600000, // Convert milliseconds to hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$durationHours' },
          },
        },
      ]),
      Part.countDocuments({ tenantId, isLowStock: true }),
    ]);

    // Calculate revenue growth
    const currentRevenue = monthlyRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Calculate average job time
    const avgJobTimeHours = avgJobTime[0]?.avgDuration || 0;

    return NextResponse.json({
      totalCustomers,
      totalVehicles,
      pendingAppointments,
      activeJobCards,
      monthlyRevenue: currentRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      avgJobTime: Math.round(avgJobTimeHours * 100) / 100,
      lowStockParts,
    });
  },
  { requireTenant: true }
);
