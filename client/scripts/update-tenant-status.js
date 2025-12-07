const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function updateTenantStatus() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB\n');

    const TenantSchema = new mongoose.Schema({}, { strict: false });
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');

    const result = await Tenant.updateOne(
      { slug: 'default' },
      { $set: { status: 'active' } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Tenant status updated to "active"');
    } else {
      console.log('⚠️  Tenant already has status "active" or tenant not found');
    }

    const tenant = await Tenant.findOne({ slug: 'default' });
    console.log('\n📋 Tenant Info:');
    console.log(`   Slug: ${tenant.slug}`);
    console.log(`   Name: ${tenant.name}`);
    console.log(`   Status: ${tenant.status}`);
    console.log(`   ID: ${tenant._id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateTenantStatus();
