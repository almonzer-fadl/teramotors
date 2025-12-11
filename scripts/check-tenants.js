/**
 * Script to check tenants and their users
 * Run from project root: MONGODB_URI="..." node scripts/check-tenants.js
 */

const path = require('path');

// Determine if we're running from project root or client directory
const isInClient = __dirname.includes('/client/scripts') || process.cwd().includes('/client');
const clientDir = isInClient ? process.cwd() : path.join(__dirname, '../client');

// Add client's node_modules to the module search path
if (!isInClient) {
  process.chdir(clientDir);
}

const mongoose = require(path.join(clientDir, 'node_modules', 'mongoose'));

// MongoDB connection string - update if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teramotors';

async function checkTenants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get database
    const db = mongoose.connection.db;

    // Get all tenants
    const tenants = await db.collection('tenants').find({}).toArray();
    console.log('📊 Tenants in database:');
    console.log('=====================================\n');

    for (const tenant of tenants) {
      console.log(`Tenant: ${tenant.name}`);
      console.log(`  ID: ${tenant._id}`);
      console.log(`  Slug: ${tenant.slug || 'N/A'}`);
      console.log(`  Status: ${tenant.status || tenant.isActive ? 'active' : 'inactive'}`);

      // Count users for this tenant
      const userCount = await db.collection('users').countDocuments({ tenantId: tenant._id });
      console.log(`  Users: ${userCount}`);

      // Get user details
      if (userCount > 0) {
        const users = await db.collection('users').find({ tenantId: tenant._id }).toArray();
        users.forEach(user => {
          console.log(`    - ${user.email} (${user.role || 'N/A'})`);
        });
      }

      // Count other records
      const customerCount = await db.collection('customers').countDocuments({ tenantId: tenant._id });
      const vehicleCount = await db.collection('vehicles').countDocuments({ tenantId: tenant._id });
      const jobCardCount = await db.collection('jobcards').countDocuments({ tenantId: tenant._id });

      console.log(`  Customers: ${customerCount}`);
      console.log(`  Vehicles: ${vehicleCount}`);
      console.log(`  Job Cards: ${jobCardCount}`);
      console.log('');
    }

    console.log('=====================================\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTenants();
