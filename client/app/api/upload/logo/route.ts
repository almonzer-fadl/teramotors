import { NextApiRequest, NextApiResponse } from 'next';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import { FileUploadService } from '@/lib/cloudinary';
import multer from '@/lib/multer'; // Using the pre-configured multer instance

// Multer setup as a middleware for API route
const uploadMiddleware = multer.single('logo'); // 'logo' is the field name for the file

// Helper to convert NextApiRequest to a format multer can understand
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (...args: any[]) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Next.js API route config
export const config = {
  api: {
    bodyParser: false, // Disable default body parser as multer handles it
  },
};

// POST /api/upload/logo
export default withTenantAuth(
  async (req: NextApiRequest, res: NextApiResponse, { tenantId }) => {
    await connectToDatabase();

    try {
      // Run the multer middleware
      await runMiddleware(req, res, uploadMiddleware);

      // Multer adds 'file' object to req
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      // Validate file type (optional, already done in cloudinary.ts fileFilter)
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only images (JPEG, PNG, GIF, WEBP) are allowed.' });
      }
      
      // Upload to Cloudinary
      const uploadResult = await FileUploadService.uploadFile(req.file, `tenants/${tenantId}/logos`);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Cloudinary upload failed.');
      }

      return res.status(200).json({ url: uploadResult.url });

    } catch (error: any) {
      console.error('Logo upload error:', error);
      return res.status(500).json({ error: error.message || 'Failed to upload logo.' });
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] } // Only admins can upload logos
);
