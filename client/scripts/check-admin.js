/**
 * Script to check admin user in database
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'teramotors'
    });
    console.log('✅ Connected to MongoDB (database: teramotors)\n');

    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      role: String,
      tenantId: mongoose.Schema.Types.ObjectId,
      isActive: Boolean,
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const user = await User.findOne({ email: 'admin@teramotor.cc' });

    if (user) {
      console.log('✅ User found:');
      console.log('=====================================');
      console.log('  📧 Email:', user.email);
      console.log('  👑 Role:', user.role);
      console.log('  👤 Name:', user.firstName, user.lastName);
      console.log('  ✓ Active:', user.isActive);
      console.log('  🔑 Has Password:', user.password ? 'Yes' : 'No');
      console.log('  🏢 TenantId:', user.tenantId || 'null (SUPER_ADMIN - no tenant needed)');
      console.log('=====================================\n');

      if (user.role !== 'SUPER_ADMIN') {
        console.log('⚠️  Warning: User role is NOT SUPER_ADMIN!');
        console.log('   Run the create-admin script to update the role.\n');
      }
    } else {
      console.log('❌ User NOT found!');
      console.log('   Run: cd client && node scripts/create-admin.js\n');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser();
