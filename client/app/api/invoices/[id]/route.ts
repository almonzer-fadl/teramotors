import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import { Invoice, JobCard, Customer, Vehicle, Service, Part } from '@/lib/models';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 });
    }

    await connectToDatabase();

    const invoice = await Invoice.findById(id)
      .populate('customerId')
      .populate('vehicleId', 'make model year licensePlate');

    if (!invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404 });
    }

    let jobCard: any = null;
    if (invoice.jobCardId) {
      jobCard = await JobCard.findById(invoice.jobCardId)
        .populate('services.serviceId')
        .populate('partsUsed.partId');
    }

    return new Response(JSON.stringify({ invoice, jobCard }), { status: 200 });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch invoice' }), { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Check if user is admin
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 });
    }

    await connectToDatabase();

    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Invoice deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete invoice' }), { status: 500 });
  }
}


