const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/teramotors?authSource=admin';

async function searchFor8612() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    // Search in job cards
    console.log('\n=== Searching Job Cards ===');
    const jobCards = await db.collection('jobcards').find({
      $or: [
        { uniqueCode: { $regex: '8612', $options: 'i' } },
        { _id: { $regex: '8612', $options: 'i' } },
      ]
    }).toArray();

    if (jobCards.length > 0) {
      console.log(`Found ${jobCards.length} job card(s):`);
      jobCards.forEach(jc => {
        console.log(`- ID: ${jc._id}`);
        console.log(`  Unique Code: ${jc.uniqueCode || 'N/A'}`);
        console.log(`  Customer: ${jc.customerId}`);
        console.log(`  Vehicle: ${jc.vehicleId}`);
        console.log(`  Created: ${jc.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('No job cards found with 8612');
    }

    // Search in invoices
    console.log('\n=== Searching Invoices ===');
    const invoices = await db.collection('invoices').find({
      $or: [
        { _id: { $regex: '8612', $options: 'i' } },
        { 'zatca.invoiceNumber': { $regex: '8612', $options: 'i' } },
      ]
    }).toArray();

    if (invoices.length > 0) {
      console.log(`Found ${invoices.length} invoice(s):`);
      invoices.forEach(inv => {
        console.log(`- ID: ${inv._id}`);
        console.log(`  Invoice Number: INV-${inv._id.toString().slice(-6)}`);
        console.log(`  ZATCA Number: ${inv.zatca?.invoiceNumber || 'N/A'}`);
        console.log(`  Customer: ${inv.customerId}`);
        console.log(`  Total: ${inv.totalAmount}`);
        console.log(`  Status: ${inv.status}`);
        console.log(`  Created: ${inv.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('No invoices found with 8612');
    }

    // Also search for any documents containing 8612 in their ObjectId
    console.log('\n=== Checking for ObjectIds containing 8612 ===');
    const allJobCards = await db.collection('jobcards').find({}).toArray();
    const jobCardsWithId = allJobCards.filter(jc => jc._id.toString().includes('8612'));

    if (jobCardsWithId.length > 0) {
      console.log(`Found ${jobCardsWithId.length} job card(s) with 8612 in ObjectId:`);
      jobCardsWithId.forEach(jc => {
        console.log(`- Full ID: ${jc._id}`);
        console.log(`  Unique Code: ${jc.uniqueCode || 'N/A'}`);
        console.log('---');
      });
    }

    const allInvoices = await db.collection('invoices').find({}).toArray();
    const invoicesWithId = allInvoices.filter(inv => inv._id.toString().includes('8612'));

    if (invoicesWithId.length > 0) {
      console.log(`Found ${invoicesWithId.length} invoice(s) with 8612 in ObjectId:`);
      invoicesWithId.forEach(inv => {
        console.log(`- Full ID: ${inv._id}`);
        console.log(`  Invoice Number: INV-${inv._id.toString().slice(-6)}`);
        console.log(`  Status: ${inv.status}`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

searchFor8612();
