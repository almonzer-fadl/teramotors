const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/teramotors?authSource=admin';

async function checkTenant() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('teramotors');

    // Get the job card tenant ID
    const jobCard = await db.collection('jobcards').findOne({ _id: new ObjectId('694011e3610294747eacb9b8') });
    console.log('=== Job Card ===');
    console.log('Job Card ID:', jobCard?._id);
    console.log('Job Card Tenant ID:', jobCard?.tenantId);
    console.log('Job Card Number:', jobCard?.jobCardNumber);

    // Get the estimates tenant IDs
    const estimate = await db.collection('estimates').findOne({ _id: new ObjectId('69411ca944c7aa376040b6aa') });
    console.log('\n=== Estimate ===');
    console.log('Estimate ID:', estimate?._id);
    console.log('Estimate Tenant ID:', estimate?.tenantId);
    console.log('Estimate Number:', estimate?.estimateNumber);

    // Get all users and their tenant IDs
    console.log('\n=== Users ===');
    const users = await db.collection('users').find({}).toArray();
    users.forEach(user => {
      console.log(`User: ${user.email || user.username || user._id}`);
      console.log(`  Tenant ID: ${user.tenantId || 'NO TENANT ID'}`);
      console.log(`  Role: ${user.role}`);
      console.log('---');
    });

    // Get all tenants
    console.log('\n=== Tenants ===');
    const tenants = await db.collection('tenants').find({}).toArray();
    tenants.forEach(tenant => {
      console.log(`Tenant: ${tenant.name}`);
      console.log(`  ID: ${tenant._id}`);
      console.log(`  Active: ${tenant.isActive}`);
      console.log('---');
    });

    // Check if there are any job cards and estimates with matching tenant ID
    const matchingJobCards = await db.collection('jobcards').countDocuments({
      tenantId: jobCard?.tenantId
    });
    const matchingEstimates = await db.collection('estimates').countDocuments({
      tenantId: estimate?.tenantId
    });

    console.log('\n=== Summary ===');
    console.log(`Job cards with tenant ${jobCard?.tenantId}: ${matchingJobCards}`);
    console.log(`Estimates with tenant ${estimate?.tenantId}: ${matchingEstimates}`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

checkTenant();
