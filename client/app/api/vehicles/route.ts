import { connectToDatabase } from '@/lib/db'
import Vehicle from '@/lib/models/Vehicle'
import Customer from '@/lib/models/Customer'
import { getServerSession } from "@/lib/auth-server";
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const query: any = { isActive: true }

    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { vin: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { licensePlate: searchRegex },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get total count for pagination
    const totalCount = await Vehicle.countDocuments(query)
    
    const vehicles = await Vehicle.find(query)
      .populate('customerId', 'firstName lastName isActive')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean() // Use lean() for better performance

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Log for debugging
    console.log(`Fetched ${vehicles.length} vehicles, ${vehicles.filter(v => v.customerId).length} with customers`)
    console.log('Sample vehicle data:', vehicles.slice(0, 2).map(v => ({
      id: v._id,
      make: v.make,
      model: v.model,
      customerId: v.customerId,
      customerName: v.customerId ? `${v.customerId.firstName} ${v.customerId.lastName}` : 'No Customer'
    })))

    return Response.json({
      vehicles,
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
    console.error('Error fetching vehicles:', error)
    // Return empty array when database is unavailable
    return Response.json({
      vehicles: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    
    const body = await request.json()
    
    if (body.vin === '') {
      body.vin = null;
    }
    if (body.licensePlate === '') {
      body.licensePlate = null;
    }
    
    // Check if customer exists
    const customer = await Customer.findById(body.customerId)
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 400 })
    }

    // Check if VIN already exists for a different vehicle
    if (body.vin) {
      const existingVehicle = await Vehicle.findOne({ vin: body.vin });
      if (existingVehicle) {
        return Response.json({ message: 'Vehicle with this VIN already exists' }, { status: 400 });
      }
    }

    // Check if license plate already exists for a different vehicle
    if (body.licensePlate) {
      const existingLicensePlate = await Vehicle.findOne({ licensePlate: body.licensePlate });
      if (existingLicensePlate) {
        return Response.json({ message: 'Vehicle with this license plate already exists' }, { status: 400 });
      }
    }

    const vehicle = new Vehicle({
      customerId: body.customerId,
      vin: body.vin,
      make: body.make,
      model: body.model,
      year: body.year,
      color: body.color,
      licensePlate: body.licensePlate,
      mileage: body.mileage,
      engineType: body.engineType,
      transmission: body.transmission,
      fuelType: body.fuelType,
      photos: body.photos || []
    })

    await vehicle.save()

    // Add vehicle to customer's vehicles array
    await Customer.findByIdAndUpdate(body.customerId, {
      $push: { vehicles: vehicle._id }
    })

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('customerId', 'firstName lastName')

    return Response.json({ 
      success: true, 
      vehicle: populatedVehicle
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return Response.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
