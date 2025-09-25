import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { withPagination, createPaginatedResponse, createSearchQuery } from '@/lib/middleware/pagination'
import { withCache, generateCacheKey } from '@/lib/middleware/cache'
import { asyncHandler, createError, measureApiPerformance } from '@/lib/middleware/error-handling'

export const GET = withCache(
  withPagination(async (request: NextRequest, pagination) => {
    return measureApiPerformance('customers-list', async () => {
      // Try to authenticate; if AUTH_SECRET is set and no session, reject
      let session: any = null
      try {
        session = await auth()
      } catch (e) {
        // auth not configured; allow in dev/non-auth environments
      }
      if (process.env.AUTH_SECRET && !session) {
        throw createError.authentication()
      }

      await connectToDatabase()

      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search') || ''

      // Build query with search
      const query: any = { isActive: true }
      if (search) {
        Object.assign(query, createSearchQuery(search, ['firstName', 'lastName', 'email']))
      }

      // Get total count for pagination
      const total = await Customer.countDocuments(query)

      // Get paginated results using aggregation
      const customers = await Customer.aggregate([
        { $match: query },
        {
          $addFields: {
            vehicles: { $size: "$vehicles" }
          }
        },
        {
          $sort: pagination.sort
            ? { [pagination.sort]: pagination.direction === 'asc' ? 1 : -1 }
            : { createdAt: -1 }
        },
        { $skip: (pagination.page - 1) * pagination.limit },
        { $limit: pagination.limit }
      ]);

      return NextResponse.json(createPaginatedResponse(customers, total, pagination))
    })
  }),
  {
    ttl: 300000, // 5 minutes cache
    keyGenerator: (request) => {
      const { searchParams } = new URL(request.url)
      return generateCacheKey('customers', {
        search: searchParams.get('search') || '',
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
        sort: searchParams.get('sort') || 'createdAt',
        direction: searchParams.get('direction') || 'desc'
      })
    }
  }
)

export const POST = asyncHandler(async (request: NextRequest) => {
  return measureApiPerformance('customers-create', async () => {
    const session = await auth()
    if (!session) {
      throw createError.authentication()
    }

    await connectToDatabase()
    
    const body = await request.json()
    
    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ email: body.email })
    if (existingCustomer) {
      throw createError.conflict('Customer with this email already exists')
    }

    const customer = new Customer({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      emergencyContact: body.emergencyContact,
      notes: body.notes,
      vehicles: []
    })

    await customer.save()

    return NextResponse.json({ 
      success: true, 
      customer: {
        ...customer.toObject(),
        vehicles: 0
      }
    }, { status: 201 })
  })
})
