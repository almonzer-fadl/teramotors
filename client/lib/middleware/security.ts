import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/roles';
import { authRateLimit, generalRateLimit, uploadRateLimit, strictRateLimit } from './rate-limit';
import { validateBody, validateQuery, commonSchemas } from './validation';
import { z } from 'zod';

// Security middleware factory
export function createSecureHandler(options: {
  rateLimit?: 'auth' | 'general' | 'upload' | 'strict';
  requireAuth?: boolean;
  requireRole?: string[];
  validateBody?: z.ZodSchema;
  validateQuery?: z.ZodSchema;
}) {
  return async function secureHandler(
    request: NextRequest,
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    // Rate limiting
    if (options.rateLimit) {
      const rateLimiters = {
        auth: authRateLimit,
        general: generalRateLimit,
        upload: uploadRateLimit,
        strict: strictRateLimit
      };
      
      const rateLimitResponse = rateLimiters[options.rateLimit](request);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }

    // Authentication check
    if (options.requireAuth) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Role-based access control
      if (options.requireRole && options.requireRole.length > 0) {
        const userRole = (session.user as any).role;
        if (!options.requireRole.includes(userRole)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    // Input validation
    if (options.validateBody) {
      const validationResult = await validateBody(options.validateBody)(request);
      if (validationResult instanceof NextResponse) {
        return validationResult;
      }
    }

    if (options.validateQuery) {
      const validationResult = validateQuery(options.validateQuery)(request);
      if (validationResult instanceof NextResponse) {
        return validationResult;
      }
    }

    // Call the actual handler
    return handler(request);
  };
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// File upload security validation
export function validateFileUpload(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}) {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'] } = options;

  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension ${extension} not allowed` };
  }

  // Check for suspicious file names
  const suspiciousPatterns = /[<>:"/\\|?*]|\.\.|script|javascript|vbscript|data:/i;
  if (suspiciousPatterns.test(file.name)) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true };
}

// CSRF protection helper
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 0;
}
