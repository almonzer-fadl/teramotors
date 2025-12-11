/**
 * Script to fix admin user tenantId
 * Run from project root: MONGODB_URI="..." node scripts/fix-admin-tenant.js
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

// Get tenant slug from command line argument or use default
const tenantSlug = process.argv[2] || 'default';

async function fixAdminTenant() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get database
    const db = mongoose.connection.db;

    // Find the tenant
    const tenant = await db.collection('tenants').findOne({ slug: tenantSlug });

    if (!tenant) {
      console.error(`❌ Tenant with slug "${tenantSlug}" not found!`);
      console.log('\nAvailable tenants:');
      const tenants = await db.collection('tenants').find({}).toArray();
      tenants.forEach(t => {
        console.log(`  - ${t.slug} (${t.name})`);
      });
      process.exit(1);
    }

    console.log(`✅ Found tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`   Tenant ID: ${tenant._id}\n`);

    // Find all users without tenantId
    const usersWithoutTenant = await db.collection('users').find({ tenantId: { $exists: false } }).toArray();

    console.log(`📊 Found ${usersWithoutTenant.length} users without tenantId\n`);

    if (usersWithoutTenant.length === 0) {
      console.log('✅ All users already have tenantId!');
    } else {
      for (const user of usersWithoutTenant) {
        console.log(`Updating user: ${user.email} (${user.role || 'N/A'})`);
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { tenantId: tenant._id } }
        );
        console.log(`  ✓ Updated with tenantId: ${tenant._id}`);
      }

      console.log(`\n🎉 Successfully updated ${usersWithoutTenant.length} users!`);
    }

    console.log('\n=====================================');
    console.log('Final user status:');
    console.log('=====================================\n');

    const allUsers = await db.collection('users').find({}).toArray();
    for (const user of allUsers) {
      console.log(`${user.email}:`);
      console.log(`  Role: ${user.role || 'N/A'}`);
      console.log(`  TenantId: ${user.tenantId || 'MISSING'}`);
      console.log(`  Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
      console.log('');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdminTenant();
