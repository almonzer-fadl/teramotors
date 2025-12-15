import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Backup from '@/lib/models/Backup';
import fs from 'fs';
import { stat } from 'fs/promises';

export const GET = withTenantAuth(
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

      const fileStat = await stat(backup.filepath);
      const stream = fs.createReadStream(backup.filepath);

      return new NextResponse(stream as any, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="${backup.filename}"`,
          'Content-Type': 'application/gzip',
          'Content-Length': fileStat.size.toString(),
        },
      });

    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Backup file not found on disk' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to download backup' }, { status: 500 });
    }
  },
  { allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);
