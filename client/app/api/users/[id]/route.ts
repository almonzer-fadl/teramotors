import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';

// GET /api/users/[id] - Get a single user's details
export const GET = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    await connectToDatabase();
    try {
      const user = await User.findOne({ _id: id, tenantId }).select('-password').lean();
      if (!user) {
        return NextResponse.json({ error: 'User not found or does not belong to your organization.' }, { status: 404 });
      }
      return NextResponse.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// DELETE /api/users/[id] - Delete a user
export const DELETE = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    await connectToDatabase();

    try {
      const user = await User.findOneAndDelete({ _id: id, tenantId }); // Ensure user belongs to the tenant

      if (!user) {
        return NextResponse.json({ error: 'User not found or does not belong to your organization.' }, { status: 404 });
      }

      return NextResponse.json({ message: 'User deleted successfully.' });

    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] } // Only admins can delete users
);
