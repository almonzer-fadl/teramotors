
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { getServerSession } from "@/lib/auth-server";
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const categories = await Service.distinct('category');
    
    return new Response(JSON.stringify(categories));
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch service categories' }), { status: 500 });
  }
}
