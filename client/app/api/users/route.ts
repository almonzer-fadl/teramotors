import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';

// GET /api/users - List all users for the current tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
      // Find all users that belong to the tenant, excluding their passwords
      const users = await User.find({ tenantId }).select('-password').lean();
      return NextResponse.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// You can also add a POST handler here for inviting users later
// POST /api/users
// ...