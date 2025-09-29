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
import Payment from '@/lib/models/Payment'

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
      invoices,
      payments
    ] = await Promise.all([
      Customer.countDocuments(),
      Vehicle.countDocuments(),
      Appointment.countDocuments(),
      JobCard.countDocuments(),
      Part.countDocuments(),
      Invoice.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .populate('customerId', 'firstName lastName'),
      Payment.find({ paymentDate: { $gte: startDate, $lte: endDate } })
    ])

    // Calculate total revenue - handle missing total values
    const totalRevenue = invoices.reduce((sum, invoice) => {
      // If total is missing, calculate from subtotal + tax
      const invoiceTotal = invoice.total || (invoice.subtotal || 0) + (invoice.tax || 0)
      return sum + invoiceTotal
    }, 0)

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
      
      const monthRevenue = monthInvoices.reduce((sum, invoice) => {
        const invoiceTotal = invoice.total || (invoice.subtotal || 0) + (invoice.tax || 0)
        return sum + invoiceTotal
      }, 0)
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      })
    }

    // Get top services from job cards
    const jobCards = await JobCard.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate({
      path: 'services.serviceId',
      model: 'Service',
      select: 'name description laborHours laborRate'
    })

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

    // Calculate financial metrics
    const totalExpenses = totalRevenue * 0.7 // Estimated 70% expenses
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    
    // Calculate revenue breakdown
    const serviceRevenue = totalRevenue * 0.6
    const partsRevenue = totalRevenue * 0.3
    const laborRevenue = totalRevenue * 0.4
    const otherRevenue = totalRevenue * 0.1
    
    // Calculate payment methods from real payments data
    const paymentMethods = {
      cash: 0,
      card: 0,
      bank_transfer: 0,
      check: 0
    }
    
    payments.forEach(payment => {
      const method = payment.paymentMethod?.toLowerCase()
      if (method === 'cash') paymentMethods.cash += payment.amount || 0
      else if (method === 'card' || method === 'credit_card') paymentMethods.card += payment.amount || 0
      else if (method === 'bank_transfer' || method === 'bank_transfer') paymentMethods.bank_transfer += payment.amount || 0
      else if (method === 'check') paymentMethods.check += payment.amount || 0
    })
    
    const cashPayments = paymentMethods.cash
    const cardPayments = paymentMethods.card
    const bankTransferPayments = paymentMethods.bank_transfer
    const checkPayments = paymentMethods.check
    
    // Calculate outstanding invoices
    const outstandingInvoices = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => {
      const invoiceTotal = inv.total || (inv.subtotal || 0) + (inv.tax || 0)
      return sum + invoiceTotal
    }, 0)
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length
    
    // Calculate top customers by revenue
    const customerRevenueMap = new Map()
    invoices.forEach(invoice => {
      const customerName = invoice.customerId ? `${invoice.customerId.firstName} ${invoice.customerId.lastName}` : 'Unknown'
      const revenue = invoice.total || (invoice.subtotal || 0) + (invoice.tax || 0)
      if (customerRevenueMap.has(customerName)) {
        customerRevenueMap.set(customerName, {
          revenue: customerRevenueMap.get(customerName).revenue + revenue,
          jobs: customerRevenueMap.get(customerName).jobs + 1
        })
      } else {
        customerRevenueMap.set(customerName, { revenue, jobs: 1 })
      }
    })
    
    const topCustomers = Array.from(customerRevenueMap.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        jobs: data.jobs
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Calculate monthly profit data
    const monthlyProfit = monthlyRevenue.map(month => ({
      month: month.month,
      profit: month.revenue * 0.3, // 30% profit margin
      margin: 30
    }))

    const reportData = {
      // Financial Summary
      totalRevenue,
      totalExpenses,
      netProfit,
      grossProfit: totalRevenue * 0.6,
      profitMargin,
      
      // Revenue Breakdown
      serviceRevenue,
      partsRevenue,
      laborRevenue,
      otherRevenue,
      
      // Payment Methods
      cashPayments,
      cardPayments,
      bankTransferPayments,
      checkPayments,
      
      // Monthly Data
      monthlyRevenue: monthlyRevenue.map(month => ({
        month: month.month,
        revenue: month.revenue,
        expenses: month.revenue * 0.7,
        profit: month.revenue * 0.3
      })),
      monthlyProfit,
      
      // Top Revenue Sources
      topServices: topServices.map(service => ({
        name: service.name,
        revenue: service.revenue,
        count: service.count,
        avgPrice: service.revenue / service.count
      })),
      topCustomers,
      
      // Financial Health
      outstandingInvoices,
      overdueInvoices,
      averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
      collectionRate: 95.5, // Mock data
      
      // Growth Metrics
      revenueGrowth: 12.5, // Mock data
      profitGrowth: 8.3, // Mock data
      customerGrowth: 15.2 // Mock data
    }

    return new Response(JSON.stringify(reportData))
  } catch (error) {
    console.error('Error fetching report data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch report data' }), { status: 500 })
  }
}
