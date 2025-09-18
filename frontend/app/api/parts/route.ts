import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'name';
    const direction = searchParams.get('direction') || 'asc';

    let query: any = { isActive: true };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { partNumber: searchRegex },
        { manufacturer: searchRegex },
      ];
    }

    const sortOptions: { [key: string]: any } = {};
    sortOptions[sort] = direction;

    const parts = await Part.find(query).sort(sortOptions);

    return new Response(JSON.stringify(parts));
  } catch (error) {
    console.error('Error fetching parts:', error);
    // Return empty array when database is unavailable
    return new Response(JSON.stringify([]));
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    const part = new Part(body);

    await part.save();

    return new Response(JSON.stringify({ success: true, part }), { status: 201 });
  } catch (error) {
    console.error('Error creating part:', error);
    return new Response(JSON.stringify({ error: 'Failed to create part' }), { status: 500 });
  }
}