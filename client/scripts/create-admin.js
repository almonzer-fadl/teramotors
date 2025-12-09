/**
 * Script to create admin user
 * Run: cd client && node scripts/create-admin.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string from .env.local
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function createAdminUser() {
  try {
    // Connect to MongoDB with the same database name as the app
    await mongoose.connect(MONGODB_URI, {
      dbName: 'teramotors'
    });
    console.log('✅ Connected to MongoDB (database: teramotors)');

    // Define User schema (simplified)
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: String,
      lastName: String,
      fullName: String,
      role: { type: String, enum: ['SUPER_ADMIN', 'admin', 'mechanic', 'inspector'], default: 'mechanic' },
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
      isActive: { type: Boolean, default: true },
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if super admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@teramotor.cc' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);

      // Update to SUPER_ADMIN role if needed
      const updateRole = process.argv.includes('--update-role');
      if (updateRole || existingAdmin.role !== 'SUPER_ADMIN') {
        const hashedPassword = await bcrypt.hash('Teramotor@admin275213', 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.role = 'SUPER_ADMIN';
        existingAdmin.firstName = 'Super';
        existingAdmin.lastName = 'Admin';
        existingAdmin.fullName = 'Super Admin';
        existingAdmin.tenantId = null; // Super admin doesn't need tenantId
        await existingAdmin.save();
        console.log('✅ User updated to SUPER_ADMIN successfully!');
        console.log('📧 Email: admin@teramotor.cc');
        console.log('🔑 Password: Teramotor@admin275213');
        console.log('👑 Role: SUPER_ADMIN');
        console.log('👤 Name: Super Admin');
      }

      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Teramotor@admin275213', 10);

    // Create SUPER_ADMIN user (no tenantId needed)
    const adminUser = await User.create({
      email: 'admin@teramotor.cc',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      // No tenantId for SUPER_ADMIN - they can access all tenants
      isActive: true,
    });

    console.log('\n🎉 Super Admin user created successfully!');
    console.log('=====================================');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: Teramotor@admin275213');
    console.log('👑 Role:', adminUser.role);
    console.log('🌐 Access: All Tenants (System-wide)');
    console.log('=====================================\n');
    console.log('You can now login at: http://localhost:3000/login');
    console.log('\n⚠️  IMPORTANT: This is a SUPER_ADMIN account with system-wide access!');
    console.log('This account can:');
    console.log('  - Access the /admin panel');
    console.log('  - Run database migrations');
    console.log('  - Manage all tenants');
    console.log('  - View all system data\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
