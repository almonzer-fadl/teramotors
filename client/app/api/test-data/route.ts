import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import JobCard from '@/lib/models/JobCard'

export async function GET() {
  try {
    await connectToDatabase()
    
    const customers = await Customer.countDocuments({ isActive: true })
    const vehicles = await Vehicle.countDocuments({ isActive: true })
    const jobCards = await JobCard.countDocuments({ status: { $in: ['pending', 'in-progress'] } })
    
    return NextResponse.json({
      customers,
      vehicles,
      jobCards,
      message: 'Data fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching test data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
