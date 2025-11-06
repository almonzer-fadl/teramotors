import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import { getServerSession } from "@/lib/auth-server";
import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners'

export async function GET(request: NextRequest) {
  try {
    // Try to authenticate; if AUTH_SECRET is set and no session, reject
    let session: any = null
    try {
      session = await getServerSession()
    } catch (e) {
      // auth not configured; allow in dev/non-auth environments
    }
    if (process.env.AUTH_SECRET && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query with search
    const query: any = { isActive: true }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get total count for pagination
    const totalCount = await Customer.countDocuments(query)

    // Get customers with pagination
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean() // Use lean() for better performance

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const body = await request.json()
    
    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ email: body.email })
    if (existingCustomer) {
      return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 400 })
    }

    const customer = new Customer({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      phoneNumber: body.phoneNumber || body.phone, // Use phoneNumber if provided, otherwise use phone
      whatsappEnabled: body.whatsappEnabled !== false, // Default to true
      language: body.language || 'ar', // Default to Arabic
      address: body.address,
      vatNumber: body.vatNumber,
      idNumber: body.idNumber,
      companyName: body.companyName,
      notes: body.notes,
      vehicles: []
    })

    await customer.save()

    // Send welcome WhatsApp message
    try {
      const whatsappListeners = WhatsAppEventListeners.getInstance();
      await whatsappListeners.onCustomerCreated(customer._id.toString());
    } catch (whatsappError) {
      console.error('Error sending welcome WhatsApp message:', whatsappError);
      // Don't fail the customer creation if WhatsApp fails
    }

    return NextResponse.json({ 
      success: true, 
      customer: {
        ...customer.toObject(),
        vehicles: 0
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
