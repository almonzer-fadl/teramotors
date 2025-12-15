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
  const { name, email, status } = await request.json(); // Allow updating name, email, and status here

  try {
    await connectToDatabase();

    const updateFields: { [key: string]: any } = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (status && !['active', 'suspended', 'trial', 'cancelled'].includes(status)) {
        return NextResponse.json({ message: 'Invalid status value provided.' }, { status: 400 });
    }
    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tenant updated successfully', tenant });
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while updating tenant details' }, { status: 500 });
  }
}
