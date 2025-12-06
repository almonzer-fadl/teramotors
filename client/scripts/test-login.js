/**
 * Script to test login credentials and schema
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testLogin() {
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
      fullName: String,
      role: {
        type: String,
        enum: ['SUPER_ADMIN', 'admin', 'mechanic', 'inspector'],
        default: 'mechanic'
      },
      tenantId: mongoose.Schema.Types.ObjectId,
      isActive: Boolean,
    });

    // Clear existing model
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }

    const User = mongoose.model('User', UserSchema);

    const email = 'admin@teramotor.cc';
    const password = 'Teramotor@admin275213';

    console.log('🔍 Testing login with:');
    console.log('  📧 Email:', email);
    console.log('  🔑 Password:', password);
    console.log('');

    // Test exact match
    console.log('Testing exact email match...');
    let user = await User.findOne({ email });
    console.log('  Result:', user ? 'Found ✅' : 'Not found ❌');

    // Test case-insensitive match
    if (!user) {
      console.log('Testing case-insensitive match...');
      user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      console.log('  Result:', user ? 'Found ✅' : 'Not found ❌');
    }

    // List all users
    console.log('\nAll users in database:');
    const allUsers = await User.find({}).select('email role').limit(10);
    if (allUsers.length === 0) {
      console.log('  ⚠️  No users found!');
    } else {
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
      });
    }
    console.log('');

    if (!user) {
      console.log('❌ User not found!');
      console.log('   Run: cd client && node scripts/create-admin.js');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ User found in database');
    console.log('=====================================');
    console.log('  📧 Email:', user.email);
    console.log('  👑 Role:', user.role);
    console.log('  👤 Name:', user.firstName, user.lastName);
    console.log('  📝 Full Name:', user.fullName);
    console.log('  ✓ Active:', user.isActive);
    console.log('  🏢 TenantId:', user.tenantId || 'null');
    console.log('  🔑 Has Password:', user.password ? 'Yes' : 'No');
    console.log('=====================================\n');

    // Test password
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log('✅ Password is CORRECT!');
      console.log('✅ Schema includes SUPER_ADMIN role');
      console.log('');
      console.log('You should be able to login with:');
      console.log('=====================================');
      console.log('📧 Email: admin@teramotor.cc');
      console.log('🔑 Password: Teramotor@admin275213');
      console.log('=====================================');
      console.log('');
      console.log('⚠️  If login still fails:');
      console.log('   1. Clear your browser cookies');
      console.log('   2. Restart the development server');
      console.log('   3. Try logging in again');
    } else {
      console.log('❌ Password is INCORRECT!');
      console.log('   The password in the database does not match.');
      console.log('   Run: cd client && node scripts/create-admin.js');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();
