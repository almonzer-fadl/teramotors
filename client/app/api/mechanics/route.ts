
import { connectToDatabase } from '@/lib/db';
import Mechanic from '@/lib/models/Mechanic';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const mechanics = await Mechanic.find({}).populate('userId', 'firstName lastName');

    return new Response(JSON.stringify(mechanics));
  } catch (error) {
    console.error('Error fetching mechanics:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch mechanics' }), { status: 500 });
  }
}
