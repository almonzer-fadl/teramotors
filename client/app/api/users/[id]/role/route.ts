import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';

// PUT /api/users/[id]/role - Update user's role
export const PUT = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    await connectToDatabase();

    try {
        const body = await req.json();
        const { role } = body;

        if (!role) {
            return NextResponse.json({ error: 'Role is required.' }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { _id: id, tenantId }, // Ensure user belongs to the tenant
            { role },
            { new: true, runValidators: true }
        ).select('-password').lean(); // Return updated user without password

        if (!user) {
            return NextResponse.json({ error: 'User not found or does not belong to your organization.' }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] } // Only admins can change roles
);
