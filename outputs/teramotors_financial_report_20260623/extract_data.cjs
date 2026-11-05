const fs = require('fs');
const path = require('path');
const { MongoClient } = require(path.join(process.cwd(), 'node_modules', 'mongodb'));
require(path.join(process.cwd(), 'node_modules', 'dotenv')).config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('teramotors');
  const tenant = await db.collection('tenants').findOne({ slug: 'teramotors' });
  if (!tenant) throw new Error('TeraMotors tenant was not found');

  const invoices = await db.collection('invoices').aggregate([
    { $match: { tenantId: tenant._id } },
    { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } },
    { $lookup: { from: 'vehicles', localField: 'vehicleId', foreignField: '_id', as: 'vehicle' } },
    { $lookup: { from: 'jobcards', localField: 'jobCardId', foreignField: '_id', as: 'jobCard' } },
    { $sort: { createdAt: 1, invoiceNumber: 1 } },
  ]).toArray();

  const payments = await db.collection('payments').aggregate([
    { $match: { tenantId: tenant._id } },
    { $lookup: { from: 'invoices', localField: 'invoiceId', foreignField: '_id', as: 'invoice' } },
    { $sort: { paymentDate: 1, paymentNumber: 1 } },
  ]).toArray();

  const cleanInvoices = invoices.map((x) => {
    const customer = x.customer[0] || {};
    const vehicle = x.vehicle[0] || {};
    const job = x.jobCard[0] || {};
    const serviceRevenue = (job.services || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.laborHours || 0) * Number(item.laborRate || 0), 0
    );
    const partsRevenue = (job.partsUsed || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.cost || 0), 0
    );
    const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.name || 'غير محدد';
    const vehicleName = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ') || 'غير محدد';
    return {
      id: String(x._id),
      invoiceNumber: x.invoiceNumber || '',
      invoiceDate: x.createdAt,
      dueDate: x.dueDate,
      customerName,
      customerPhone: customer.phone || '',
      vehicle: vehicleName,
      plateNumber: vehicle.licensePlate || vehicle.plateNumber || '',
      jobCardNumber: job.jobCardNumber || '',
      status: x.status || '',
      paymentMethod: x.paymentMethod || '',
      subtotal: Number(x.zatca?.subtotal || 0),
      vat: Number(x.zatca?.vatAmount || 0),
      total: Number(x.totalAmount || 0),
      serviceRevenue,
      partsRevenue,
      discountPercent: Number(job.discount || 0),
      notes: x.notes || '',
    };
  });

  const cleanPayments = payments.map((x) => ({
    paymentNumber: x.paymentNumber || '',
    paymentDate: x.paymentDate,
    invoiceNumber: x.invoice[0]?.invoiceNumber || '',
    amount: Number(x.amount || 0),
    paymentMethod: x.paymentMethod || '',
    status: x.status || '',
    reference: x.reference || '',
  }));

  const out = {
    metadata: {
      tenantName: tenant.companyInfo?.name || tenant.name,
      city: tenant.companyInfo?.address?.city || '',
      country: tenant.companyInfo?.address?.country || '',
      currency: 'SAR',
      extractedAt: new Date(),
      reportStart: cleanInvoices[0]?.invoiceDate || null,
      reportEnd: cleanInvoices.at(-1)?.invoiceDate || null,
      revenuePolicy: 'All invoices are treated equally as earned revenue regardless of invoice status.',
    },
    invoices: cleanInvoices,
    payments: cleanPayments,
  };

  fs.writeFileSync(path.join(__dirname, 'financial_data.json'), JSON.stringify(out, null, 2));
  await client.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
