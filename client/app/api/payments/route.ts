import { connectToDatabase } from '@/lib/db';
import Payment from '../../../lib/models/Payment';
import { Invoice } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/payments - List payments for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const method = searchParams.get('method') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'paymentDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with tenant filter
    const query: Record<string, unknown> = { tenantId };

    if (status) {
      query.status = status;
    }

    if (method) {
      query.paymentMethod = method;
    }

    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const totalCount = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate({
        path: 'invoiceId',
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName',
          },
          {
            path: 'vehicleId',
            select: 'make model year licensePlate',
          },
        ],
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// POST /api/payments - Create payment for tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const body = await req.json();
    const { invoiceId, amount, paymentMethod, paymentDate, reference, notes } = body;

    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod || !paymentDate) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceId, amount, paymentMethod, paymentDate' },
        { status: 400 }
      );
    }

    // Validate invoice belongs to tenant
    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId });
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or does not belong to your organization' },
        { status: 400 }
      );
    }

    // Create new payment
    const payment = new Payment({
      tenantId, // Always set tenantId from auth context
      invoiceId,
      customerId: invoice.customerId, // Add customerId from the invoice
      paymentNumber: `PAY-${Date.now()}`, // Generate a unique payment number
      amount: parseFloat(amount),
      paymentMethod,
      paymentDate: new Date(paymentDate),
      reference: reference || '',
      notes: notes || '',
      status: 'pending',
    });

    await payment.save();

    await payment.populate([
      {
        path: 'invoiceId',
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName',
          },
          {
            path: 'vehicleId',
            select: 'make model year licensePlate',
          },
        ],
      },
    ]);

    return NextResponse.json(payment, { status: 201 });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
