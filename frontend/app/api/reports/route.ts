export const dynamic = 'force-dynamic'
import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Appointment from '@/lib/models/Appointment'
import Invoice from '@/lib/models/Invoice'
import Part from '@/lib/models/Part'
import Service from '@/lib/models/Service'
import JobCard from '@/lib/models/JobCard'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const range = parseInt(searchParams.get('range') || '30')
    
    const now = new Date()
    const startDate = new Date(now.getTime() - range * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all data in parallel
    const [
      customers,
      newCustomersThisMonth,
      vehicles,
      appointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsThisMonth,
      invoices,
      parts,
      lowStockParts,
      outOfStockParts,
      jobCards,
      services
    ] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ 
        isActive: true, 
        createdAt: { $gte: startOfMonth }
      }),
      Vehicle.countDocuments({ isActive: true }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ 
        appointmentDate: { $gte: startOfMonth }
      }),
      Invoice.find({ 
        status: 'paid',
        createdAt: { $gte: startDate }
      }),
      Part.find({ isActive: true }),
      Part.countDocuments({
        $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
      }),
      Part.countDocuments({ stockQuantity: 0 }),
      JobCard.find({ 
        createdAt: { $gte: startDate }
      }).populate('appointmentId', 'serviceId'),
      Service.find({ isActive: true })
    ])

    // Calculate revenue data
    const dailyRevenue = []
    const monthlyRevenue = []
    
    // Generate daily revenue data
    for (let i = range - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayInvoices = invoices.filter(inv => 
        inv.createdAt.toDateString() === date.toDateString()
      )
      const dayRevenue = dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
      
      dailyRevenue.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue
      })
    }

    // Generate monthly revenue data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthInvoices = invoices.filter(inv => 
        inv.createdAt >= month && inv.createdAt < nextMonth
      )
      const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
      
      monthlyRevenue.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      })
    }

    // Calculate customer growth
    const lastMonthCustomers = await Customer.countDocuments({
      isActive: true,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    })
    const customerGrowth = lastMonthCustomers > 0 
      ? ((newCustomersThisMonth - lastMonthCustomers) / lastMonthCustomers) * 100 
      : 0

    // Calculate popular services
    const serviceCounts: Record<string, number> = {}
    jobCards.forEach(jobCard => {
      if (jobCard.appointmentId?.serviceId) {
        const serviceId = jobCard.appointmentId.serviceId.toString()
        serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1
      }
    })

    const popularServices = services
      .map(service => ({
        name: service.name,
        count: serviceCounts[service._id.toString()] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate service revenue
    const serviceRevenue: Record<string, number> = {}
    invoices.forEach(invoice => {
      // This would need to be calculated based on actual service data
      // For now, we'll use a simplified approach
      serviceRevenue['General Service'] = (serviceRevenue['General Service'] || 0) + invoice.totalAmount
    })

    const serviceRevenueData = Object.entries(serviceRevenue).map(([name, revenue]) => ({
      name,
      revenue
    }))

    // Calculate inventory value
    const totalInventoryValue = parts.reduce((sum, part) => sum + (part.stockQuantity * part.cost), 0)

    // Calculate vehicles serviced this month
    const vehiclesServicedThisMonth = await Vehicle.countDocuments({
      'serviceHistory.date': { $gte: startOfMonth }
    })

    const reportData = {
      revenue: {
        daily: dailyRevenue,
        monthly: monthlyRevenue
      },
      customers: {
        total: customers,
        newThisMonth: newCustomersThisMonth,
        growth: Math.round(customerGrowth * 100) / 100
      },
      vehicles: {
        total: vehicles,
        servicedThisMonth: vehiclesServicedThisMonth
      },
      appointments: {
        total: appointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        thisMonth: appointmentsThisMonth
      },
      inventory: {
        totalParts: parts.length,
        lowStock: lowStockParts,
        outOfStock: outOfStockParts,
        totalValue: totalInventoryValue
      },
      services: {
        popular: popularServices,
        revenue: serviceRevenueData
      }
    }

    return Response.json(reportData)
  } catch (error) {
    console.error('Error generating reports:', error)
    // Return default report data when database is unavailable
    return Response.json({
      revenue: { total: 0, growth: 0, chart: [] },
      jobs: { total: 0, completed: 0, chart: [] },
      customers: { total: 0, new: 0, chart: [] },
      inventory: { lowStock: 0, totalValue: 0, chart: [] }
    })
  }
}
