import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { checkUsageLimit } from '@/lib/middleware/usage-enforcement';
import { updateTenantStats } from '@/lib/utils/usage-tracker';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// GET /api/users - List all users for the current tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
      // Find all users that belong to the tenant, excluding their passwords
      const users = await User.find({ tenantId }).select('-password').lean();
      return NextResponse.json(users);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// POST /api/users - Add a new user to the tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();
    try {
      const body = await req.json();
      const { firstName, lastName, email, role } = body;

      if (!firstName || !lastName || !email || !role) {
        return NextResponse.json({ error: 'First name, last name, email, and role are required.' }, { status: 400 });
      }

      // Check if user with this email already exists for this tenant
      const existingUser = await User.findOne({ email, tenantId });
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email already exists in your organization.' }, { status: 409 });
      }

      // Check usage limits before creating a new user
      const usageCheck = await checkUsageLimit(tenantId.toString(), 'user', 'create');
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: usageCheck.reason,
          current: usageCheck.current,
          limit: usageCheck.limit
        }, { status: 403 });
      }

      // Generate and hash a temporary password
      const temporaryPassword = "TempPass123!"; // This could be randomized and emailed
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        tenantId,
        status: 'active', // New users are active by default
      });
      
      // Update tenant stats after successful creation
      await updateTenantStats(tenantId.toString());

      // Return the new user without the password
      const userResponse = newUser.toObject();
      delete userResponse.password;

      return NextResponse.json(userResponse, { status: 201 });

    } catch (error) {
      return NextResponse.json({ error: 'Failed to add new user' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);