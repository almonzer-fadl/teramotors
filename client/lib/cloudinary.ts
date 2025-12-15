import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for multer
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// File upload service
export class FileUploadService {
  static async uploadFile(file: Express.Multer.File, folder: string = 'general') {
    try {
      // Convert buffer to base64 data URI for Cloudinary upload
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: `teramotors/${folder}`,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  }

  static async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general') {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        files: results
      };
    } catch (error) {
      throw new Error('Failed to upload files');
    }
  }

  static async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        result: result.result
      };
    } catch (error) {
      throw new Error('Failed to delete file');
    }
  }

  static async getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}) {
    try {
      const transformation = [];
      
      if (options.width || options.height) {
        transformation.push({
          width: options.width,
          height: options.height,
          crop: 'limit'
        });
      }
      
      if (options.quality) {
        transformation.push({ quality: options.quality });
      }
      
      if (options.format) {
        transformation.push({ fetch_format: options.format });
      }

      const url = cloudinary.url(publicId, {
        transformation: transformation
      });
      
      return url;
    } catch (error) {
      throw new Error('Failed to generate optimized URL');
    }
  }

  static async generateThumbnail(publicId: string, size: number = 150) {
    try {
      const url = cloudinary.url(publicId, {
        transformation: [
          { width: size, height: size, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      
      return url;
    } catch (error) {
      throw new Error('Failed to generate thumbnail');
    }
  }
}

// File validation utilities
export class FileValidator {
  static validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid image type. Only JPEG, PNG, and GIF are allowed.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size too large. Maximum 5MB allowed.' };
    }

    return { valid: true };
  }

  static validateDocument(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid document type. Only PDF and Word documents are allowed.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Document size too large. Maximum 10MB allowed.' };
    }

    return { valid: true };
  }

  static validateFile(file: Express.Multer.File, type: 'image' | 'document' | 'any'): { valid: boolean; error?: string } {
    switch (type) {
      case 'image':
        return this.validateImage(file);
      case 'document':
        return this.validateDocument(file);
      case 'any':
        return { valid: true };
      default:
        return { valid: false, error: 'Invalid file type specified.' };
    }
  }
}

export default cloudinary;