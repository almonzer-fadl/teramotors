import { NextRequest, NextResponse } from 'next/server';

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
  EXTERNAL = 'EXTERNAL_ERROR'
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error logging interface
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  type?: ErrorType;
  statusCode?: number;
  stack?: string;
  request?: {
    method: string;
    url: string;
    userAgent?: string;
    ip?: string;
  };
  userId?: string;
  metadata?: Record<string, any>;
}

// Simple logger (in production, use Winston or similar)
class Logger {
  private logs: ErrorLog[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  log(level: ErrorLog['level'], message: string, metadata?: Partial<ErrorLog>) {
    const logEntry: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`,
        metadata
      );
    }
  }

  error(message: string, metadata?: Partial<ErrorLog>) {
    this.log('error', message, metadata);
  }

  warn(message: string, metadata?: Partial<ErrorLog>) {
    this.log('warn', message, metadata);
  }

  info(message: string, metadata?: Partial<ErrorLog>) {
    this.log('info', message, metadata);
  }

  debug(message: string, metadata?: Partial<ErrorLog>) {
    this.log('debug', message, metadata);
  }

  getLogs(level?: ErrorLog['level'], limit: number = 100): ErrorLog[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance
export const logger = new Logger();

// Error handler middleware
export function handleError(error: Error, request?: NextRequest): NextResponse {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let type = ErrorType.INTERNAL;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    type = error.type;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    type = ErrorType.VALIDATION;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    type = ErrorType.VALIDATION;
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    type = ErrorType.CONFLICT;
  }

  // Log the error
  logger.error(message, {
    type,
    statusCode,
    stack: error.stack,
    request: request ? {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
           request.headers.get('x-real-ip') || 
           'unknown'
    } : undefined
  });

  // Return appropriate response
  return NextResponse.json(
    {
      error: message,
      type,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    { status: statusCode }
  );
}

// Async error wrapper
export function asyncHandler<T extends any[]>(
  fn: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error as Error, args[0] as NextRequest);
    }
  };
}

// Common error creators
export const createError = {
  validation: (message: string) => new AppError(message, ErrorType.VALIDATION, 400),
  authentication: (message: string = 'Authentication required') => 
    new AppError(message, ErrorType.AUTHENTICATION, 401),
  authorization: (message: string = 'Access denied') => 
    new AppError(message, ErrorType.AUTHORIZATION, 403),
  notFound: (message: string = 'Resource not found') => 
    new AppError(message, ErrorType.NOT_FOUND, 404),
  conflict: (message: string = 'Resource conflict') => 
    new AppError(message, ErrorType.CONFLICT, 409),
  internal: (message: string = 'Internal server error') => 
    new AppError(message, ErrorType.INTERNAL, 500),
  external: (message: string = 'External service error') => 
    new AppError(message, ErrorType.EXTERNAL, 502)
};

// Performance monitoring
export function measureApiPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  return fn().then(result => {
    const end = performance.now();
    const duration = end - start;

    logger.info(`API Performance: ${name}`, {
      message: `Duration: ${duration.toFixed(2)}ms`,
      level: duration > 1000 ? 'warn' : 'info'
    });

    return result;
  });
}

// Health check endpoint data
export function getHealthStatus() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    logs: logger.getLogs().length
  };
}
