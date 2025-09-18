import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const lowStockParts = await Part.find({ $expr: { $lte: ['$stockQuantity', '$minStockLevel'] } });

    return new Response(JSON.stringify(lowStockParts));
  } catch (error) {
    console.error('Error fetching low stock parts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch low stock parts' }), { status: 500 });
  }
}
