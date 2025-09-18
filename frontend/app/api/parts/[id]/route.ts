
import { connectToDatabase } from '@/lib/db';
import Part from '@/lib/models/Part';
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
    
    const part = await Part.findById(params.id);
    
    if (!part) {
      return new Response(JSON.stringify({ error: 'Part not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(part));
  } catch (error) {
    console.error('Error fetching part:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch part' }), { status: 500 });
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
    
    const part = await Part.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!part) {
      return new Response(JSON.stringify({ error: 'Part not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, part }));
  } catch (error) {
    console.error('Error updating part:', error);
    return new Response(JSON.stringify({ error: 'Failed to update part' }), { status: 500 });
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
    
    const part = await Part.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!part) {
      return new Response(JSON.stringify({ error: 'Part not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting part:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete part' }), { status: 500 });
  }
}
