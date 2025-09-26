import { connectToDatabase } from '@/lib/db';
import Payment from '../../../lib/models/Payment';
import { getServerSession } from "@/lib/auth-server";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const method = searchParams.get('method') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'paymentDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (method) {
      query.paymentMethod = method;
    }

    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalCount = await Payment.countDocuments(query);

    // Get payments with pagination
    const payments = await Payment.find(query)
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
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
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
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      invoiceId,
      amount,
      paymentMethod,
      paymentDate,
      reference,
      notes
    } = body;

    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod || !paymentDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: invoiceId, amount, paymentMethod, paymentDate' 
      }, { status: 400 });
    }

    // Create new payment
    const payment = new Payment({
      invoiceId,
      amount: parseFloat(amount),
      paymentMethod,
      paymentDate: new Date(paymentDate),
      reference: reference || '',
      notes: notes || '',
      status: 'pending'
    });

    await payment.save();

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

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
