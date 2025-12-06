/**
 * Script to create admin user
 * Run from project root: node scripts/create-admin-user.js
 * Or from client directory: node ../scripts/create-admin-user.js
 */

const path = require('path');
const clientDir = path.join(__dirname, '../client');

// Change to client directory to access node_modules
process.chdir(clientDir);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - update if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teramotors';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema (simplified)
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: String,
      lastName: String,
      role: { type: String, enum: ['admin', 'mechanic', 'viewer'], default: 'viewer' },
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
      isActive: { type: Boolean, default: true },
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@teramotor.cc' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);

      // Update password if needed
      const updatePassword = process.argv.includes('--update-password');
      if (updatePassword) {
        const hashedPassword = await bcrypt.hash('Teramotor@admin275213', 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Password updated successfully!');
      }

      await mongoose.disconnect();
      return;
    }

    // Get default tenant (first tenant in database)
    const TenantSchema = new mongoose.Schema({
      name: String,
      slug: String,
      isActive: Boolean,
    });
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);

    let tenant = await Tenant.findOne();
    if (!tenant) {
      // Create default tenant if none exists
      tenant = await Tenant.create({
        name: 'Default Workshop',
        slug: 'default',
        isActive: true,
      });
      console.log('✅ Created default tenant:', tenant.name);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Teramotor@admin275213', 10);

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@teramotor.cc',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      tenantId: tenant._id,
      isActive: true,
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log('Email:', adminUser.email);
    console.log('Password: Teramotor@admin275213');
    console.log('Role:', adminUser.role);
    console.log('Tenant:', tenant.name);
    console.log('=====================================\n');
    console.log('You can now login at: http://localhost:3000/login');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
