import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseHealthy } from '@/lib/db';
import { cacheService } from '@/lib/cache';
import { productionConfig } from '@/lib/config/production';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check database health
    const dbHealthy = await isDatabaseHealthy();
    
    // Check cache health
    const cacheHealthy = await cacheService.healthCheck();
    
    // Check environment variables
    const envHealthy = checkEnvironmentVariables();
    
    // Check external services
    const servicesHealthy = await checkExternalServices();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: dbHealthy && cacheHealthy && envHealthy && servicesHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          responseTime: responseTime
        },
        cache: {
          status: cacheHealthy ? 'healthy' : 'unhealthy',
          responseTime: responseTime
        },
        environment: {
          status: envHealthy ? 'healthy' : 'unhealthy',
          missingVariables: getMissingEnvironmentVariables()
        },
        external: servicesHealthy
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    return NextResponse.json(errorStatus, { status: 503 });
  }
}

function checkEnvironmentVariables(): boolean {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'RESEND_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  return required.every(key => process.env[key]);
}

function getMissingEnvironmentVariables(): string[] {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'RESEND_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  return required.filter(key => !process.env[key]);
}

async function checkExternalServices(): Promise<{
  email: boolean;
  fileUpload: boolean;
  database: boolean;
}> {
  try {
    // Check email service (Resend)
    const emailHealthy = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy-key');
    
    // Check file upload service (Cloudinary)
    const fileUploadHealthy = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    
    // Check database
    const databaseHealthy = await isDatabaseHealthy();
    
    return {
      email: emailHealthy,
      fileUpload: fileUploadHealthy,
      database: databaseHealthy
    };
  } catch (error) {
    return {
      email: false,
      fileUpload: false,
      database: false
    };
  }
}
