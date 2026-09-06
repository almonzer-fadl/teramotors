// Production Environment Configuration
export const productionConfig = {
  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || '',
    options: {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    }
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      connectTimeout: 10000,
      lazyConnect: true,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    }
  },

  // Email Configuration
  email: {
    provider: 'resend',
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'TeraMotors <noreply@teramotors.com>',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@teramotors.com',
    templates: {
      baseUrl: process.env.NEXT_PUBLIC_URL || 'https://teramotors.com',
      logoUrl: `${process.env.NEXT_PUBLIC_URL}/logo.png`,
      companyName: 'TeraMotors',
      companyAddress: '123 Auto Repair St, Riyadh, Saudi Arabia',
      companyPhone: '+966553022102',
      companyEmail: 'info@teramotors.com'
    }
  },

  // File Upload Configuration
  fileUpload: {
    provider: 'cloudinary',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      folder: 'teramotors/production',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
      transformations: {
        image: {
          quality: 'auto',
          fetchFormat: 'auto',
          width: 1200,
          height: 1200,
          crop: 'limit'
        },
        thumbnail: {
          quality: 'auto',
          fetchFormat: 'auto',
          width: 150,
          height: 150,
          crop: 'fill'
        }
      }
    }
  },

  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || '',
      expiresIn: '24h',
      refreshExpiresIn: '7d'
    },
    csrf: {
      secret: process.env.CSRF_SECRET_KEY || '',
      tokenExpiry: 3600000 // 1 hour
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://teramotors.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "https:"],
          frameAncestors: ["'none'"]
        }
      }
    }
  },

  // ZATCA Configuration
  zatca: {
    environment: 'production',
    sellerName: 'TeraMotors Auto Repair Shop',
    vatRegistrationNumber: process.env.ZATCA_VAT_NUMBER || '',
    branchId: process.env.ZATCA_BRANCH_ID || '001',
    branchName: 'Main Branch',
    location: 'Riyadh, Saudi Arabia',
    city: 'Riyadh',
    country: 'SA',
    postalCode: '13252',
    street: 'صناعية, الرمال, الرياض',
    buildingNumber: '1',
    unitNumber: '1',
    neighborhood: 'Al Malaz',
    district: 'Riyadh',
    compliance: {
      phase: 1,
      qrCodeGeneration: true,
      invoiceValidation: true,
      xmlGeneration: false // Phase 2 feature
    }
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      environment: 'production',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1
    },
    logging: {
      level: 'info',
      format: 'json',
      transports: ['console', 'file'],
      file: {
        filename: 'logs/app.log',
        maxSize: '10MB',
        maxFiles: 5
      }
    },
    metrics: {
      enabled: true,
      interval: 60000, // 1 minute
      endpoints: {
        health: '/api/health',
        metrics: '/api/metrics',
        readiness: '/api/readiness',
        liveness: '/api/liveness'
      }
    }
  },

  // Performance Configuration
  performance: {
    caching: {
      enabled: true,
      defaultTTL: 300, // 5 minutes
      maxTTL: 3600, // 1 hour
      strategies: {
        database: 'redis',
        static: 'memory',
        api: 'redis'
      }
    },
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024
    },
    pagination: {
      defaultLimit: 20,
      maxLimit: 100
    },
    database: {
      connectionPool: {
        min: 5,
        max: 20,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200
      },
      query: {
        timeout: 30000,
        retries: 3,
        retryDelay: 1000
      }
    }
  },

  // Feature Flags
  features: {
    realTimeNotifications: true,
    fileUpload: true,
    emailNotifications: true,
    pdfGeneration: true,
    dataExport: true,
    advancedSearch: true,
    mobileOptimization: true,
    darkMode: false, // Disabled for production
    betaFeatures: false
  },

  // Business Configuration
  business: {
    name: 'TeraMotors',
    type: 'Auto Repair Shop',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    workingHours: {
      start: '08:00',
      end: '18:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    vatRate: 0.15, // 15%
    invoiceSettings: {
      prefix: 'INV',
      numberLength: 6,
      dueDays: 30
    },
    estimateSettings: {
      prefix: 'EST',
      numberLength: 6,
      validDays: 30
    }
  },

  // API Configuration
  api: {
    version: 'v1',
    baseUrl: process.env.NEXT_PUBLIC_URL || 'https://teramotors.com',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      vehicles: '/api/vehicles',
      appointments: '/api/appointments',
      jobCards: '/api/job-cards',
      invoices: '/api/invoices',
      estimates: '/api/estimates',
      inventory: '/api/parts',
      upload: '/api/upload',
      reports: '/api/reports'
    }
  },

  // Environment Variables Validation
  validate: () => {
    const required = [
      'MONGODB_URI',
      'JWT_SECRET',
      'RESEND_API_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return true;
  }
};

// Export individual configurations
export const {
  database,
  redis,
  email,
  fileUpload,
  security,
  zatca,
  monitoring,
  performance,
  features,
  business,
  api
} = productionConfig;

export default productionConfig;
