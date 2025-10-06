import { connectToDatabase } from '@/lib/db';
import Payment from '@/lib/models/Payment';
import Invoice from '@/lib/models/Invoice';
import { getServerSession } from "@/lib/auth-server";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const { id } = await params;
    const payment = await Payment.findById(id)
      .populate({
        path: 'invoiceId',
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName'
          },
          {
            path: 'vehicleId',
            select: 'make model year licensePlate'
          }
        ]
      });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { status, amount, paymentMethod, reference, notes } = body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment fields
    if (status) payment.status = status;
    if (amount !== undefined) payment.amount = parseFloat(amount);
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (reference !== undefined) payment.reference = reference;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    // If payment is completed, update the invoice status
    if (status === 'completed') {
      await Invoice.findByIdAndUpdate(payment.invoiceId, { 
        status: 'paid',
        paidAt: new Date()
      });
    } else if (status === 'failed' || status === 'refunded') {
      await Invoice.findByIdAndUpdate(payment.invoiceId, { 
        status: 'pending',
        paidAt: null
      });
    }

    // Populate the response
    await payment.populate([
      {
        path: 'invoiceId',
        populate: [
          {
            path: 'customerId',
            select: 'firstName lastName'
          },
          {
            path: 'vehicleId',
            select: 'make model year licensePlate'
          }
        ]
      }
    ]);

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const { id } = await params;
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If payment was completed, reset the invoice status
    if (payment.status === 'completed') {
      await Invoice.findByIdAndUpdate(payment.invoiceId, { 
        status: 'pending',
        paidAt: null
      });
    }

    await Payment.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
