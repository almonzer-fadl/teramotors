const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/teramotors?authSource=admin';

async function testAPI() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('teramotors');

    const tenantId = new ObjectId('6931839836d21509c98678f6');
    const jobCardId = new ObjectId('694011e3610294747eacb9b8');

    // Simulate what the API does for job cards
    console.log('=== Testing Job Cards API Query ===');
    const jobCards = await db.collection('jobcards')
      .aggregate([
        { $match: { tenantId } },
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointmentId'
          }
        },
        { $unwind: { path: '$appointmentId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerId'
          }
        },
        { $unwind: '$customerId' },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicleId',
            foreignField: '_id',
            as: 'vehicleId'
          }
        },
        { $unwind: '$vehicleId' },
        { $sort: { createdAt: -1 } },
        { $limit: 10 }
      ])
      .toArray();

    console.log(`Found ${jobCards.length} job cards`);

    // Find our specific job card
    const ourJobCard = jobCards.find(jc => jc._id.toString() === jobCardId.toString());
    if (ourJobCard) {
      console.log('\nOUR JOB CARD (JC-0004) FOUND!');
      console.log('Job Card Number:', ourJobCard.jobCardNumber);
      console.log('Status:', ourJobCard.status);
      console.log('Customer:', ourJobCard.customerId?.firstName, ourJobCard.customerId?.lastName);
      console.log('Vehicle:', ourJobCard.vehicleId?.make, ourJobCard.vehicleId?.model, ourJobCard.vehicleId?.licensePlate);
      console.log('Appointment ID:', ourJobCard.appointmentId || 'NULL');
      console.log('Services count:', ourJobCard.services?.length);
    } else {
      console.log('\nOUR JOB CARD (JC-0004) NOT FOUND in results!');
      console.log('Checking if it exists in DB...');
      const directCheck = await db.collection('jobcards').findOne({ _id: jobCardId, tenantId });
      if (directCheck) {
        console.log('Job card EXISTS in database with correct tenant');
        console.log('Job Card Number:', directCheck.jobCardNumber);
        console.log('Tenant ID:', directCheck.tenantId);
      } else {
        console.log('Job card NOT FOUND or tenant mismatch');
      }
    }

    // List first few job cards for reference
    console.log('\n=== First 5 Job Cards Returned ===');
    jobCards.slice(0, 5).forEach((jc, idx) => {
      console.log(`${idx + 1}. ${jc.jobCardNumber} - ${jc.status} - ${jc.customerId?.firstName} ${jc.customerId?.lastName}`);
    });

    // Test estimates
    console.log('\n=== Testing Estimates API Query ===');
    const estimates = await db.collection('estimates')
      .aggregate([
        { $match: { tenantId } },
        {
          $lookup: {
            from: 'jobcards',
            localField: 'jobCardId',
            foreignField: '_id',
            as: 'jobCardId'
          }
        },
        { $unwind: { path: '$jobCardId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customerId'
          }
        },
        { $unwind: '$customerId' },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicleId',
            foreignField: '_id',
            as: 'vehicleId'
          }
        },
        { $unwind: '$vehicleId' },
        { $sort: { createdAt: -1 } },
        { $limit: 10 }
      ])
      .toArray();

    console.log(`Found ${estimates.length} estimates`);

    // Check for our estimates
    const vehicleId = new ObjectId('69400a829ee7c8ab709f5db2');
    const ourEstimates = estimates.filter(est => est.vehicleId._id.toString() === vehicleId.toString());
    console.log(`\nOur vehicle estimates found: ${ourEstimates.length}`);
    ourEstimates.forEach(est => {
      console.log(`- ${est.estimateNumber} - Status: ${est.status} - Total: ${est.total}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

testAPI();
