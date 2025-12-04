import { connectToDatabase } from '@/lib/db';
import Payment from '@/lib/models/Payment';
import { Invoice } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/payments/[id] - Get a single payment by ID
export const GET = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const { id } = params;
    await connectToDatabase();

    const payment = await Payment.findOne({ _id: id, tenantId })
      .populate({
        path: 'invoiceId',
        select: 'invoiceNumber totalAmount customerId vehicleId',
        populate: [
          { path: 'customerId', select: 'firstName lastName' },
          { path: 'vehicleId', select: 'make model year licensePlate' },
        ],
      });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// PUT /api/payments/[id] - Update a single payment
export const PUT = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const { id } = params;
    await connectToDatabase();

    const body = await req.json();
    const { invoiceId, amount, paymentMethod, paymentDate, reference, notes, status } = body;

    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod || !paymentDate || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate invoice belongs to tenant
    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found or does not belong to your organization' }, { status: 400 });
    }

    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: id, tenantId },
      {
        invoiceId,
        customerId: invoice.customerId,
        amount: parseFloat(amount),
        paymentMethod,
        paymentDate: new Date(paymentDate),
        reference: reference || '',
        notes: notes || '',
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment: updatedPayment });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// DELETE /api/payments/[id] - Delete a single payment
export const DELETE = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const { id } = params;
    await connectToDatabase();

    const deletedPayment = await Payment.findOneAndDelete({ _id: id, tenantId });

    if (!deletedPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Payment deleted successfully' });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);