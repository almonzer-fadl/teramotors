import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Backup from '@/lib/models/Backup';
import { createFullBackup } from '@/lib/utils/backup-manager';
import mongoose from 'mongoose';

// GET /api/admin/backup - List all backups
export const GET = withTenantAuth(
  async (req: NextRequest) => {
    await connectToDatabase();
    try {
      const backups = await Backup.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ backups, total: backups.length });
    } catch (error) {
      console.error('Error fetching backups:', error);
      return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

// POST /api/admin/backup - Create a new backup
export const POST = withTenantAuth(
  async (req: NextRequest, { session }) => {
    await connectToDatabase();
    try {
      const body = await req.json();
      const { type, tenantId } = body;

      if (type === 'tenant') {
        // Not implemented yet
        return NextResponse.json({ error: 'Tenant-specific backup is not implemented yet.' }, { status: 501 });
      }

      if (type === 'full') {
        const userId = new mongoose.Types.ObjectId(session.user.id);
        const backup = await createFullBackup(userId);
        return NextResponse.json({ backupId: backup._id, status: backup.status }, { status: 201 });
      }

      return NextResponse.json({ error: 'Invalid backup type specified.' }, { status: 400 });

    } catch (error) {
      console.error('Error creating backup:', error);
      return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);
