import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'createdAt'
    const direction = searchParams.get('direction') || 'desc'

    let query: any = { isActive: true }

    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ]
    }

    const sortOptions: { [key: string]: any } = {};
    if (sort === 'name') {
      sortOptions.firstName = direction;
      sortOptions.lastName = direction;
    } else {
      sortOptions[sort] = direction;
    }
    
    const customers = await Customer.find(query)
      .populate('vehicles', 'make model year licensePlate')
      .sort(sortOptions)

    // Add vehicle count to each customer
    const customersWithVehicleCount = customers.map(customer => ({
      ...customer.toObject(),
      vehicles: customer.vehicles.length
    }))

    return Response.json(customersWithVehicleCount)
  } catch (error) {
    console.error('Error fetching customers:', error)
    // Return empty array when database is unavailable
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const body = await request.json()
    
    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ email: body.email })
    if (existingCustomer) {
      return Response.json({ error: 'Customer with this email already exists' }, { status: 400 })
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

    return Response.json({ 
      success: true, 
      customer: {
        ...customer.toObject(),
        vehicles: 0
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return Response.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
