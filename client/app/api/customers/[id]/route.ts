import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import { getServerSession } from "@/lib/auth-server";

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

    await connectToDatabase();
    
    const customer = await Customer.findById(id)
      .populate('vehicles');
    
    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(customer));
  } catch (error) {
    console.error('Error fetching customer:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch customer' }), { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        emergencyContact: body.emergencyContact,
        notes: body.notes,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, customer }));
  } catch (error) {
    console.error('Error updating customer:', error);
    return new Response(JSON.stringify({ error: 'Failed to update customer' }), { status: 500 });
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

    // Hard delete any vehicles belonging to this customer to avoid 400s
    await Vehicle.deleteMany({ customerId: id });

    // Hard delete the customer
    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting customer:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete customer' }), { status: 500 });
  }
}
