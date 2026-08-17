/**
 * Generate detailed invoice report for a specific customer
 * Usage: node scripts/generate-customer-invoice-report.js
 */

const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "teramotors",
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define schemas
const InvoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  invoiceNumber: String,
  jobCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard' },
  inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleInspection' },
  isInspectionInvoice: Boolean,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic' },
  status: String,
  notes: String,
  totalAmount: Number,
  paidAmount: Number,
  dueDate: Date,
  paymentMethod: String,
  paymentDate: Date,
  paidAt: Date,
  zatca: {
    qrCode: String,
    qrCodeImage: String,
    invoiceNumber: String,
    invoiceDate: Date,
    vatAmount: Number,
    subtotal: Number,
    compliance: {
      phase: Number,
      isCompliant: Boolean,
      errors: [String],
      warnings: [String]
    }
  },
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  phoneNumber: String,
  whatsappEnabled: Boolean,
  language: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],
  vatNumber: String,
  idNumber: String,
  companyName: String,
  notes: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  vin: String,
  make: String,
  model: String,
  year: Number,
  color: String,
  licensePlate: String,
  mileage: Number,
  engineType: String,
  transmission: String,
  fuelType: String,
  photos: [String],
  serviceHistory: [],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

// Get or create models
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

// Format date for Excel
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format currency
const formatCurrency = (amount) => {
  return amount ? parseFloat(amount).toFixed(2) : '0.00';
};

