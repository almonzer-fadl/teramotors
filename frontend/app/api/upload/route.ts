
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to run multer middleware
function runMiddleware(req: NextRequest, res: NextResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // We need to access the underlying Node.js request object for multer to work.
    // This is a bit of a hack, but it's a common way to use multer with Next.js App Router.
    const anyReq = req as any;
    const anyRes = res as any;

    await runMiddleware(anyReq, anyRes, upload.single('file'));

    const file = anyReq.file;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Upload file to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });

      const readableStream = new Readable();
      readableStream._read = () => {}; // _read is required but you can noop it
      readableStream.push(file.buffer);
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
