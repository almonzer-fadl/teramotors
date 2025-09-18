
import { connectToDatabase } from '@/lib/db';
import Estimate from '@/lib/models/Estimate';
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
    
    const estimate = await Estimate.findById(params.id)
      .populate('customerId', 'firstName lastName email phone')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('services.serviceId', 'name');
    
    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(estimate));
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch estimate' }), { status: 500 });
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
    
    const estimate = await Estimate.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, estimate }));
  } catch (error) {
    console.error('Error updating estimate:', error);
    return new Response(JSON.stringify({ error: 'Failed to update estimate' }), { status: 500 });
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
    
    const estimate = await Estimate.findByIdAndDelete(params.id);

    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete estimate' }), { status: 500 });
  }
}