// Main function to generate report
const generateReport = async () => {
  try {
    await connectToDatabase();

    // Customer email to search for
    const customerEmail = 'elfakmrentcar@gmail.com';

    console.log(`\nSearching for customer: ${customerEmail}`);

    // Find the customer
    const customer = await Customer.findOne({ email: customerEmail });

    if (!customer) {
      console.error(`✗ Customer not found with email: ${customerEmail}`);
      process.exit(1);
    }

    console.log(`✓ Found customer: ${customer.firstName} ${customer.lastName}`);
    console.log(`  Company: ${customer.companyName || 'N/A'}`);
    console.log(`  VAT Number: ${customer.vatNumber || 'N/A'}`);
    console.log(`  Tenant ID: ${customer.tenantId}`);

    // Get all invoices for this customer
    const invoices = await Invoice.find({
      customerId: customer._id,
      tenantId: customer.tenantId
    })
      .populate('vehicleId')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✓ Found ${invoices.length} invoices`);

    if (invoices.length === 0) {
      console.log('✗ No invoices found for this customer');
      process.exit(0);
    }

    // Prepare data for Excel
    const worksheetData = [];

    // Add header row
    worksheetData.push([
      'رقم الفاتورة / Invoice Number',
      'تاريخ الإنشاء / Created Date',
      'تاريخ الاستحقاق / Due Date',
      'الحالة / Status',
      'طريقة الدفع / Payment Method',
      'تاريخ الدفع / Payment Date',
      'السيارة - الصنع / Vehicle Make',
      'السيارة - الموديل / Vehicle Model',
      'السيارة - السنة / Vehicle Year',
      'رقم اللوحة / License Plate',
      'المبلغ الإجمالي / Total Amount (SAR)',
      'المبلغ قبل الضريبة / Subtotal (SAR)',
      'ضريبة القيمة المضافة / VAT Amount (SAR)',
      'المبلغ المدفوع / Paid Amount (SAR)',
      'المبلغ المتبقي / Balance (SAR)',
      'ملاحظات / Notes'
    ]);

    // Calculate totals
    let totalInvoices = 0;
    let totalAmount = 0;
    let totalVAT = 0;
    let totalSubtotal = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let paidInvoicesCount = 0;
    let pendingInvoicesCount = 0;
    let cancelledInvoicesCount = 0;

    // Add invoice rows
    invoices.forEach(invoice => {
      const vehicle = invoice.vehicleId || {};
      const vatAmount = invoice.zatca?.vatAmount || 0;
      const subtotal = invoice.zatca?.subtotal || (invoice.totalAmount - vatAmount);
      const paidAmount = invoice.paidAmount || 0;
      const balance = invoice.totalAmount - paidAmount;

      // Update counters
      totalInvoices++;
      totalAmount += invoice.totalAmount || 0;
      totalVAT += vatAmount;
      totalSubtotal += subtotal;
      totalPaid += paidAmount;
      totalBalance += balance;

      if (invoice.status === 'paid') paidInvoicesCount++;
      else if (invoice.status === 'pending') pendingInvoicesCount++;
      else if (invoice.status === 'cancelled') cancelledInvoicesCount++;

      worksheetData.push([
        invoice.invoiceNumber || '',
        formatDate(invoice.createdAt),
        formatDate(invoice.dueDate),
        invoice.status || '',
        invoice.paymentMethod || '',
        formatDate(invoice.paymentDate || invoice.paidAt),
        vehicle.make || '',
        vehicle.model || '',
        vehicle.year || '',
        vehicle.licensePlate || '',
        formatCurrency(invoice.totalAmount),
        formatCurrency(subtotal),
        formatCurrency(vatAmount),
        formatCurrency(paidAmount),
        formatCurrency(balance),
        invoice.notes || ''
      ]);
    });

    // Add empty rows before summary
    worksheetData.push([]);
    worksheetData.push([]);

    // Add summary section
    worksheetData.push(['=== SUMMARY / الملخص ===']);
    worksheetData.push([]);
    worksheetData.push(['معلومات العميل / Customer Information']);
    worksheetData.push(['الاسم / Name:', `${customer.firstName} ${customer.lastName}`]);
    worksheetData.push(['اسم الشركة / Company:', customer.companyName || 'N/A']);
    worksheetData.push(['البريد الإلكتروني / Email:', customer.email || 'N/A']);
    worksheetData.push(['الهاتف / Phone:', customer.phone || 'N/A']);
    worksheetData.push(['الرقم الضريبي / VAT Number:', customer.vatNumber || 'N/A']);
    worksheetData.push([]);

    worksheetData.push(['إحصائيات الفواتير / Invoice Statistics']);
    worksheetData.push(['إجمالي عدد الفواتير / Total Invoices:', totalInvoices]);
    worksheetData.push(['فواتير مدفوعة / Paid Invoices:', paidInvoicesCount]);
    worksheetData.push(['فواتير معلقة / Pending Invoices:', pendingInvoicesCount]);
    worksheetData.push(['فواتير ملغاة / Cancelled Invoices:', cancelledInvoicesCount]);
    worksheetData.push([]);

    worksheetData.push(['المبالغ المالية / Financial Summary']);
    worksheetData.push(['إجمالي المبلغ / Total Amount (SAR):', formatCurrency(totalAmount)]);
    worksheetData.push(['إجمالي قبل الضريبة / Total Subtotal (SAR):', formatCurrency(totalSubtotal)]);
    worksheetData.push(['إجمالي ضريبة القيمة المضافة / Total VAT (SAR):', formatCurrency(totalVAT)]);
    worksheetData.push(['إجمالي المدفوع / Total Paid (SAR):', formatCurrency(totalPaid)]);
    worksheetData.push(['إجمالي المتبقي / Total Balance (SAR):', formatCurrency(totalBalance)]);
    worksheetData.push([]);

    worksheetData.push(['تاريخ التقرير / Report Date:', formatDate(new Date())]);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Invoice Number
      { wch: 15 }, // Created Date
      { wch: 15 }, // Due Date
      { wch: 12 }, // Status
      { wch: 15 }, // Payment Method
      { wch: 15 }, // Payment Date
      { wch: 15 }, // Vehicle Make
      { wch: 15 }, // Vehicle Model
      { wch: 12 }, // Vehicle Year
      { wch: 15 }, // License Plate
      { wch: 18 }, // Total Amount
      { wch: 18 }, // Subtotal
      { wch: 18 }, // VAT Amount
      { wch: 18 }, // Paid Amount
      { wch: 18 }, // Balance
      { wch: 30 }  // Notes
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice Report');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const customerName = customer.companyName || `${customer.firstName}_${customer.lastName}`;
    const filename = `invoice_report_${customerName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    const filepath = path.join(process.cwd(), filename);

    // Write the file
    XLSX.writeFile(wb, filepath);

    console.log(`\n✓ Report generated successfully!`);
    console.log(`  File: ${filepath}`);
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Invoices: ${totalInvoices}`);
    console.log(`Paid: ${paidInvoicesCount} | Pending: ${pendingInvoicesCount} | Cancelled: ${cancelledInvoicesCount}`);
    console.log(`\nFinancial Summary:`);
    console.log(`Total Amount: ${formatCurrency(totalAmount)} SAR`);
    console.log(`Total Subtotal: ${formatCurrency(totalSubtotal)} SAR`);
    console.log(`Total VAT: ${formatCurrency(totalVAT)} SAR`);
    console.log(`Total Paid: ${formatCurrency(totalPaid)} SAR`);
    console.log(`Total Balance: ${formatCurrency(totalBalance)} SAR`);

  } catch (error) {
    console.error('✗ Error generating report:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
};

// Run the script
generateReport();
