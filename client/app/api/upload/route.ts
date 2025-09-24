import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { auth } from '@/lib/auth';
import { uploadRateLimit } from '@/lib/middleware/rate-limit';
import { validateFileUpload } from '@/lib/middleware/security';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = uploadRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Validate file upload
    const validation = validateFileUpload(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Additional security: Check file header/magic bytes
    const fileHeader = buffer.slice(0, 4);
    const validHeaders = [
      Buffer.from([0xFF, 0xD8, 0xFF]), // JPEG
      Buffer.from([0x89, 0x50, 0x4E, 0x47]), // PNG
      Buffer.from([0x47, 0x49, 0x46]), // GIF
      Buffer.from([0x52, 0x49, 0x46, 0x46]) // WEBP
    ];

    const isValidHeader = validHeaders.some(header => 
      fileHeader.slice(0, header.length).equals(header)
    );

    if (!isValidHeader) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    // Upload file to Cloudinary with security options
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        resource_type: 'image',
        folder: 'teramotors',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });

      const readableStream = new Readable();
      readableStream._read = () => {}; // _read is required but you can noop it
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(stream);
    });

    const result: any = await uploadPromise;

    return NextResponse.json({ secure_url: result.secure_url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}