import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import { auth } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const { photos } = await request.json();
    
    const updatedJobCard = await JobCard.findByIdAndUpdate(params.id, { photos }, { new: true });

    if (!updatedJobCard) {
      return new Response(JSON.stringify({ error: 'Job card not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, jobCard: updatedJobCard }));
  } catch (error) {
    console.error('Error updating job card photos:', error);
    return new Response(JSON.stringify({ error: 'Failed to update job card photos' }), { status: 500 });
  }
}
