import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(10),
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('desc')
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Pagination helper for MongoDB queries
export function createPaginationQuery(params: PaginationParams) {
  const { page, limit, sort, direction } = params;
  
  const skip = (page - 1) * limit;
  const sortOrder = direction === 'asc' ? 1 : -1;
  
  return {
    skip,
    limit,
    sort: sort ? { [sort]: sortOrder } : { createdAt: -1 }
  };
}

// Pagination response helper
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
) {
  const { page, limit } = params;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
}

// Extract pagination params from request
export function extractPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);
  
  const params = {
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10',
    sort: searchParams.get('sort') || undefined,
    direction: (searchParams.get('direction') as 'asc' | 'desc') || 'desc'
  };
  
  return paginationSchema.parse(params);
}

// Pagination middleware for API routes
export function withPagination<T>(
  handler: (request: NextRequest, pagination: PaginationParams) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const pagination = extractPaginationParams(request);
      return await handler(request, pagination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Invalid pagination parameters', 
            details: error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message
            }))
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to process pagination' },
        { status: 500 }
      );
    }
  };
}

// Search and filter helper
export function createSearchQuery(searchTerm: string, fields: string[]) {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  
  return {
    $or: fields.map(field => ({
      [field]: searchRegex
    }))
  };
}

// Date range filter helper
export function createDateRangeQuery(
  startDate?: string,
  endDate?: string,
  field: string = 'createdAt'
) {
  const query: any = {};
  
  if (startDate || endDate) {
    query[field] = {};
    
    if (startDate) {
      query[field].$gte = new Date(startDate);
    }
    
    if (endDate) {
      query[field].$lte = new Date(endDate);
    }
  }
  
  return query;
}

// Status filter helper
export function createStatusQuery(status?: string, field: string = 'status') {
  return status ? { [field]: status } : {};
}

// Active records filter helper
export function createActiveQuery(active: boolean = true, field: string = 'isActive') {
  return { [field]: active };
}
