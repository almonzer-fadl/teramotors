import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Backup from '@/lib/models/Backup';
import { restoreFullBackup } from '@/lib/utils/restore-manager';

// POST /api/admin/backup/:id/restore - Restore from a specific backup
export const POST = withTenantAuth(
  async (req: NextRequest, { params }) => {
    await connectToDatabase();
    try {
      const backupId = params?.id;
      if (!backupId) {
        return NextResponse.json({ error: 'Backup ID is required' }, { status: 400 });
      }

      const backup = await Backup.findById(backupId);
      if (!backup) {
        return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
      }

      if (backup.status !== 'completed') {
        return NextResponse.json({ error: 'Only completed backups can be restored' }, { status: 400 });
      }

      // Potentially add more robust checks here (e.g., if restore is already in progress)
      
      await restoreFullBackup(backup.filepath);

      return NextResponse.json({ message: 'Restore process initiated successfully' }, { status: 200 });

    } catch (error) {
      console.error('Error initiating backup restore:', error);
      return NextResponse.json({ error: 'Failed to initiate backup restore' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);
