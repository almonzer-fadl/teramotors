const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/teramotors?authSource=admin';

async function searchFor8612() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('teramotors');

    // Search in vehicles
    console.log('\n=== Searching Vehicles ===');
    const vehicles = await db.collection('vehicles').find({
      $or: [
        { licensePlate: { $regex: '8612', $options: 'i' } },
        { vin: { $regex: '8612', $options: 'i' } },
        { make: { $regex: '8612', $options: 'i' } },
        { model: { $regex: '8612', $options: 'i' } },
      ]
    }).toArray();

    if (vehicles.length > 0) {
      console.log(`Found ${vehicles.length} vehicle(s):`);

      for (const v of vehicles) {
        console.log(`\n- Vehicle ID: ${v._id}`);
        console.log(`  License Plate: ${v.licensePlate || 'N/A'}`);
        console.log(`  VIN: ${v.vin || 'N/A'}`);
        console.log(`  Make: ${v.make || 'N/A'}`);
        console.log(`  Model: ${v.model || 'N/A'}`);
        console.log(`  Year: ${v.year || 'N/A'}`);
        console.log(`  Color: ${v.color || 'N/A'}`);

        // Get customer information
        if (v.customerId) {
          console.log('\n  === Customer Information ===');
          const customer = await db.collection('customers').findOne({
            _id: new ObjectId(v.customerId)
          });

          if (customer) {
            console.log(`  Customer ID: ${customer._id}`);
            console.log(`  Name: ${customer.firstName} ${customer.lastName}`);
            console.log(`  Email: ${customer.email || 'N/A'}`);
            console.log(`  Phone: ${customer.phone || 'N/A'}`);
            console.log(`  Company: ${customer.company || 'N/A'}`);
          } else {
            console.log(`  Customer not found (ID: ${v.customerId})`);
          }
        }

        // Get job cards for this vehicle
        console.log('\n  === Job Cards for this Vehicle ===');
        const jobCards = await db.collection('jobcards').find({
          vehicleId: new ObjectId(v._id)
        }).sort({ createdAt: -1 }).toArray();

        if (jobCards.length > 0) {
          console.log(`  Found ${jobCards.length} job card(s):`);
          jobCards.forEach((jc, index) => {
            console.log(`\n  Job Card #${index + 1}:`);
            console.log(`    ID: ${jc._id}`);
            console.log(`    Unique Code: ${jc.uniqueCode || 'N/A'}`);
            console.log(`    Status: ${jc.status}`);
            console.log(`    Created: ${jc.createdAt}`);
            console.log(`    Updated: ${jc.updatedAt || 'N/A'}`);
            console.log(`    Services: ${jc.services?.length || 0}`);
            if (jc.services && jc.services.length > 0) {
              console.log('\n    Service Details:');
              jc.services.forEach((service, idx) => {
                console.log(`      Service ${idx + 1}:`);
                console.log(`        Name: ${service.name || 'N/A'}`);
                console.log(`        Description: ${service.description || 'N/A'}`);
                console.log(`        Cost: ${service.cost || 0}`);
                console.log(`        Status: ${service.status || 'N/A'}`);
              });
            }
            console.log(`    Total Cost: ${jc.totalCost || 'N/A'}`);
            console.log(`    Notes: ${jc.notes || 'N/A'}`);
            console.log(`    Mechanic ID: ${jc.mechanicId || 'N/A'}`);
            console.log(`    Customer ID: ${jc.customerId || 'N/A'}`);
            console.log(`    Vehicle ID: ${jc.vehicleId || 'N/A'}`);

            // Print full job card JSON
            console.log('\n    Full Job Card Data:');
            console.log(JSON.stringify(jc, null, 2));
          });
        } else {
          console.log('  No job cards found for this vehicle');
        }

        // Get estimates for this vehicle
        console.log('\n  === Estimates for this Vehicle ===');
        const estimates = await db.collection('estimates').find({
          vehicleId: new ObjectId(v._id)
        }).sort({ createdAt: -1 }).toArray();

        if (estimates.length > 0) {
          console.log(`  Found ${estimates.length} estimate(s):`);
          estimates.forEach((est, index) => {
            console.log(`\n  Estimate #${index + 1}:`);
            console.log(`    ID: ${est._id}`);
            console.log(`    Status: ${est.status || 'N/A'}`);
            console.log(`    Created: ${est.createdAt}`);
            console.log(`    Valid Until: ${est.validUntil || 'N/A'}`);
            console.log(`    Total Amount: ${est.totalAmount || 'N/A'}`);
            console.log(`    Services: ${est.services?.length || 0}`);
            if (est.services && est.services.length > 0) {
              console.log('\n    Service Details:');
              est.services.forEach((service, idx) => {
                console.log(`      Service ${idx + 1}:`);
                console.log(`        Name: ${service.name || 'N/A'}`);
                console.log(`        Description: ${service.description || 'N/A'}`);
                console.log(`        Cost: ${service.cost || 0}`);
              });
            }
            console.log(`    Notes: ${est.notes || 'N/A'}`);

            // Print full estimate JSON
            console.log('\n    Full Estimate Data:');
            console.log(JSON.stringify(est, null, 2));
          });
        } else {
          console.log('  No estimates found for this vehicle');
        }

        // Get invoices for this vehicle
        console.log('\n  === Invoices for this Vehicle ===');
        const invoices = await db.collection('invoices').find({
          vehicleId: new ObjectId(v._id)
        }).sort({ createdAt: -1 }).toArray();

        if (invoices.length > 0) {
          console.log(`  Found ${invoices.length} invoice(s):`);
          invoices.forEach((inv, index) => {
            console.log(`\n  Invoice #${index + 1}:`);
            console.log(`    ID: ${inv._id}`);
            console.log(`    Invoice Number: INV-${inv._id.toString().slice(-6)}`);
            console.log(`    ZATCA Number: ${inv.zatca?.invoiceNumber || 'N/A'}`);
            console.log(`    Total Amount: ${inv.totalAmount}`);
            console.log(`    Paid Amount: ${inv.paidAmount || 0}`);
            console.log(`    Status: ${inv.status}`);
            console.log(`    Due Date: ${inv.dueDate}`);
            console.log(`    Created: ${inv.createdAt}`);
            if (inv.jobCardId) {
              console.log(`    Job Card ID: ${inv.jobCardId}`);
            }
          });
        } else {
          console.log('  No invoices found for this vehicle');
        }

        console.log('\n' + '='.repeat(60));
      }
    } else {
      console.log('No vehicles found with 8612');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

searchFor8612();
