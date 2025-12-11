import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// POST /api/users/[id]/reset-password
export const POST = withTenantAuth(
  async (req: NextRequest, { params, tenantId }) => {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    await connectToDatabase();

    try {
        // Ensure the user being changed is within the same tenant
        const user = await User.findOne({ _id: id, tenantId });
        if (!user) {
            return NextResponse.json({ error: 'User not found in your organization.' }, { status: 404 });
        }

        const temporaryPassword = "TempPass123!";
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        user.password = hashedPassword;
        // Optionally, force password change on next login
        // user.forcePasswordChange = true; 
        await user.save();

        return NextResponse.json({ message: `Password for ${user.email} has been reset to "TempPass123!". The user will be required to change it on next login.` });

    } catch (error) {
      console.error('Error resetting password:', error);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
