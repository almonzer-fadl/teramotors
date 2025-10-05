import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'name';
    const direction = searchParams.get('direction') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = { isActive: true };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { partNumber: searchRegex },
        { manufacturer: searchRegex },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const sortOptions: { [key: string]: any } = {};
    sortOptions[sort] = direction;

    // Get total count for pagination
    const totalCount = await Part.countDocuments(query);

    const parts = await Part.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return new Response(JSON.stringify({
      parts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    }));
  } catch (error) {
    console.error('Error fetching parts:', error);
    // Return empty array when database is unavailable
    return new Response(JSON.stringify({
      parts: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    }));
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    // Handle empty partNumber - set to undefined if empty string
    if (body.partNumber === '') {
      body.partNumber = undefined;
    }
    
    const part = new Part(body);

    await part.save();

    return new Response(JSON.stringify({ success: true, part }), { status: 201 });
  } catch (error) {
    console.error('Error creating part:', error);
    return new Response(JSON.stringify({ error: 'Failed to create part' }), { status: 500 });
  }
}