/**
 * Script to check tenant ID status across collections
 * Run from project root: MONGODB_URI="..." node scripts/check-tenant-ids.js
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

async function checkTenantIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get database
    const db = mongoose.connection.db;

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Found collections:', collections.map(c => c.name).join(', '));
    console.log('\n=====================================\n');

    // Check each collection for records with and without tenantId
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);

      try {
        const total = await collection.countDocuments();
        const withTenantId = await collection.countDocuments({ tenantId: { $exists: true } });
        const withoutTenantId = await collection.countDocuments({ tenantId: { $exists: false } });

        if (total > 0) {
          console.log(`📁 ${collectionName}:`);
          console.log(`   Total: ${total}`);
          console.log(`   With tenantId: ${withTenantId}`);
          console.log(`   Without tenantId: ${withoutTenantId}`);

          // Sample a document without tenantId
          if (withoutTenantId > 0) {
            const sample = await collection.findOne({ tenantId: { $exists: false } });
            console.log(`   Sample document: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
          }
          console.log('');
        }
      } catch (err) {
        console.error(`   Error checking ${collectionName}: ${err.message}`);
      }
    }

    console.log('=====================================\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTenantIds();
