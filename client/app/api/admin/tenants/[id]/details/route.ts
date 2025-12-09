import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import User from '@/lib/models/User';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    await connectToDatabase();

    const tenant = await Tenant.findById(id).lean();

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    const users = await User.find({ tenantId: tenant._id }).lean();

    return NextResponse.json({ tenant, users });

  } catch (error) {
    console.error('Error fetching tenant details:', error);
    return NextResponse.json({ message: 'An error occurred while fetching tenant details' }, { status: 500 });
  }
}
