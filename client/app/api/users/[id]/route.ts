import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import { getServerSession } from "@/lib/auth-server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await context.params;
  const { role, isActive, displayName, firstName, lastName } = await request.json();

  if (!id) {
    return NextResponse.json({ message: 'User ID not provided' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (role) {
      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    if (displayName) {
      user.displayName = displayName;
    }

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    await user.save();

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ message: 'User ID not provided' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
