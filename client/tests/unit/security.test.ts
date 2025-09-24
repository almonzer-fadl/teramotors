import { 
  InputSanitizer, 
  CSRFProtection, 
  RateLimiter, 
  FileSecurity,
  SQLInjectionPrevention,
  XSSPrevention 
} from '@/lib/security';

describe('Security Tests', () => {
  describe('InputSanitizer', () => {
    test('should sanitize string input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = InputSanitizer.sanitizeString(maliciousInput);
      
      expect(sanitized).toBe('scriptalert("xss")/scriptHello World');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    test('should sanitize email input', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';
      
      expect(InputSanitizer.sanitizeEmail(validEmail)).toBe(validEmail);
      expect(InputSanitizer.sanitizeEmail(invalidEmail)).toBe('');
    });

    test('should sanitize phone input', () => {
      const phoneWithSpecialChars = '+1 (555) 123-4567!@#';
      const sanitized = InputSanitizer.sanitizePhone(phoneWithSpecialChars);
      
      expect(sanitized).toBe('+1 (555) 123-4567');
    });

    test('should sanitize number input', () => {
      expect(InputSanitizer.sanitizeNumber('123')).toBe(123);
      expect(InputSanitizer.sanitizeNumber('abc')).toBe(0);
      expect(InputSanitizer.sanitizeNumber('-5')).toBe(0);
    });

    test('should sanitize object input', () => {
      const maliciousObject = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        age: 25,
        tags: ['<script>', 'normal-tag']
      };
      
      const sanitized = InputSanitizer.sanitizeObject(maliciousObject);
      
      expect(sanitized.name).not.toContain('<');
      expect(sanitized.name).not.toContain('>');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.age).toBe(25);
      expect(sanitized.tags[0]).not.toContain('<');
    });
  });

  describe('CSRFProtection', () => {
    test('should generate and validate CSRF token', () => {
      const sessionId = 'test-session-123';
      const token = CSRFProtection.generateToken(sessionId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const isValid = CSRFProtection.validateToken(token, sessionId);
      expect(isValid).toBe(true);
    });

    test('should reject invalid CSRF token', () => {
      const sessionId = 'test-session-123';
      const invalidToken = 'invalid-token';
      
      const isValid = CSRFProtection.validateToken(invalidToken, sessionId);
      expect(isValid).toBe(false);
    });

    test('should reject token for different session', () => {
      const sessionId1 = 'session-1';
      const sessionId2 = 'session-2';
      const token = CSRFProtection.generateToken(sessionId1);
      
      const isValid = CSRFProtection.validateToken(token, sessionId2);
      expect(isValid).toBe(false);
    });
  });

  describe('RateLimiter', () => {
    beforeEach(() => {
      // Clear rate limiter state
      (RateLimiter as any).requests.clear();
    });

    test('should allow requests within limit', () => {
      const identifier = 'test-user';
      const maxRequests = 5;
      
      for (let i = 0; i < maxRequests; i++) {
        const allowed = RateLimiter.checkLimit(identifier, maxRequests);
        expect(allowed).toBe(true);
      }
    });

    test('should block requests exceeding limit', () => {
      const identifier = 'test-user';
      const maxRequests = 3;
      
      // Make requests up to limit
      for (let i = 0; i < maxRequests; i++) {
        RateLimiter.checkLimit(identifier, maxRequests);
      }
      
      // Next request should be blocked
      const allowed = RateLimiter.checkLimit(identifier, maxRequests);
      expect(allowed).toBe(false);
    });

    test('should track remaining requests', () => {
      const identifier = 'test-user';
      const maxRequests = 10;
      
      RateLimiter.checkLimit(identifier, maxRequests);
      RateLimiter.checkLimit(identifier, maxRequests);
      
      const remaining = RateLimiter.getRemainingRequests(identifier, maxRequests);
      expect(remaining).toBe(8);
    });
  });

  describe('FileSecurity', () => {
    test('should validate allowed file types', () => {
      const validFile = {
        name: 'test.jpg',
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg'
      } as File;
      
      const result = FileSecurity.validateFile(validFile);
      expect(result.valid).toBe(true);
    });

    test('should reject oversized files', () => {
      const oversizedFile = {
        name: 'large.jpg',
        size: 15 * 1024 * 1024, // 15MB
        type: 'image/jpeg'
      } as File;
      
      const result = FileSecurity.validateFile(oversizedFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });

    test('should reject disallowed file types', () => {
      const maliciousFile = {
        name: 'malicious.exe',
        size: 1024,
        type: 'application/x-executable'
      } as File;
      
      const result = FileSecurity.validateFile(maliciousFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File type not allowed');
    });

    test('should sanitize file names', () => {
      const maliciousName = '../../../etc/passwd<script>.jpg';
      const sanitized = FileSecurity.sanitizeFileName(maliciousName);
      
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    test('should generate secure file names', () => {
      const originalName = 'test file.jpg';
      const secureName = FileSecurity.generateSecureFileName(originalName);
      
      expect(secureName).toContain('test_file');
      expect(secureName).toContain('.jpg');
      expect(secureName).toMatch(/\d+/); // Should contain timestamp
    });
  });

  describe('SQLInjectionPrevention', () => {
    test('should sanitize SQL injection attempts', () => {
      const maliciousQuery = "SELECT * FROM users WHERE id = '1' OR '1'='1'";
      const sanitized = SQLInjectionPrevention.sanitizeQuery(maliciousQuery);
      
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain('OR');
    });

    test('should detect dangerous SQL patterns', () => {
      const dangerousQueries = [
        "UNION SELECT * FROM users",
        "INSERT INTO users VALUES ('hacker')",
        "UPDATE users SET password = 'hacked'",
        "DELETE FROM users",
        "DROP TABLE users",
        "CREATE TABLE malicious",
        "ALTER TABLE users",
        "EXEC xp_cmdshell('dir')",
        "-- comment",
        "/* comment */"
      ];
      
      dangerousQueries.forEach(query => {
        const isValid = SQLInjectionPrevention.validateQuery(query);
        expect(isValid).toBe(false);
      });
    });

    test('should allow safe queries', () => {
      const safeQueries = [
        "SELECT name FROM customers",
        "SELECT * FROM vehicles WHERE make = 'Toyota'",
        "SELECT COUNT(*) FROM appointments"
      ];
      
      safeQueries.forEach(query => {
        const isValid = SQLInjectionPrevention.validateQuery(query);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('XSSPrevention', () => {
    test('should escape HTML characters', () => {
      const maliciousHtml = '<script>alert("xss")</script>';
      const escaped = XSSPrevention.escapeHtml(maliciousHtml);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    test('should escape attribute values', () => {
      const maliciousAttr = '"><script>alert("xss")</script>';
      const escaped = XSSPrevention.escapeAttribute(maliciousAttr);
      
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).not.toContain('"');
    });

    test('should remove script tags', () => {
      const htmlWithScript = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const sanitized = XSSPrevention.sanitizeScript(htmlWithScript);
      
      expect(sanitized).toBe('<p>Hello</p><p>World</p>');
      expect(sanitized).not.toContain('<script>');
    });

    test('should remove javascript protocol', () => {
      const maliciousLink = '<a href="javascript:alert(\'xss\')">Click me</a>';
      const sanitized = XSSPrevention.sanitizeScript(maliciousLink);
      
      expect(sanitized).not.toContain('javascript:');
    });

    test('should remove event handlers', () => {
      const maliciousElement = '<img src="test.jpg" onerror="alert(\'xss\')">';
      const sanitized = XSSPrevention.sanitizeScript(maliciousElement);
      
      expect(sanitized).not.toContain('onerror=');
    });
  });
});
