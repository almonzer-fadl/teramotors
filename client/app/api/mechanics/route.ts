
import { connectToDatabase } from '@/lib/db';
import Mechanic from '@/lib/models/Mechanic';
import { getServerSession } from "@/lib/auth-server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'Tenant ID not found' }), { status: 400 });
    }

    const mechanics = await Mechanic.find({ tenantId }).populate('userId', 'firstName lastName');

    return new Response(JSON.stringify(mechanics));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch mechanics' }), { status: 500 });
  }
}
