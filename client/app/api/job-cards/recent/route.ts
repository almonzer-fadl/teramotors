import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import JobCard from '@/lib/models/JobCard'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Service from '@/lib/models/Service'

export async function GET() {
  try {
    await connectToDatabase()

    const recentJobCards = await JobCard.find({
      status: { $in: ['Created', 'In Progress'] }
    })
      .sort({ createdAt: -1 })
      .limit(9)
      .populate({
        path: 'customer',
        model: Customer,
        select: 'fullName'
      })
      .populate({
        path: 'vehicle',
        model: Vehicle,
        select: 'make model year'
      })
      .populate({
        path: 'services.service',
        model: Service,
        select: 'name'
      });

    return NextResponse.json(recentJobCards, { status: 200 })
  } catch (error) {
    console.error('Error fetching recent job cards:', error)
    return NextResponse.json({ message: 'Error fetching recent job cards' }, { status: 500 })
  }
}
