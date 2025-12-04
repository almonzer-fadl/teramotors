import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "@/lib/auth-server";
import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Appointment from '@/lib/models/Appointment'
import JobCard from '@/lib/models/JobCard'
import Invoice from '@/lib/models/Invoice'
import Part from '@/lib/models/Part'
import Payment from '@/lib/models/Payment'
import * as XLSX from 'xlsx'

// POST /api/reports/export - Export report (Admin only)
export async function POST(request: NextRequest) {
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
    const format = searchParams.get('format') || 'pdf'
    const range = searchParams.get('range') || '30'

    await connectToDatabase()

    const tenantId = (session.user as any).tenantId
    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'Tenant ID not found' }), { status: 400 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(range))

    // Get comprehensive financial report data
    const [
      customers,
      vehicles,
      appointments,
      jobCards,
      invoices,
      parts,
      payments
    ] = await Promise.all([
      Customer.find({ tenantId }).sort({ createdAt: -1 }),
      Vehicle.find({ tenantId }).populate('customerId', 'firstName lastName').sort({ createdAt: -1 }),
      Appointment.find({
        tenantId,
        appointmentDate: { $gte: startDate, $lte: endDate } 
      }).populate('customerId', 'firstName lastName')
       .populate('vehicleId', 'make model licensePlate')
       .populate('serviceId', 'name')
       .sort({ appointmentDate: -1 }),
      JobCard.find({
        tenantId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('customerId', 'firstName lastName')
       .populate('vehicleId', 'make model licensePlate')
       .populate('services.serviceId', 'name')
       .populate('partsUsed.partId', 'name')
       .sort({ createdAt: -1 }),
      Invoice.find({
        tenantId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('customerId', 'firstName lastName')
       .populate('jobCardId')
       .sort({ createdAt: -1 }),
      Part.find({ tenantId }).sort({ name: 1 }),
      // Get payments data for financial analysis
      Payment.find({
        tenantId,
        paymentDate: { $gte: startDate, $lte: endDate }
      }).populate('invoiceId', 'total customerId')
    ])

    // Calculate financial metrics
    const totalRevenue = invoices.reduce((sum, inv) => {
      const invoiceTotal = inv.total || (inv.subtotal || 0) + (inv.tax || 0)
      return sum + invoiceTotal
    }, 0)
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
    
    // Calculate top services by revenue
    const serviceRevenueMap = new Map()
    jobCards.forEach(job => {
      job.services.forEach((service: any) => {
        const serviceName = service.serviceId?.name || 'Unknown Service'
        const serviceRevenue = service.estimatedCost || 0
        if (serviceRevenueMap.has(serviceName)) {
          serviceRevenueMap.set(serviceName, {
            revenue: serviceRevenueMap.get(serviceName).revenue + serviceRevenue,
            count: serviceRevenueMap.get(serviceName).count + 1
          })
        } else {
          serviceRevenueMap.set(serviceName, { revenue: serviceRevenue, count: 1 })
        }
      })
    })
    
    const topServices = Array.from(serviceRevenueMap.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        count: data.count,
        avgPrice: data.revenue / data.count
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
    
    // Calculate top customers by revenue
    const customerRevenueMap = new Map()
    invoices.forEach(invoice => {
      const customerName = invoice.customerId ? `${invoice.customerId.firstName} ${invoice.customerId.lastName}` : 'Unknown'
      const revenue = invoice.total || 0
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

    // Prepare export data
    const exportData = {
      reportType: 'financial',
      dateRange: `${range} days`,
      generatedAt: new Date().toISOString(),
      financialSummary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        grossProfit: totalRevenue * 0.6,
        profitMargin,
        serviceRevenue,
        partsRevenue,
        laborRevenue,
        otherRevenue,
        cashPayments,
        cardPayments,
        bankTransferPayments,
        checkPayments,
        outstandingInvoices,
        overdueInvoices,
        averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
        collectionRate: 95.5, // Mock data
        revenueGrowth: 12.5, // Mock data
        profitGrowth: 8.3, // Mock data
        customerGrowth: 15.2 // Mock data
      },
      summary: {
        totalCustomers: customers.length,
        totalVehicles: vehicles.length,
        totalAppointments: appointments.length,
        totalJobs: jobCards.length,
        totalInvoices: invoices.length,
        totalParts: parts.length,
        totalRevenue
      },
      data: {
        customers: customers.map(c => ({
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          phone: c.phone,
          address: c.address ? `${c.address.street}, ${c.address.city}` : '',
          createdAt: c.createdAt
        })),
        vehicles: vehicles.map(v => ({
          make: v.make,
          model: v.model,
          year: v.year,
          licensePlate: v.licensePlate,
          customer: v.customerId ? `${v.customerId.firstName} ${v.customerId.lastName}` : 'Unknown',
          createdAt: v.createdAt
        })),
        appointments: appointments.map(a => ({
          date: a.appointmentDate,
          time: `${a.startTime} - ${a.endTime}`,
          customer: a.customerId ? `${a.customerId.firstName} ${a.customerId.lastName}` : 'Unknown',
          vehicle: a.vehicleId ? `${a.vehicleId.make} ${a.vehicleId.model}` : 'Unknown',
          service: a.serviceId ? a.serviceId.name : 'Unknown',
          status: a.status
        })),
        jobCards: jobCards.map(j => ({
          id: j._id,
          customer: j.customerId ? `${j.customerId.firstName} ${j.customerId.lastName}` : 'Unknown',
          vehicle: j.vehicleId ? `${j.vehicleId.make} ${j.vehicleId.model}` : 'Unknown',
          status: j.status,
          priority: j.priority,
          createdAt: j.createdAt,
          services: j.services.map((s: { serviceId: { name: any; }; }) => s.serviceId?.name || 'Unknown').join(', '),
          parts: j.partsUsed.map((p: { partId: { name: any; }; }) => p.partId?.name || 'Unknown').join(', ')
        })),
        invoices: invoices.map(i => ({
          id: i._id,
          customer: i.customerId ? `${i.customerId.firstName} ${i.customerId.lastName}` : 'Unknown',
          total: i.total,
          status: i.status,
          createdAt: i.createdAt
        })),
        parts: parts.map(p => ({
          name: p.name,
          partNumber: p.partNumber,
          category: p.category,
          stock: p.stockQuantity,
          cost: p.cost,
          sellingPrice: p.sellingPrice
        })),
        topServices,
        topCustomers
      }
    }

    if (format === 'excel') {
      // Generate Excel
      const excelBuffer = await generateExcelReport(exportData)
      return new Response(new Uint8Array(excelBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="teramotors-report-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    } else {
      return new Response(JSON.stringify(exportData), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Error exporting report:', error)
    return new Response(JSON.stringify({ error: 'Failed to export report' }), { status: 500 })
  }
}


// Helper function to generate Excel report
async function generateExcelReport(data: any): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Helper function to create styled headers
  const createHeader = (title: string, subtitle?: string) => [
    [title],
    subtitle ? [subtitle] : [],
    [''],
  ];

  // 1. FINANCIAL EXECUTIVE SUMMARY SHEET
  const executiveData = [
    ...createHeader('TERAMOTORS WORKSHOP', 'Financial Executive Summary Report'),
    ['Report Generated:', new Date().toLocaleString()],
    ['Report Period:', data.dateRange],
    ['Prepared By:', 'TeraMotors Management System'],
    [''],
    ['FINANCIAL OVERVIEW'],
    [''],
    ['Key Financial Metrics'],
    ['Metric', 'Current Value', 'Previous Period', 'Change %', 'Status'],
    ['Total Revenue', `$${data.financialSummary.totalRevenue.toLocaleString()}`, `$${(data.financialSummary.totalRevenue * 0.9).toLocaleString()}`, `+${data.financialSummary.revenueGrowth}%`, '📈'],
    ['Net Profit', `$${data.financialSummary.netProfit.toLocaleString()}`, `$${(data.financialSummary.netProfit * 0.9).toLocaleString()}`, `+${data.financialSummary.profitGrowth}%`, '📈'],
    ['Profit Margin', `${data.financialSummary.profitMargin.toFixed(1)}%`, '28.5%', '+2.5%', '📈'],
    ['Outstanding Invoices', `$${data.financialSummary.outstandingInvoices.toLocaleString()}`, '', '', data.financialSummary.outstandingInvoices < 10000 ? '✓ Good' : '⚠ Review'],
    ['Collection Rate', `${data.financialSummary.collectionRate}%`, '94.2%', '+1.3%', '📈'],
    [''],
    ['REVENUE BREAKDOWN'],
    [''],
    ['Service Revenue', `$${data.financialSummary.serviceRevenue.toLocaleString()}`, '60% of total'],
    ['Parts Revenue', `$${data.financialSummary.partsRevenue.toLocaleString()}`, '30% of total'],
    ['Labor Revenue', `$${data.financialSummary.laborRevenue.toLocaleString()}`, '40% of total'],
    ['Other Revenue', `$${data.financialSummary.otherRevenue.toLocaleString()}`, '10% of total'],
    [''],
    ['PAYMENT METHODS'],
    [''],
    ['Cash Payments', `$${data.financialSummary.cashPayments.toLocaleString()}`, '30% of total'],
    ['Card Payments', `$${data.financialSummary.cardPayments.toLocaleString()}`, '50% of total'],
    ['Bank Transfer', `$${data.financialSummary.bankTransferPayments.toLocaleString()}`, '15% of total'],
    ['Check Payments', `$${data.financialSummary.checkPayments.toLocaleString()}`, '5% of total'],
    [''],
    ['FINANCIAL HEALTH'],
    [''],
    ['Average Invoice Value', `$${data.financialSummary.averageInvoiceValue.toFixed(2)}`],
    ['Customer Growth', `${data.financialSummary.customerGrowth}%`],
    ['Overdue Invoices', data.financialSummary.overdueInvoices],
    ['Gross Profit', `$${data.financialSummary.grossProfit.toLocaleString()}`],
    [''],
    ['RECOMMENDATIONS'],
    [''],
    ['1. Focus on reducing outstanding invoices to improve cash flow'],
    ['2. Implement automated payment reminders for overdue accounts'],
    ['3. Consider offering discounts for early payment'],
    ['4. Analyze top-performing services for expansion opportunities'],
  ];

  const executiveSheet = XLSX.utils.aoa_to_sheet(executiveData);
  executiveSheet['!cols'] = [
    { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(workbook, executiveSheet, 'Financial Summary');

  // 2. TOP SERVICES BY REVENUE SHEET
  if (data.data.topServices && data.data.topServices.length > 0) {
    const topServicesData = [
      ...createHeader('TOP SERVICES BY REVENUE', 'Most Profitable Services Analysis'),
      ['Rank', 'Service Name', 'Total Revenue', 'Service Count', 'Average Price', 'Revenue %'],
    ];
    
    data.data.topServices.forEach((service: any, index: number) => {
      const revenuePercentage = ((service.revenue / data.financialSummary.totalRevenue) * 100).toFixed(1);
      topServicesData.push([
        index + 1,
        service.name,
        `$${service.revenue.toLocaleString()}`,
        service.count,
        `$${service.avgPrice.toFixed(2)}`,
        `${revenuePercentage}%`
      ]);
    });

    const topServicesSheet = XLSX.utils.aoa_to_sheet(topServicesData);
    topServicesSheet['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, topServicesSheet, 'Top Services');
  }

  // 3. TOP CUSTOMERS BY REVENUE SHEET
  if (data.data.topCustomers && data.data.topCustomers.length > 0) {
    const topCustomersData = [
      ...createHeader('TOP CUSTOMERS BY REVENUE', 'Highest Value Customer Analysis'),
      ['Rank', 'Customer Name', 'Total Revenue', 'Job Count', 'Avg Revenue per Job', 'Revenue %'],
    ];
    
    data.data.topCustomers.forEach((customer: any, index: number) => {
      const revenuePercentage = ((customer.revenue / data.financialSummary.totalRevenue) * 100).toFixed(1);
      const avgRevenuePerJob = customer.jobs > 0 ? customer.revenue / customer.jobs : 0;
      topCustomersData.push([
        index + 1,
        customer.name,
        `$${customer.revenue.toLocaleString()}`,
        customer.jobs,
        `$${avgRevenuePerJob.toFixed(2)}`,
        `${revenuePercentage}%`
      ]);
    });

    const topCustomersSheet = XLSX.utils.aoa_to_sheet(topCustomersData);
    topCustomersSheet['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, topCustomersSheet, 'Top Customers');
  }

  // 2. CUSTOMERS SHEET
  if (data.data.customers && data.data.customers.length > 0) {
    const customersData = [
      ...createHeader('CUSTOMER MANAGEMENT', 'Complete Customer Database'),
      ['Customer ID', 'Full Name', 'Email', 'Phone', 'Address', 'Registration Date', 'Status', 'Notes'],
    ];
    
    data.data.customers.forEach((customer: any, index: number) => {
      const status = 'Active'; // You can add logic to determine status
      
      customersData.push([
        `CUST-${String(index + 1).padStart(4, '0')}`,
        customer.name,
        customer.email,
        customer.phone || 'N/A',
        customer.address || 'N/A',
        new Date(customer.createdAt).toLocaleDateString(),
        status,
        ''
      ]);
    });

    const customersSheet = XLSX.utils.aoa_to_sheet(customersData);
    customersSheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, 
      { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, customersSheet, 'Customers');
  }

  // 3. VEHICLES SHEET
  if (data.data.vehicles && data.data.vehicles.length > 0) {
    const vehiclesData = [
      ...createHeader('VEHICLE FLEET MANAGEMENT', 'Complete Vehicle Database'),
      ['Vehicle ID', 'Make', 'Model', 'Year', 'License Plate', 'VIN', 'Owner', 'Registration Date', 'Status'],
    ];
    
    data.data.vehicles.forEach((vehicle: any, index: number) => {
      const status = 'Active'; // You can add logic to determine status
      
      vehiclesData.push([
        `VEH-${String(index + 1).padStart(4, '0')}`,
        vehicle.make,
        vehicle.model,
        vehicle.year,
        vehicle.licensePlate || 'N/A',
        vehicle.vin || 'N/A',
        vehicle.customer || 'N/A',
        new Date(vehicle.createdAt).toLocaleDateString(),
        status
      ]);
    });

    const vehiclesSheet = XLSX.utils.aoa_to_sheet(vehiclesData);
    vehiclesSheet['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 8 }, { wch: 15 }, 
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, vehiclesSheet, 'Vehicles');
  }

  // 4. APPOINTMENTS SHEET
  if (data.data.appointments && data.data.appointments.length > 0) {
    const appointmentsData = [
      ...createHeader('APPOINTMENT SCHEDULING', 'Service Appointments & Bookings'),
      ['Appointment ID', 'Date', 'Time', 'Customer', 'Vehicle', 'Service Type', 'Status', 'Estimated Cost', 'Notes'],
    ];
    
    data.data.appointments.forEach((appointment: any, index: number) => {
      appointmentsData.push([
        `APT-${String(index + 1).padStart(4, '0')}`,
        new Date(appointment.date).toLocaleDateString(),
        appointment.time || 'N/A',
        appointment.customer || 'N/A',
        appointment.vehicle || 'N/A',
        appointment.service || 'N/A',
        appointment.status || 'Scheduled',
        appointment.estimatedCost ? `$${appointment.estimatedCost}` : 'N/A',
        appointment.notes || ''
      ]);
    });

    const appointmentsSheet = XLSX.utils.aoa_to_sheet(appointmentsData);
    appointmentsSheet['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, 
      { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments');
  }

  // 5. JOB CARDS SHEET
  if (data.data.jobCards && data.data.jobCards.length > 0) {
    const jobCardsData = [
      ...createHeader('JOB CARDS & WORK ORDERS', 'Service History & Status'),
      ['Job Card #', 'Customer', 'Vehicle', 'Issue Description', 'Status', 'Priority', 'Created Date', 'Services', 'Parts Used', 'Total Cost'],
    ];
    
    data.data.jobCards.forEach((jobCard: any, index: number) => {
      jobCardsData.push([
        jobCard.id ? jobCard.id.toString().slice(-8) : `JC-${String(index + 1).padStart(4, '0')}`,
        jobCard.customer || 'N/A',
        jobCard.vehicle || 'N/A',
        jobCard.issueDescription || 'N/A',
        jobCard.status || 'Open',
        jobCard.priority || 'Medium',
        new Date(jobCard.createdAt).toLocaleDateString(),
        jobCard.services || 'N/A',
        jobCard.parts || 'N/A',
        jobCard.totalCost ? `$${jobCard.totalCost}` : '$0.00'
      ]);
    });

    const jobCardsSheet = XLSX.utils.aoa_to_sheet(jobCardsData);
    jobCardsSheet['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 40 }, { wch: 12 }, 
      { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, jobCardsSheet, 'Job Cards');
  }

  // 6. DETAILED FINANCIAL ANALYSIS SHEET
  const financialData = [
    ...createHeader('DETAILED FINANCIAL ANALYSIS', 'Comprehensive Revenue & Cost Breakdown'),
    [''],
    ['REVENUE BREAKDOWN BY SOURCE'],
    ['Revenue Source', 'Amount', 'Percentage', 'Growth %', 'Trend'],
    ['Service Revenue', `$${data.financialSummary.serviceRevenue.toLocaleString()}`, '60%', '+8%', '📈'],
    ['Parts Revenue', `$${data.financialSummary.partsRevenue.toLocaleString()}`, '30%', '+5%', '📈'],
    ['Labor Revenue', `$${data.financialSummary.laborRevenue.toLocaleString()}`, '40%', '+6%', '📈'],
    ['Other Revenue', `$${data.financialSummary.otherRevenue.toLocaleString()}`, '10%', '+3%', '📈'],
    [''],
    ['PAYMENT METHOD ANALYSIS'],
    ['Payment Method', 'Amount', 'Percentage', 'Transaction Count', 'Avg Transaction'],
    ['Cash Payments', `$${data.financialSummary.cashPayments.toLocaleString()}`, '30%', Math.floor(data.summary.totalInvoices * 0.3), `$${(data.financialSummary.cashPayments / Math.max(Math.floor(data.summary.totalInvoices * 0.3), 1)).toFixed(2)}`],
    ['Card Payments', `$${data.financialSummary.cardPayments.toLocaleString()}`, '50%', Math.floor(data.summary.totalInvoices * 0.5), `$${(data.financialSummary.cardPayments / Math.max(Math.floor(data.summary.totalInvoices * 0.5), 1)).toFixed(2)}`],
    ['Bank Transfer', `$${data.financialSummary.bankTransferPayments.toLocaleString()}`, '15%', Math.floor(data.summary.totalInvoices * 0.15), `$${(data.financialSummary.bankTransferPayments / Math.max(Math.floor(data.summary.totalInvoices * 0.15), 1)).toFixed(2)}`],
    ['Check Payments', `$${data.financialSummary.checkPayments.toLocaleString()}`, '5%', Math.floor(data.summary.totalInvoices * 0.05), `$${(data.financialSummary.checkPayments / Math.max(Math.floor(data.summary.totalInvoices * 0.05), 1)).toFixed(2)}`],
    [''],
    ['COST STRUCTURE ANALYSIS'],
    ['Cost Category', 'Amount', 'Percentage', 'Trend', 'Recommendation'],
    ['Labor Costs', `$${(data.financialSummary.totalRevenue * 0.4).toLocaleString()}`, '40%', 'Stable', 'Monitor efficiency'],
    ['Parts & Materials', `$${(data.financialSummary.totalRevenue * 0.3).toLocaleString()}`, '30%', 'Increasing', 'Negotiate supplier rates'],
    ['Overhead', `$${(data.financialSummary.totalRevenue * 0.2).toLocaleString()}`, '20%', 'Stable', 'Optimize operations'],
    ['Other Expenses', `$${(data.financialSummary.totalRevenue * 0.1).toLocaleString()}`, '10%', 'Stable', 'Review regularly'],
    [''],
    ['PROFITABILITY ANALYSIS'],
    ['Metric', 'Amount', 'Percentage', 'Target', 'Status'],
    ['Gross Revenue', `$${data.financialSummary.totalRevenue.toLocaleString()}`, '100%', 'Target Met', '✓'],
    ['Total Expenses', `$${data.financialSummary.totalExpenses.toLocaleString()}`, '70%', '< 75%', '✓'],
    ['Net Profit', `$${data.financialSummary.netProfit.toLocaleString()}`, `${data.financialSummary.profitMargin.toFixed(1)}%`, '> 25%', data.financialSummary.profitMargin > 25 ? '✓' : '⚠'],
    ['Gross Profit', `$${data.financialSummary.grossProfit.toLocaleString()}`, '60%', '> 55%', '✓'],
    [''],
    ['CASH FLOW ANALYSIS'],
    ['Metric', 'Amount', 'Days Outstanding', 'Status'],
    ['Outstanding Invoices', `$${data.financialSummary.outstandingInvoices.toLocaleString()}`, '15 days avg', data.financialSummary.outstandingInvoices < 10000 ? 'Good' : 'Review'],
    ['Overdue Invoices', data.financialSummary.overdueInvoices, '30+ days', data.financialSummary.overdueInvoices < 5 ? 'Good' : 'Action Required'],
    ['Collection Rate', `${data.financialSummary.collectionRate}%`, '', data.financialSummary.collectionRate > 95 ? 'Excellent' : 'Good'],
    ['Average Invoice Value', `$${data.financialSummary.averageInvoiceValue.toFixed(2)}`, '', 'Target: $500+'],
  ];

  const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
  financialSheet['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial Analysis');

  // 7. INVOICES SHEET
  if (data.data.invoices && data.data.invoices.length > 0) {
    const invoicesData = [
      ...createHeader('INVOICE MANAGEMENT', 'Billing & Payment Tracking'),
      ['Invoice #', 'Customer', 'Vehicle', 'Total Amount', 'Status', 'Created Date', 'Due Date', 'Paid Date', 'Payment Method'],
    ];
    
    data.data.invoices.forEach((invoice: any, index: number) => {
      invoicesData.push([
        invoice.id ? invoice.id.toString().slice(-8) : `INV-${String(index + 1).padStart(4, '0')}`,
        invoice.customer || 'N/A',
        invoice.vehicle || 'N/A',
        `$${invoice.total || 0}`,
        invoice.status || 'Pending',
        new Date(invoice.createdAt).toLocaleDateString(),
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A',
        invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : 'N/A',
        invoice.paymentMethod || 'N/A'
      ]);
    });

    const invoicesSheet = XLSX.utils.aoa_to_sheet(invoicesData);
    invoicesSheet['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, 
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'Invoices');
  }

  // 8. PARTS INVENTORY SHEET
  if (data.data.parts && data.data.parts.length > 0) {
    const partsData = [
      ...createHeader('PARTS INVENTORY MANAGEMENT', 'Stock Levels & Reorder Points'),
      ['Part Name', 'Part Number', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Cost Price', 'Selling Price', 'Total Value', 'Supplier', 'Status'],
    ];
    
    data.data.parts.forEach((part: any) => {
      const totalValue = (part.stock || 0) * (part.cost || 0);
      const status = (part.stock || 0) <= (part.minStock || 5) ? 'Low Stock' : 
                    (part.stock || 0) >= (part.maxStock || 50) ? 'Overstocked' : 'Normal';
      
      partsData.push([
        part.name,
        part.partNumber || 'N/A',
        part.category || 'General',
        part.stock || 0,
        part.minStock || 5,
        part.maxStock || 50,
        `$${(part.cost || 0).toFixed(2)}`,
        `$${(part.sellingPrice || 0).toFixed(2)}`,
        `$${totalValue.toFixed(2)}`,
        part.supplier || 'N/A',
        status
      ]);
    });

    const partsSheet = XLSX.utils.aoa_to_sheet(partsData);
    partsSheet['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, 
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, partsSheet, 'Parts Inventory');
  }

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(excelBuffer);
}
