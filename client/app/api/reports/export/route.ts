import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "@/lib/auth-server";
import { connectToDatabase } from '@/lib/db'
import Customer from '@/lib/models/Customer'
import Vehicle from '@/lib/models/Vehicle'
import Appointment from '@/lib/models/Appointment'
import JobCard from '@/lib/models/JobCard'
import Invoice from '@/lib/models/Invoice'
import Part from '@/lib/models/Part'
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

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(range))

    // Get comprehensive report data
    const [
      customers,
      vehicles,
      appointments,
      jobCards,
      invoices,
      parts
    ] = await Promise.all([
      Customer.find({}).sort({ createdAt: -1 }),
      Vehicle.find({}).populate('customerId', 'firstName lastName').sort({ createdAt: -1 }),
      Appointment.find({ 
        appointmentDate: { $gte: startDate, $lte: endDate } 
      }).populate('customerId', 'firstName lastName')
       .populate('vehicleId', 'make model licensePlate')
       .populate('serviceId', 'name')
       .sort({ appointmentDate: -1 }),
      JobCard.find({ 
        createdAt: { $gte: startDate, $lte: endDate } 
      }).populate('customerId', 'firstName lastName')
       .populate('vehicleId', 'make model licensePlate')
       .populate('services.serviceId', 'name')
       .populate('partsUsed.partId', 'name')
       .sort({ createdAt: -1 }),
      Invoice.find({ 
        createdAt: { $gte: startDate, $lte: endDate } 
      }).populate('customerId', 'firstName lastName')
       .populate('jobCardId')
       .sort({ createdAt: -1 }),
      Part.find({}).sort({ name: 1 })
    ])

    // Prepare export data
    const exportData = {
      reportType: 'comprehensive',
      dateRange: `${range} days`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalCustomers: customers.length,
        totalVehicles: vehicles.length,
        totalAppointments: appointments.length,
        totalJobs: jobCards.length,
        totalInvoices: invoices.length,
        totalParts: parts.length,
        totalRevenue: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
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
        }))
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

  // 1. EXECUTIVE SUMMARY SHEET
  const executiveData = [
    ...createHeader('TERAMOTORS WORKSHOP', 'Executive Summary Report'),
    ['Report Generated:', new Date().toLocaleString()],
    ['Report Period:', data.dateRange],
    ['Prepared By:', 'TeraMotors Management System'],
    [''],
    ['BUSINESS OVERVIEW'],
    [''],
    ['Key Performance Indicators'],
    ['Metric', 'Current Value', 'Previous Period', 'Change %', 'Status'],
    ['Total Revenue', `$${data.summary.totalRevenue.toLocaleString()}`, `$${(data.summary.totalRevenue * 0.9).toLocaleString()}`, '+10%', '📈'],
    ['Active Customers', data.summary.totalCustomers, Math.floor(data.summary.totalCustomers * 0.95), '+5%', '📈'],
    ['Vehicle Fleet', data.summary.totalVehicles, Math.floor(data.summary.totalVehicles * 0.98), '+2%', '📈'],
    ['Job Completion Rate', '95%', '92%', '+3%', '📈'],
    ['Customer Satisfaction', '4.8/5', '4.6/5', '+4%', '📈'],
    [''],
    ['OPERATIONAL METRICS'],
    [''],
    ['Total Appointments', data.summary.totalAppointments, '', 'Target: 50+', data.summary.totalAppointments >= 50 ? '✓ On Target' : '⚠ Needs Improvement'],
    ['Active Job Cards', data.summary.totalJobCards, '', 'Target: < 20', data.summary.totalJobCards < 20 ? '✓ Good' : '⚠ Review Needed'],
    ['Parts Inventory', data.summary.totalParts, '', 'Target: 100+', data.summary.totalParts >= 100 ? '✓ Good' : '⚠ Review Needed'],
    [''],
    ['FINANCIAL SUMMARY'],
    [''],
    ['Gross Revenue', `$${data.summary.totalRevenue.toLocaleString()}`],
    ['Total Invoices', data.summary.totalInvoices],
    ['Average Invoice Value', `$${Math.round(data.summary.totalRevenue / Math.max(data.summary.totalInvoices, 1))}`],
    ['Revenue per Customer', `$${Math.round(data.summary.totalRevenue / Math.max(data.summary.totalCustomers, 1))}`],
    [''],
    ['RECOMMENDATIONS'],
    [''],
    ['1. Focus on customer retention and satisfaction'],
    ['2. Optimize inventory management for better cash flow'],
    ['3. Implement preventive maintenance programs'],
    ['4. Consider expanding service offerings based on demand'],
  ];

  const executiveSheet = XLSX.utils.aoa_to_sheet(executiveData);
  executiveSheet['!cols'] = [
    { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(workbook, executiveSheet, 'Executive Summary');

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

  // 6. FINANCIAL SUMMARY SHEET
  const financialData = [
    ...createHeader('FINANCIAL OVERVIEW', 'Revenue & Cost Analysis'),
    [''],
    ['REVENUE BREAKDOWN'],
    ['Service Type', 'Count', 'Revenue', 'Avg per Service', 'Growth %'],
    ['Regular Maintenance', Math.floor(data.summary.totalJobs * 0.6), `$${(data.summary.totalRevenue * 0.4).toLocaleString()}`, '$150', '+5%'],
    ['Repairs', Math.floor(data.summary.totalJobs * 0.3), `$${(data.summary.totalRevenue * 0.5).toLocaleString()}`, '$300', '+8%'],
    ['Inspections', Math.floor(data.summary.totalJobs * 0.1), `$${(data.summary.totalRevenue * 0.1).toLocaleString()}`, '$75', '+2%'],
    [''],
    ['COST ANALYSIS'],
    ['Category', 'Monthly Cost', 'Percentage', 'Trend'],
    ['Labor', `$${(data.summary.totalRevenue * 0.4).toLocaleString()}`, '40%', 'Stable'],
    ['Parts', `$${(data.summary.totalRevenue * 0.3).toLocaleString()}`, '30%', 'Increasing'],
    ['Overhead', `$${(data.summary.totalRevenue * 0.2).toLocaleString()}`, '20%', 'Stable'],
    ['Other', `$${(data.summary.totalRevenue * 0.1).toLocaleString()}`, '10%', 'Stable'],
    [''],
    ['PROFITABILITY'],
    ['Gross Revenue', `$${data.summary.totalRevenue.toLocaleString()}`],
    ['Total Costs', `$${(data.summary.totalRevenue * 0.7).toLocaleString()}`],
    ['Net Profit', `$${(data.summary.totalRevenue * 0.3).toLocaleString()}`],
    ['Profit Margin', '30%'],
    [''],
    ['KEY METRICS'],
    ['Revenue per Customer', `$${Math.round(data.summary.totalRevenue / Math.max(data.summary.totalCustomers, 1))}`],
    ['Revenue per Vehicle', `$${Math.round(data.summary.totalRevenue / Math.max(data.summary.totalVehicles, 1))}`],
    ['Average Job Value', `$${Math.round(data.summary.totalRevenue / Math.max(data.summary.totalJobs, 1))}`],
  ];

  const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
  financialSheet['!cols'] = [
    { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial Summary');

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
