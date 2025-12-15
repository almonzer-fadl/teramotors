import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import JobCard from '@/lib/models/JobCard';
import mongoose from 'mongoose';

// GET /api/reports/profit-and-loss
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
      endDate.setHours(23, 59, 59, 999); // Include the entire end day

      // 1. Find all invoices within the date range for the tenant
      const invoices = await Invoice.find({
        tenantId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['paid', 'pending'] } // Exclude cancelled invoices
      }).select('totalAmount jobCardId').lean();

      if (invoices.length === 0) {
        return NextResponse.json({
          totalRevenue: 0,
          totalCogs: 0,
          grossProfit: 0,
          serviceRevenue: 0,
          partsRevenue: 0,
        });
      }

      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const jobCardIds = invoices.map(inv => inv.jobCardId).filter(id => id);

      // 2. Find all related job cards
      const jobCards = await JobCard.find({
        _id: { $in: jobCardIds }
      }).select('services partsUsed').lean();
      
      let totalCogs = 0;
      let serviceRevenue = 0;

      jobCards.forEach(jc => {
        // Calculate Cost of Goods Sold from parts used
        if (jc.partsUsed && jc.partsUsed.length > 0) {
          const cogsForJob = jc.partsUsed.reduce((sum: number, part: any) => sum + (part.quantity * part.cost), 0);
          totalCogs += cogsForJob;
        }
        
        // Calculate service revenue from services performed
        if (jc.services && jc.services.length > 0) {
            const serviceRevenueForJob = jc.services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
            serviceRevenue += serviceRevenueForJob;
        }
      });
      
      // Approximate parts revenue
      // Note: This is an approximation as it doesn't isolate discounts/taxes applied to parts vs services.
      const partsRevenue = totalRevenue - serviceRevenue;
      const grossProfit = totalRevenue - totalCogs;

      return NextResponse.json({
        totalRevenue,
        totalCogs,
        grossProfit,
        serviceRevenue,
        partsRevenue,
        invoiceCount: invoices.length,
        jobCardCount: jobCards.length
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
