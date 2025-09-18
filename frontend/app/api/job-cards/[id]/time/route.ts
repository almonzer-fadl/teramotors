import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import { auth } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const { action } = await request.json();
    
    let updatedJobCard;

    if (action === 'start') {
      updatedJobCard = await JobCard.findByIdAndUpdate(params.id, { actualStartTime: new Date() }, { new: true });
    } else if (action === 'end') {
      updatedJobCard = await JobCard.findByIdAndUpdate(params.id, { actualEndTime: new Date() }, { new: true });
    }

    if (!updatedJobCard) {
      return new Response(JSON.stringify({ error: 'Job card not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, jobCard: updatedJobCard }));
  } catch (error) {
    console.error('Error updating job card time:', error);
    return new Response(JSON.stringify({ error: 'Failed to update job card time' }), { status: 500 });
  }
}
