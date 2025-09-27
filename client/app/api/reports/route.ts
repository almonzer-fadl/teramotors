import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "@/lib/auth-server";
import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Appointment from '@/lib/models/Appointment'
import JobCard from '@/lib/models/JobCard'
import Invoice from '@/lib/models/Invoice'
import Part from '@/lib/models/Part'
import Service from '@/lib/models/Service'

// GET /api/reports - Get report data (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Check if user is admin
    if ((session.user as any).role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30'
    
    await connectToDatabase()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(range))

    // Get basic counts
    const [
      totalCustomers,
      totalVehicles,
      totalAppointments,
      totalJobs,
      totalParts,
      invoices
    ] = await Promise.all([
      Customer.countDocuments(),
      Vehicle.countDocuments(),
      Appointment.countDocuments(),
      JobCard.countDocuments(),
      Part.countDocuments(),
      Invoice.find({ createdAt: { $gte: startDate, $lte: endDate } })
    ])

    // Calculate total revenue
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)

    // Generate monthly revenue data (last 12 months)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthInvoices = await Invoice.find({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      })
      
      const monthRevenue = monthInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      })
    }

    // Get top services from job cards
    const jobCards = await JobCard.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('services.serviceId', 'name description laborHours laborRate')

    const serviceStats = new Map()
    
    jobCards.forEach(jobCard => {
      jobCard.services.forEach((service: { serviceId: { name: any; }; quantity: number; laborHours: number; laborRate: number; }) => {
        if (service.serviceId && typeof service.serviceId === 'object') {
          const serviceName = service.serviceId.name
          const quantity = service.quantity || 1
          const laborHours = service.laborHours || 0
          const laborRate = service.laborRate || 0
          const revenue = quantity * laborHours * laborRate
          
          if (serviceStats.has(serviceName)) {
            const existing = serviceStats.get(serviceName)
            existing.count += quantity
            existing.revenue += revenue
          } else {
            serviceStats.set(serviceName, {
              name: serviceName,
              count: quantity,
              revenue: revenue
            })
          }
        }
      })
    })

    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Generate customer growth data (last 12 months)
    const customerGrowth = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthCustomers = await Customer.countDocuments({
        createdAt: { $lte: monthEnd }
      })
      
      customerGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        customers: monthCustomers
      })
    }

    // Get mechanic productivity data
    const mechanicStats = new Map()
    jobCards.forEach(jobCard => {
      if (jobCard.mechanicId && typeof jobCard.mechanicId === 'object') {
        const mechanicName = jobCard.mechanicId.fullName || 'Unknown'
        const jobDuration = jobCard.actualStartTime && jobCard.actualEndTime 
          ? (new Date(jobCard.actualEndTime).getTime() - new Date(jobCard.actualStartTime).getTime()) / (1000 * 60 * 60) // hours
          : 0
        
        if (mechanicStats.has(mechanicName)) {
          const existing = mechanicStats.get(mechanicName)
          existing.jobsCompleted += 1
          existing.totalHours += jobDuration
        } else {
          mechanicStats.set(mechanicName, {
            name: mechanicName,
            jobsCompleted: 1,
            totalHours: jobDuration
          })
        }
      }
    })

    const topMechanics = Array.from(mechanicStats.values())
      .sort((a, b) => b.jobsCompleted - a.jobsCompleted)
      .slice(0, 5)

    // Get job status distribution
    const jobStatusStats = await JobCard.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const jobStatusDistribution = jobStatusStats.map(stat => ({
      status: stat._id,
      count: stat.count
    }))

    // Get average job completion time
    const completedJobs = await JobCard.find({
      actualStartTime: { $exists: true },
      actualEndTime: { $exists: true },
      createdAt: { $gte: startDate, $lte: endDate }
    })

    const totalCompletionTime = completedJobs.reduce((sum, job) => {
      const start = new Date(job.actualStartTime).getTime()
      const end = new Date(job.actualEndTime).getTime()
      return sum + (end - start) / (1000 * 60 * 60) // hours
    }, 0)

    const averageJobCompletionTime = completedJobs.length > 0 
      ? totalCompletionTime / completedJobs.length 
      : 0

    const reportData = {
      totalCustomers,
      totalVehicles,
      totalAppointments,
      totalJobs,
      totalRevenue,
      totalParts,
      monthlyRevenue,
      topServices,
      customerGrowth,
      topMechanics,
      jobStatusDistribution,
      averageJobCompletionTime: Math.round(averageJobCompletionTime * 100) / 100,
      completedJobs: completedJobs.length
    }

    return new Response(JSON.stringify(reportData))
  } catch (error) {
    console.error('Error fetching report data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch report data' }), { status: 500 })
  }
}
