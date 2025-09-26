import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import { getServerSession } from "@/lib/auth-server";
import { NextRequest, NextResponse } from 'next/server'

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

    // Build query with search
    const query: any = { isActive: true }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json(customers)
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
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
