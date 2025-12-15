import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import mongoose from 'mongoose';

// GET /api/reports/accounts-receivable
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const unpaidInvoices = await Invoice.find({
        tenantId,
        status: 'pending', // Invoices that are not fully paid
        dueDate: { $exists: true } // Ensure there is a due date
      }).populate('customerId', 'firstName lastName').lean();

      const report = {
        current: { total: 0, invoices: [] as any[] },
        '1-30': { total: 0, invoices: [] as any[] },
        '31-60': { total: 0, invoices: [] as any[] },
        '61-90': { total: 0, invoices: [] as any[] },
        '91+': { total: 0, invoices: [] as any[] },
        totalOutstanding: 0,
      };

      unpaidInvoices.forEach(invoice => {
        const due = new Date(invoice.dueDate);
        const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        const outstandingAmount = invoice.totalAmount - (invoice.paidAmount || 0);

        if (outstandingAmount <= 0) return; // Skip fully paid invoices marked as pending

        const invoiceInfo = {
          ...invoice,
          outstandingAmount,
          daysOverdue,
        };
        
        report.totalOutstanding += outstandingAmount;

        if (daysOverdue <= 0) {
          report.current.total += outstandingAmount;
          report.current.invoices.push(invoiceInfo);
        } else if (daysOverdue >= 1 && daysOverdue <= 30) {
          report['1-30'].total += outstandingAmount;
          report['1-30'].invoices.push(invoiceInfo);
        } else if (daysOverdue >= 31 && daysOverdue <= 60) {
          report['31-60'].total += outstandingAmount;
          report['31-60'].invoices.push(invoiceInfo);
        } else if (daysOverdue >= 61 && daysOverdue <= 90) {
          report['61-90'].total += outstandingAmount;
          report['61-90'].invoices.push(invoiceInfo);
        } else {
          report['91+'].total += outstandingAmount;
          report['91+'].invoices.push(invoiceInfo);
        }
      });
      
      // Group invoices by customer for the detailed breakdown
      const customerBreakdown = unpaidInvoices.reduce((acc: any, invoice: any) => {
        const customerId = invoice.customerId?._id.toString();
        if (!customerId) return acc;
        
        const outstandingAmount = invoice.totalAmount - (invoice.paidAmount || 0);
        if (outstandingAmount <= 0) return acc;

        if (!acc[customerId]) {
          acc[customerId] = {
            customerName: `${invoice.customerId.firstName} ${invoice.customerId.lastName}`,
            totalOutstanding: 0,
            invoices: []
          };
        }
        
        acc[customerId].totalOutstanding += outstandingAmount;
        acc[customerId].invoices.push({
            invoiceNumber: invoice.invoiceNumber,
            dueDate: invoice.dueDate,
            daysOverdue: Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
            outstandingAmount
        });

        return acc;
      }, {});

      return NextResponse.json({
        summary: {
          current: report.current.total,
          '1-30': report['1-30'].total,
          '31-60': report['31-60'].total,
          '61-90': report['61-90'].total,
          '91+': report['91+'].total,
          totalOutstanding: report.totalOutstanding,
        },
        customers: Object.values(customerBreakdown).sort((a: any, b: any) => b.totalOutstanding - a.totalOutstanding),
      });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
