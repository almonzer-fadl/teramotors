/**
 * Script to check which database we're connected to
 * Run from project root: MONGODB_URI="..." node scripts/check-database.js
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

async function checkDatabase() {
  try {
    console.log('🔗 Connection String:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    console.log('');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get connection details
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const admin = db.admin();

    console.log('📊 Database Information:');
    console.log('=====================================');
    console.log(`Database Name: ${dbName}`);
    console.log('');

    // List all databases
    try {
      const { databases } = await admin.listDatabases();
      console.log('Available Databases:');
      databases.forEach(database => {
        const marker = database.name === dbName ? ' ← CURRENT' : '';
        console.log(`  - ${database.name} (${(database.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)${marker}`);
      });
      console.log('');
    } catch (err) {
      console.log('Could not list databases (may need admin privileges)\n');
    }

    // List collections in current database
    const collections = await db.listCollections().toArray();
    console.log('Collections in current database:');
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`  - ${coll.name}: ${count} documents`);
    }
    console.log('');

    // Sample data from users collection
    console.log('=====================================');
    console.log('Sample Data:');
    console.log('=====================================\n');

    const userCount = await db.collection('users').countDocuments();
    console.log(`👥 Users: ${userCount}`);
    if (userCount > 0) {
      const users = await db.collection('users').find({}).limit(5).toArray();
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role || 'N/A'}) - TenantId: ${user.tenantId || 'MISSING'}`);
      });
    }
    console.log('');

    const tenantCount = await db.collection('tenants').countDocuments();
    console.log(`🏢 Tenants: ${tenantCount}`);
    if (tenantCount > 0) {
      const tenants = await db.collection('tenants').find({}).toArray();
      tenants.forEach(tenant => {
        console.log(`  - ${tenant.name} (${tenant.slug || 'N/A'}) - ID: ${tenant._id}`);
      });
    }
    console.log('');

    const customerCount = await db.collection('customers').countDocuments();
    console.log(`👨‍💼 Customers: ${customerCount}`);
    console.log('');

    const vehicleCount = await db.collection('vehicles').countDocuments();
    console.log(`🚗 Vehicles: ${vehicleCount}`);
    console.log('');

    console.log('=====================================\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
