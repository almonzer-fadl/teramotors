import { NextResponse, NextRequest } from 'next/server';
import { Readable } from 'stream';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import { FileUploadService } from '@/lib/cloudinary';

export const runtime = 'nodejs';

type FormDataFile = {
  name?: string;
  type?: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const handler = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
      const formData = await req.formData();
      const file = formData.get('logo') as FormDataFile | null;

      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { error: 'No file uploaded.' },
          { status: 400 }
        );
      }

      const mimeType = file.type || 'application/octet-stream';
      if (!allowedMimeTypes.includes(mimeType)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WEBP) are allowed.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const multerLikeFile = {
        fieldname: 'logo',
        originalname: file.name || 'logo',
        encoding: '7bit',
        mimetype: mimeType,
        size: buffer.length,
        buffer,
        destination: '',
        filename: '',
        path: '',
        stream: Readable.from(buffer),
      } as Express.Multer.File;

      const uploadResult = await FileUploadService.uploadFile(
        multerLikeFile,
        `tenants/${tenantId}/logos`
      );

      return NextResponse.json({ url: uploadResult.url });
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message || 'Failed to upload logo.' },
        { status: 500 }
      );
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

export const POST = handler;
