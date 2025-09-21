import { connectToDatabase } from '@/lib/db';
import Estimate from '@/lib/models/Estimate';
import { auth } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const { status } = await request.json();
    
    const updatedEstimate = await Estimate.findByIdAndUpdate(params.id, { status }, { new: true });

    if (!updatedEstimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, estimate: updatedEstimate }));
  } catch (error) {
    console.error('Error updating estimate status:', error);
    return new Response(JSON.stringify({ error: 'Failed to update estimate status' }), { status: 500 });
  }
}
