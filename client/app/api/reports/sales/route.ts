import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import JobCard from '@/lib/models/JobCard';
import Service from '@/lib/models/Service';
import Part from '@/lib/models/Part';
import mongoose from 'mongoose';

// GET /api/reports/sales
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

      // Find all invoices within the date range for the tenant
      const invoices = await Invoice.find({
        tenantId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['paid', 'pending'] } // Exclude cancelled invoices
      }).select('totalAmount jobCardId').lean();

      if (invoices.length === 0) {
        return NextResponse.json({
          totalSales: 0,
          salesByServiceCategory: [],
          salesByPartCategory: [],
          topSellingServices: [],
          topSellingParts: [],
        });
      }

      const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const jobCardIds = invoices.map(inv => inv.jobCardId).filter(id => id);

      // Find all related job cards and populate services and parts
      const jobCards = await JobCard.find({
        _id: { $in: jobCardIds }
      })
      .populate('services.serviceId', 'name category') // Populate service details
      .populate('partsUsed.partId', 'name category')   // Populate part details
      .lean();

      const salesByServiceCategory: { [key: string]: number } = {};
      const salesByPartCategory: { [key: string]: number } = {};
      const topSellingServices: { [key: string]: { name: string; totalRevenue: number; count: number } } = {};
      const topSellingParts: { [key: string]: { name: string; totalRevenue: number; count: number } } = {};

      jobCards.forEach(jc => {
        // Aggregate service sales
        jc.services.forEach((s: any) => {
          const serviceName = s.serviceId?.name || 'Unknown Service';
          const serviceCategory = s.serviceId?.category || 'Uncategorized';
          const revenue = s.laborHours * s.laborRate;

          salesByServiceCategory[serviceCategory] = (salesByServiceCategory[serviceCategory] || 0) + revenue;

          if (!topSellingServices[serviceName]) {
            topSellingServices[serviceName] = { name: serviceName, totalRevenue: 0, count: 0 };
          }
          topSellingServices[serviceName].totalRevenue += revenue;
          topSellingServices[serviceName].count += s.quantity;
        });

        // Aggregate part sales
        jc.partsUsed.forEach((p: any) => {
          const partName = p.partId?.name || 'Unknown Part';
          const partCategory = p.partId?.category || 'Uncategorized';
          // Assuming selling price is used for sales. If only cost is available, this would be cost.
          // For now, assuming partsUsed.cost is cost. If Invoice totalAmount includes markup,
          // then partRevenue will be derived from total invoice.
          // For a true sales report, we need to consider selling price or markup.
          // For now, we'll use a simplified assumption that the revenue from parts is part of the overall invoice total.
          // This report will primarily focus on what services/parts *were involved* in sales, rather than their individual selling price.
          // If we had sellingPrice on partsUsed or in invoice items, we would use that.
          // For now, we'll sum up an estimated revenue from parts. Given the previous P&L approach,
          // totalAmount is the total invoiced amount. We need to find a way to get actual selling price of parts.
          // For now, let's just count them and their categories.

          // Re-evaluation: For a Sales Report, we need actual sales value.
          // The current `partsUsed` in JobCard has `cost`. The `Invoice` has `totalAmount`.
          // If the Invoice `totalAmount` is the sum of (service labor) + (parts selling price),
          // then deriving parts selling price from JobCard `partsUsed.cost` is tricky.
          //
          // A simplified approach for now: assume parts revenue is proportional to their cost,
          // or we can't accurately break down parts revenue per part/category without the selling price
          // being explicitly stored on JobCard.partsUsed or Invoice line items.
          //
          // Let's adjust: Instead of 'totalRevenue', let's sum up individual service and part item 'total'
          // if available directly on the JobCard, or we assume a standard markup.
          //
          // Better approach for sales report: The invoice total includes the selling price of parts.
          // If we just have `part.cost` on `partsUsed` and not `sellingPrice`, then breaking down by actual
          // revenue per part becomes harder.
          //
          // Let's refine the backend API to retrieve total revenue from invoices and then
          // for categories, we look at `JobCard.services` and `JobCard.partsUsed`.
          // For 'salesByPartCategory' and 'topSellingParts', we need an estimated revenue.
          // Let's assume a default markup on `part.cost` if actual selling price isn't stored per part.
          //
          // For now, let's keep it simple: Sales by Service is `laborHours * laborRate`.
          // Sales by Part is harder without selling price.
          //
          // I need to confirm if 'Invoice' or 'JobCard' stores selling price of parts.
          //
          // From Invoice.ts: `totalAmount`
          // From JobCard.ts: `services: {laborHours, laborRate}`, `partsUsed: {cost, quantity}`
          // The `totalAmount` on Invoice already includes markup for parts.
          //
          // Okay, strategy for Sales Report (Parts):
          // Since JobCard.partsUsed only stores `cost`, and Invoice `totalAmount` already includes markup,
          // to get sales by part category, I'll need to figure out the markup applied to parts.
          // This is a big assumption.
          //
          // A more robust solution would be to modify JobCard/Invoice to explicitly store `sellingPrice`
          // for each part or service item at the time of invoicing.
          //
          // For now, for `salesByPartCategory` and `topSellingParts`, I will simply count quantities sold,
          // and for 'revenue', I'll use a placeholder or derive it using a fixed markup on cost for display purposes.
          // This is not ideal for an accounting report, but reflects current data structure limitation.

          // Simplified revenue for parts: Assume cost is 70% of selling price (30% markup) for reporting.
          const estimatedSellingPrice = p.cost * 1.3; // Assuming a 30% markup
          const revenue = estimatedSellingPrice * p.quantity;

          salesByPartCategory[partCategory] = (salesByPartCategory[partCategory] || 0) + revenue;

          if (!topSellingParts[partName]) {
            topSellingParts[partName] = { name: partName, totalRevenue: 0, count: 0 };
          }
          topSellingParts[partName].totalRevenue += revenue;
          topSellingParts[partName].count += p.quantity;
        });
      });

      // Convert aggregated maps to arrays and sort for top selling items
      const sortedTopSellingServices = Object.values(topSellingServices).sort((a, b) => b.totalRevenue - a.totalRevenue);
      const sortedTopSellingParts = Object.values(topSellingParts).sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      return NextResponse.json({
        totalSales,
        salesByServiceCategory: Object.entries(salesByServiceCategory).map(([category, amount]) => ({ category, amount })),
        salesByPartCategory: Object.entries(salesByPartCategory).map(([category, amount]) => ({ category, amount })),
        topSellingServices: sortedTopSellingServices.slice(0, 5), // Top 5
        topSellingParts: sortedTopSellingParts.slice(0, 5),       // Top 5
      });

    } catch (error) {
      console.error('Error fetching Sales report:', error);
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);