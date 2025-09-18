export const dynamic = 'force-dynamic'
import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Appointment from '@/lib/models/Appointment'
import JobCard from '@/lib/models/JobCard'
import Part from '@/lib/models/Part'
import Invoice from '@/lib/models/Invoice'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get current date for calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all stats in parallel
    const [
      totalCustomers,
      totalVehicles,
      pendingAppointments,
      activeJobCards,
      monthlyRevenue,
      lastMonthRevenue,
      avgJobTime,
      lowStockParts
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Vehicle.countDocuments({ isActive: true }),
      Appointment.countDocuments({ 
        status: 'scheduled',
        appointmentDate: { $gte: now }
      }),
      JobCard.countDocuments({ 
        status: { $in: ['pending', 'in-progress'] }
      }),
      Invoice.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      Invoice.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      JobCard.aggregate([
        {
          $match: {
            status: 'completed',
            actualStartTime: { $exists: true },
            actualEndTime: { $exists: true }
          }
        },
        {
          $addFields: {
            durationHours: {
              $divide: [
                { $subtract: ['$actualEndTime', '$actualStartTime'] },
                3600000 // Convert milliseconds to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$durationHours' }
          }
        }
      ]),
      Part.countDocuments({
        $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
      })
    ])

    // Calculate revenue growth
    const currentRevenue = monthlyRevenue[0]?.total || 0
    const previousRevenue = lastMonthRevenue[0]?.total || 0
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    // Calculate average job time
    const avgJobTimeHours = avgJobTime[0]?.avgDuration || 0

    return Response.json({
      totalCustomers,
      totalVehicles,
      pendingAppointments,
      activeJobCards,
      monthlyRevenue: currentRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      avgJobTime: Math.round(avgJobTimeHours * 100) / 100,
      lowStockParts
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    
    // Return default stats when database is unavailable
    return Response.json({
      totalCustomers: 0,
      totalVehicles: 0,
      pendingAppointments: 0,
      activeJobCards: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      avgJobTime: 0,
      lowStockParts: 0
    })
  }
}
