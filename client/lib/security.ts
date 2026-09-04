import crypto from 'crypto';

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.g.doubleclick.net https://www.googleadservices.com https://www.google.com; script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.g.doubleclick.net https://www.googleadservices.com https://www.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://www.googletagmanager.com https://*.google-analytics.com https://*.g.doubleclick.net; font-src 'self' data:; connect-src 'self' https: https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.google.com https://*.g.doubleclick.net https://www.googleadservices.com; frame-src 'self' https://maps.google.com https://www.google.com; frame-ancestors 'none';"
};

// Input sanitization
export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  static sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeString(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+\-\s()]/g, '').substring(0, 20);
  }

  static sanitizeNumber(input: any): number {
    const num = parseFloat(input);
    return isNaN(num) ? 0 : Math.max(0, num);
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeString(key);
      if (sanitizedKey) {
        if (typeof value === 'string') {
          sanitized[sanitizedKey] = this.sanitizeString(value);
        } else if (typeof value === 'number') {
          sanitized[sanitizedKey] = this.sanitizeNumber(value);
        } else if (Array.isArray(value)) {
          sanitized[sanitizedKey] = value.map(item => 
            typeof item === 'string' ? this.sanitizeString(item) : item
          );
        } else if (typeof value === 'object') {
          sanitized[sanitizedKey] = this.sanitizeObject(value);
        } else {
          sanitized[sanitizedKey] = value;
        }
      }
    }
    return sanitized;
  }
}

// CSRF Protection
export class CSRFProtection {
  private static secretKey = process.env.CSRF_SECRET_KEY || crypto.randomBytes(32).toString('hex');

  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
    
    return Buffer.from(`${data}:${signature}`).toString('base64');
  }

  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      
      if (parts.length !== 3) return false;
      
      const [data, signature] = [parts[0] + ':' + parts[1], parts[2]];
      
      if (!data || !signature) return false;
      
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(data)
        .digest('hex');
      
      if (signature !== expectedSignature) return false;
      
      const [tokenSessionId, timestamp] = data.split(':');
      if (tokenSessionId !== sessionId) return false;
      
      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - parseInt(timestamp);
      return tokenAge < 3600000; // 1 hour
    } catch (error) {
      return false;
    }
  }
}

// Rate Limiting
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static checkLimit(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 900000 // 15 minutes
  ): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  static getRemainingRequests(identifier: string, maxRequests: number = 100): number {
    const record = this.requests.get(identifier);
    if (!record) return maxRequests;
    return Math.max(0, maxRequests - record.count);
  }

  static getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record ? record.resetTime : Date.now() + 900000;
  }
}

// File Upload Security
export class FileSecurity {
  private static allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  private static allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx'
  ];

  private static maxFileSize = 10 * 1024 * 1024; // 10MB

  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!this.allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File extension not allowed' };
    }

    return { valid: true };
  }

  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 100);
  }

  static generateSecureFileName(originalName: string): string {
    const sanitized = this.sanitizeFileName(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = sanitized.substring(sanitized.lastIndexOf('.'));
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    
    return `${nameWithoutExt}_${timestamp}_${random}${extension}`;
  }
}

// SQL Injection Prevention
export class SQLInjectionPrevention {
  static sanitizeQuery(query: string): string {
    return query
      .replace(/[';-]/g, '') // Remove single quotes, semicolons, and hyphens
      .replace(/\bunion\b/gi, '') // Remove UNION keywords
      .replace(/\bselect\b/gi, '') // Remove SELECT keywords
      .replace(/\binsert\b/gi, '') // Remove INSERT keywords
      .replace(/\bupdate\b/gi, '') // Remove UPDATE keywords
      .replace(/\bdelete\b/gi, '') // Remove DELETE keywords
      .replace(/\bdrop\b/gi, '') // Remove DROP keywords
      .replace(/\bcreate\b/gi, '') // Remove CREATE keywords
      .replace(/\balter\b/gi, '') // Remove ALTER keywords
      .replace(/\bexec\b/gi, '') // Remove EXEC keywords
      .replace(/\bexecute\b/gi, '') // Remove EXECUTE keywords
      .replace(/\bor\b/gi, '') // Remove OR keywords
      .replace(/\band\b/gi, '') // Remove AND keywords
      .trim();
  }

  static validateQuery(query: string): boolean {
    const dangerousPatterns = [
      /\bunion\s+select\b/gi,
      /\binsert\s+into\b/gi,
      /\bupdate\b/gi,
      /\bdelete\s+from\b/gi,
      /\bdrop\s+table\b/gi,
      /\bcreate\s+table\b/gi,
      /\balter\s+table\b/gi,
      /\bexec\b/gi,
      /\bexecute\b/gi,
      /--/g,
      /\/\*/g,
      /\*\//g,
      /\bor\s+1\s*=\s*1/gi,
      /\band\s+1\s*=\s*1/gi
    ];

    return !dangerousPatterns.some(pattern => pattern.test(query));
  }
}

// XSS Prevention
export class XSSPrevention {
  static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    
    return text.replace(/[&<>"'/]/g, (s) => map[s]);
  }

  static escapeAttribute(text: string): string {
    return text.replace(/[&<>"'`]/g, (s) => {
      const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
      };
      return map[s];
    });
  }

  static sanitizeScript(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}

// Security Middleware
export function withSecurityHeaders<T extends (...args: any[]) => Promise<any>>(handler: T) {
  return async (req: any, ...args: Parameters<T>) => {
    const response = await handler(req, ...args);

    if (response && response.headers) {
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  };
}

// IP Whitelist
export class IPWhitelist {
  private static whitelist = new Set<string>([
    '127.0.0.1',
    '::1',
    'localhost'
  ]);

  static addIP(ip: string): void {
    this.whitelist.add(ip);
  }

  static removeIP(ip: string): void {
    this.whitelist.delete(ip);
  }

  static isAllowed(ip: string): boolean {
    return this.whitelist.has(ip);
  }

  static getAllowedIPs(): string[] {
    return Array.from(this.whitelist);
  }
}

// Security Audit Logger
export class SecurityAuditLogger {
  static logSecurityEvent(
    event: string,
    details: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };


    // In production, this would be sent to a security monitoring service
    if (severity === 'critical' || severity === 'high') {
      // Send alert to security team
    }
  }

  static logFailedLogin(ip: string, userAgent: string, email?: string): void {
    this.logSecurityEvent('failed_login', { ip, userAgent, email }, 'medium');
  }

  static logSuspiciousActivity(ip: string, userAgent: string, activity: string): void {
    this.logSecurityEvent('suspicious_activity', { ip, userAgent, activity }, 'high');
  }

  static logDataBreachAttempt(ip: string, userAgent: string, details: any): void {
    this.logSecurityEvent('data_breach_attempt', { ip, userAgent, details }, 'critical');
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  InputSanitizer,
  CSRFProtection,
  RateLimiter,
  FileSecurity,
  SQLInjectionPrevention,
  XSSPrevention,
  IPWhitelist,
  SecurityAuditLogger,
  withSecurityHeaders
};
