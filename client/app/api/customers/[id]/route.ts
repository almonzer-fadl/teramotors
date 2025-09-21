import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const customer = await Customer.findById(params.id)
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const customer = await Customer.findByIdAndUpdate(
      params.id,
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    // Check if customer has vehicles
    const vehicles = await Vehicle.find({ customerId: params.id });
    if (vehicles.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete customer with existing vehicles. Please remove vehicles first.' 
      }), { status: 400 });
    }

    const customer = await Customer.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting customer:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete customer' }), { status: 500 });
  }
}