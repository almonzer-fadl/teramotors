import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import Estimate from '@/lib/models/Estimate';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const invoices = await Invoice.find({})
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model licensePlate')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(invoices));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const { estimateId, ...invoiceData } = body;

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Optionally update the estimate status to 'converted' or similar
    if (estimateId) {
      await Estimate.findByIdAndUpdate(estimateId, { status: 'converted' });
    }

    return new Response(JSON.stringify({ success: true, invoice }), { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to create invoice' }), { status: 500 });
  }
}