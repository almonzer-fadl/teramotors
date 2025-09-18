import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isTemplate = searchParams.get('isTemplate') === 'true';

    let query: any = { isActive: true };

    if (isTemplate) {
      query.isTemplate = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const services = await Service.find(query).sort({ name: 1 });

    return new Response(JSON.stringify(services));
  } catch (error) {
    console.error('Error fetching services:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch services' }), { status: 500 });
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
    
    const service = new Service(body);

    await service.save();

    return new Response(JSON.stringify({ success: true, service }), { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return new Response(JSON.stringify({ error: 'Failed to create service' }), { status: 500 });
  }
}