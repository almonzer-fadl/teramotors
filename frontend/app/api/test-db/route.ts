import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    await connectToDatabase();
    return Response.json({ status: 'Connected!' });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}