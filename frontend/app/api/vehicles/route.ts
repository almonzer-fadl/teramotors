import { connectToDatabase } from '@/lib/db'
import Vehicle from '@/lib/models/Vehicle'
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
    const search = searchParams.get('search')

    let query: any = { isActive: true }

    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { vin: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { licensePlate: searchRegex },
      ]
    }
    
    const vehicles = await Vehicle.find(query)
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 })

    return Response.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
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
    
    // Check if customer exists
    const customer = await Customer.findById(body.customerId)
    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 400 })
    }

    // Check if VIN already exists
    const existingVehicle = await Vehicle.findOne({ vin: body.vin })
    if (existingVehicle) {
      return Response.json({ error: 'Vehicle with this VIN already exists' }, { status: 400 })
    }

    // Check if license plate already exists
    const existingLicensePlate = await Vehicle.findOne({ licensePlate: body.licensePlate })
    if (existingLicensePlate) {
      return Response.json({ error: 'Vehicle with this license plate already exists' }, { status: 400 })
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
