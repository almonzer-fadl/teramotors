import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';

// PUT /api/users/[id]/status - Update user's status (active/inactive)
export const PUT = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    await connectToDatabase();

    try {
        const body = await req.json();
        const { status } = body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return NextResponse.json({ error: 'Status must be either "active" or "inactive".' }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { _id: id, tenantId }, // Ensure user belongs to the tenant
            { status },
            { new: true, runValidators: true }
        ).select('-password').lean(); // Return updated user without password

        if (!user) {
            return NextResponse.json({ error: 'User not found or does not belong to your organization.' }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
      console.error('Error updating user status:', error);
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] } // Only admins can change status
);
