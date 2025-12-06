import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { status } = await request.json();

  if (!status || !['active', 'suspended'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status provided. Must be active or suspended.' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tenant status updated successfully', tenant });
  } catch (error) {
    console.error('Error updating tenant status:', error);
    return NextResponse.json({ message: 'An error occurred while updating tenant status' }, { status: 500 });
  }
}
