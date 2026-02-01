/**
 * Migration Script: Fix Duplicate Indexes
 *
 * This script:
 * 1. Drops the old standalone `email_1` index from customers collection
 *    (which causes E11000 duplicate key errors for null emails)
 * 2. Drops duplicate `slug_1` index from tenants collection
 * 3. Drops duplicate `confirmationNumber_1` index from appointments collection
 *
 * Usage:
 *   node server/migrations/002-fix-duplicate-indexes.js
 *
 * Environment variables required:
 *   MONGODB_URI - MongoDB connection string
 */

const mongoose = require('mongoose');

async function runMigration() {
  try {
    console.log('===========================================');
    console.log('  FIX DUPLICATE INDEXES MIGRATION');
    console.log('===========================================');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teramotors';
    console.log(`\nConnecting to MongoDB...`);

    await mongoose.connect(mongoUri, {
      dbName: 'teramotors',
    });
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Fix customers collection - drop old email_1 index
    console.log('=== Fixing Customers Collection ===');
    try {
      const customersIndexes = await db.collection('customers').indexes();
      console.log('Current indexes on customers:');
      customersIndexes.forEach(idx => console.log(`  - ${idx.name}`));

      const emailIndex = customersIndexes.find(idx => idx.name === 'email_1');
      if (emailIndex) {
        console.log('\nDropping old email_1 index...');
        await db.collection('customers').dropIndex('email_1');
        console.log('Successfully dropped email_1 index');
      } else {
        console.log('\nemail_1 index not found (already removed or never existed)');
      }

      // Verify the compound index exists
      const compoundIndex = customersIndexes.find(idx => idx.name === 'tenantId_1_email_1');
      if (compoundIndex) {
        console.log('Compound tenantId_1_email_1 index exists with sparse:', compoundIndex.sparse);
      } else {
        console.log('Note: tenantId_1_email_1 compound index will be created when model loads');
      }
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('email_1 index already removed');
      } else {
        console.error('Error fixing customers indexes:', error.message);
      }
    }

    // 2. Fix tenants collection - check for duplicate slug index
    console.log('\n=== Checking Tenants Collection ===');
    try {
      const tenantsIndexes = await db.collection('tenants').indexes();
      console.log('Current indexes on tenants:');
      tenantsIndexes.forEach(idx => console.log(`  - ${idx.name}`));

      // Check if there are duplicate slug indexes
      const slugIndexes = tenantsIndexes.filter(idx =>
        idx.key && idx.key.slug !== undefined && idx.name !== '_id_'
      );
      if (slugIndexes.length > 1) {
        console.log('\nFound duplicate slug indexes, keeping only unique one');
        // Keep only the unique one
        for (const idx of slugIndexes) {
          if (!idx.unique) {
            console.log(`Dropping non-unique slug index: ${idx.name}`);
            await db.collection('tenants').dropIndex(idx.name);
          }
        }
      } else {
        console.log('\nNo duplicate slug indexes found');
      }
    } catch (error) {
      console.error('Error checking tenants indexes:', error.message);
    }

    // 3. Fix appointments collection - check for duplicate confirmationNumber index
    console.log('\n=== Checking Appointments Collection ===');
    try {
      const appointmentsIndexes = await db.collection('appointments').indexes();
      console.log('Current indexes on appointments:');
      appointmentsIndexes.forEach(idx => console.log(`  - ${idx.name}`));

      // Check if there are duplicate confirmationNumber indexes
      const confNumIndexes = appointmentsIndexes.filter(idx =>
        idx.key && idx.key.confirmationNumber !== undefined && idx.name !== '_id_'
      );
      if (confNumIndexes.length > 1) {
        console.log('\nFound duplicate confirmationNumber indexes');
        // Keep only one unique index
        let keptOne = false;
        for (const idx of confNumIndexes) {
          if (keptOne) {
            console.log(`Dropping duplicate confirmationNumber index: ${idx.name}`);
            await db.collection('appointments').dropIndex(idx.name);
          } else if (idx.unique) {
            keptOne = true;
            console.log(`Keeping unique index: ${idx.name}`);
          }
        }
      } else {
        console.log('\nNo duplicate confirmationNumber indexes found');
      }
    } catch (error) {
      console.error('Error checking appointments indexes:', error.message);
    }

    console.log('\n===========================================');
    console.log('  MIGRATION COMPLETE');
    console.log('===========================================');
    console.log('\nThe duplicate index warnings should no longer appear.');
    console.log('Customer creation with null emails should now work.');
    process.exit(0);

  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
runMigration();
