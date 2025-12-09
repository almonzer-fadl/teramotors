/**
 * Script to check which database we're connecting to
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkDbName() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name || 'test (default)');
    console.log('Connection string database:', process.env.MONGODB_URI.includes('?') ? 'Not specified in URI' : 'Check URI');

    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const { databases } = await adminDb.listDatabases();

    console.log('\nAvailable databases:');
    databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDbName();
