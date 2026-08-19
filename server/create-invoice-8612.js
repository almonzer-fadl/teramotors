const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/teramotors?authSource=admin';

async function createInvoice() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('teramotors');

    // Get the job card details
    const jobCardId = new ObjectId('694011e3610294747eacb9b8');
    const jobCard = await db.collection('jobcards').findOne({ _id: jobCardId });

    if (!jobCard) {
      console.log('Job card not found!');
      return;
    }

    console.log('Found Job Card:', jobCard.jobCardNumber);

    // Calculate totals from job card
    let laborCost = 0;
    let partsCost = 0;

    // Calculate labor cost from services
    if (jobCard.services && jobCard.services.length > 0) {
      jobCard.services.forEach(service => {
        const serviceCost = (service.laborHours || 0) * (service.laborRate || 0) * (service.quantity || 1);
        laborCost += serviceCost;
      });
    }

    // Calculate parts cost
    if (jobCard.partsUsed && jobCard.partsUsed.length > 0) {
      jobCard.partsUsed.forEach(part => {
        const partCost = (part.cost || 0) * (part.quantity || 1);
        partsCost += partCost;
      });
    }

    const subtotal = laborCost + partsCost;
    const discount = jobCard.discount || 0;
    const subtotalAfterDiscount = subtotal - discount;
    const vatRate = 0.15; // 15% VAT
    const vatAmount = subtotalAfterDiscount * vatRate;
    const totalAmount = subtotalAfterDiscount + vatAmount;

    console.log('\nCalculated Amounts:');
    console.log('Labor Cost:', laborCost);
    console.log('Parts Cost:', partsCost);
    console.log('Subtotal:', subtotal);
    console.log('Discount:', discount);
    console.log('Subtotal After Discount:', subtotalAfterDiscount);
    console.log('VAT (15%):', vatAmount);
    console.log('Total Amount:', totalAmount);

    // Get the next invoice number
    const lastInvoice = await db.collection('invoices')
      .find({ tenantId: jobCard.tenantId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    let invoiceNumber = 1;
    if (lastInvoice.length > 0 && lastInvoice[0].zatca && lastInvoice[0].zatca.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice[0].zatca.invoiceNumber);
      invoiceNumber = lastNumber + 1;
    }

    console.log('\nNext Invoice Number:', invoiceNumber);

    // Create due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Generate TLV for QR Code (simplified)
    const sellerName = Buffer.from('TeraMotors', 'utf-8');
    const vatNumber = Buffer.from('300000000000003', 'utf-8');
    const timestamp = Buffer.from(new Date().toISOString(), 'utf-8');
    const totalBuffer = Buffer.from(totalAmount.toFixed(2), 'utf-8');
    const vatBuffer = Buffer.from(vatAmount.toFixed(2), 'utf-8');

    const tlvData = Buffer.concat([
      Buffer.from([0x01, sellerName.length]), sellerName,
      Buffer.from([0x02, vatNumber.length]), vatNumber,
      Buffer.from([0x03, timestamp.length]), timestamp,
      Buffer.from([0x04, totalBuffer.length]), totalBuffer,
      Buffer.from([0x05, vatBuffer.length]), vatBuffer,
    ]);

    const qrCode = tlvData.toString('base64');

    // Create the invoice
    const invoice = {
      tenantId: jobCard.tenantId,
      jobCardId: jobCard._id,
      customerId: jobCard.customerId,
      vehicleId: jobCard.vehicleId,
      mechanicId: jobCard.mechanicId || null,
      status: 'pending',
      totalAmount: totalAmount,
      paidAmount: 0,
      dueDate: dueDate,
      notes: 'Invoice generated from job card ' + jobCard.jobCardNumber,
      zatca: {
        invoiceNumber: invoiceNumber.toString(),
        invoiceDate: new Date(),
        qrCode: qrCode,
        vatAmount: vatAmount,
        subtotal: subtotalAfterDiscount
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the invoice
    const result = await db.collection('invoices').insertOne(invoice);

    console.log('\n✅ Invoice created successfully!');
    console.log('Invoice ID:', result.insertedId);
    console.log('Invoice Number:', invoiceNumber);
    console.log('Total Amount:', totalAmount.toFixed(2), 'SAR');
    console.log('Due Date:', dueDate.toISOString().split('T')[0]);
    console.log('\nYou can now view and download this invoice from the app!');

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

createInvoice();
