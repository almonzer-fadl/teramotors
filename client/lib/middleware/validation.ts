import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: error.issues.map((err: z.ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryObject = Object.fromEntries(searchParams.entries());
      const validatedData = schema.parse(queryObject);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Query validation failed', 
            details: error.issues.map((err: z.ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
  
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format').optional(),
  
  licensePlate: z.string().min(1).max(20).optional(),
  
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  
  mileage: z.number().int().min(0).max(999999),
  
  price: z.number().min(0).max(999999.99),
  
  quantity: z.number().int().min(0).max(9999),
  
  date: z.string().datetime().or(z.date()),
  
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled', 'on-hold']),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  
  role: z.enum(['admin', 'mechanic', 'inspector']),
  
  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default(1),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(10),
    sort: z.string().optional(),
    direction: z.enum(['asc', 'desc']).default('desc')
  })
};
