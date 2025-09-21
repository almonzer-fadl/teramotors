import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Appointment from '@/lib/models/Appointment'
import JobCard from '@/lib/models/JobCard'
import Invoice from '@/lib/models/Invoice'
import Part from '@/lib/models/Part'

// GET /api/reports - Get report data (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
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

    // Get top services (mock data for now)
    const topServices = [
      { name: 'Oil Change', count: 45, revenue: 2250 },
      { name: 'Brake Service', count: 23, revenue: 3450 },
      { name: 'Engine Repair', count: 12, revenue: 4800 },
      { name: 'Transmission Service', count: 8, revenue: 3200 },
      { name: 'Tire Replacement', count: 15, revenue: 1800 }
    ]

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

    const reportData = {
      totalCustomers,
      totalVehicles,
      totalAppointments,
      totalJobs,
      totalRevenue,
      totalParts,
      monthlyRevenue,
      topServices,
      customerGrowth
    }

    return new Response(JSON.stringify(reportData))
  } catch (error) {
    console.error('Error fetching report data:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch report data' }), { status: 500 })
  }
}

// POST /api/reports/export - Export report (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Check if user is admin
    if ((session.user as any).role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), { status: 403 })
    }

    const body = await request.json()
    const { format, range } = body

    // For now, return a simple response
    // In a real implementation, you would generate PDF or Excel files
    const exportData = {
      message: `Report exported in ${format} format for ${range} days`,
      timestamp: new Date().toISOString(),
      format,
      range
    }

    return new Response(JSON.stringify(exportData))
  } catch (error) {
    console.error('Error exporting report:', error)
    return new Response(JSON.stringify({ error: 'Failed to export report' }), { status: 500 })
  }
}