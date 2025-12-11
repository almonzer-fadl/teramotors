/**
 * Script to check ALL users in database regardless of tenantId
 * Run from project root: MONGODB_URI="..." node scripts/check-all-users.js
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

async function checkAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get database
    const db = mongoose.connection.db;

    // Get ALL users
    const users = await db.collection('users').find({}).toArray();

    console.log('📊 Total users in database:', users.length);
    console.log('=====================================\n');

    if (users.length === 0) {
      console.log('⚠️  No users found in database!\n');
    } else {
      for (const user of users) {
        console.log('User:');
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`  Role: ${user.role || 'N/A'}`);
        console.log(`  TenantId: ${user.tenantId || 'MISSING'}`);
        console.log(`  Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
        console.log(`  Created: ${user.createdAt || 'N/A'}`);
        console.log('');
      }
    }

    // Also check ALL customers
    const customers = await db.collection('customers').find({}).toArray();
    console.log('=====================================');
    console.log('📊 Total customers in database:', customers.length);
    console.log('=====================================\n');

    if (customers.length > 0) {
      for (const customer of customers) {
        console.log('Customer:');
        console.log(`  Name: ${customer.firstName || 'N/A'} ${customer.lastName || 'N/A'}`);
        console.log(`  Phone: ${customer.phone || 'N/A'}`);
        console.log(`  TenantId: ${customer.tenantId || 'MISSING'}`);
        console.log('');
      }
    }

    // Check ALL vehicles
    const vehicles = await db.collection('vehicles').find({}).toArray();
    console.log('=====================================');
    console.log('📊 Total vehicles in database:', vehicles.length);
    console.log('=====================================\n');

    if (vehicles.length > 0) {
      for (const vehicle of vehicles) {
        console.log('Vehicle:');
        console.log(`  Make/Model: ${vehicle.make || 'N/A'} ${vehicle.model || 'N/A'}`);
        console.log(`  Year: ${vehicle.year || 'N/A'}`);
        console.log(`  License: ${vehicle.licensePlate || 'N/A'}`);
        console.log(`  TenantId: ${vehicle.tenantId || 'MISSING'}`);
        console.log(`  CustomerId: ${vehicle.customerId || 'MISSING'}`);
        console.log('');
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

checkAllUsers();
