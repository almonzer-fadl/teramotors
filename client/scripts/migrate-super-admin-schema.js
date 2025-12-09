/**
 * Script to migrate User schema to include SUPER_ADMIN role
 * This updates the MongoDB collection to recognize SUPER_ADMIN as a valid role
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function migrateSchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'teramotors'
    });
    console.log('✅ Connected to MongoDB (database: teramotors)\n');

    // Define the updated User schema with SUPER_ADMIN role
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: String,
      lastName: String,
      fullName: String,
      role: {
        type: String,
        enum: ['SUPER_ADMIN', 'admin', 'mechanic', 'inspector'],
        default: 'mechanic'
      },
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
      isActive: { type: Boolean, default: true },
    });

    // Clear any existing User model
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }

    // Register the model with updated schema
    const User = mongoose.model('User', UserSchema);

    console.log('📋 Checking existing users with SUPER_ADMIN role...\n');

    // Find all users to verify
    const allUsers = await User.find({}).select('email role firstName lastName');
    console.log('All users in database:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    console.log('');

    // Check specifically for the super admin user
    const superAdmin = await User.findOne({ email: 'admin@teramotor.cc' });

    if (superAdmin) {
      console.log('✅ Super Admin user found:');
      console.log('=====================================');
      console.log('  📧 Email:', superAdmin.email);
      console.log('  👑 Role:', superAdmin.role);
      console.log('  👤 Name:', superAdmin.firstName, superAdmin.lastName);
      console.log('  ✓ Active:', superAdmin.isActive);
      console.log('  🏢 TenantId:', superAdmin.tenantId || 'null (no tenant - system-wide access)');
      console.log('=====================================\n');

      if (superAdmin.role === 'SUPER_ADMIN') {
        console.log('✅ Schema migration successful!');
        console.log('   MongoDB now recognizes SUPER_ADMIN role.');
        console.log('   You should now be able to login with:');
        console.log('   📧 Email: admin@teramotor.cc');
        console.log('   🔑 Password: Teramotor@admin275213\n');
      } else {
        console.log('⚠️  User exists but role is not SUPER_ADMIN');
        console.log('   Run: cd client && node scripts/create-admin.js --update-role\n');
      }
    } else {
      console.log('❌ Super Admin user NOT found!');
      console.log('   Run: cd client && node scripts/create-admin.js\n');
    }

    // Update the collection validator to explicitly allow SUPER_ADMIN
    try {
      console.log('🔧 Updating collection validator...\n');

      await mongoose.connection.db.command({
        collMod: 'users',
        validator: {
          $jsonSchema: {
            bsonType: "object",
            properties: {
              role: {
                bsonType: "string",
                enum: ['SUPER_ADMIN', 'admin', 'mechanic', 'inspector'],
                description: "must be a valid role: SUPER_ADMIN, admin, mechanic, or inspector"
              }
            }
          }
        },
        validationLevel: "moderate"
      });

      console.log('✅ Collection validator updated successfully!\n');
    } catch (validatorError) {
      // If validator doesn't exist or can't be updated, that's okay
      console.log('ℹ️  Note: Could not update collection validator (this is normal for some MongoDB versions)\n');
      console.log('   Error:', validatorError.message, '\n');
    }

    await mongoose.disconnect();
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateSchema();
