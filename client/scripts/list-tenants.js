const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function listTenants() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to MongoDB\n');

    // Define tenant schema if not already defined
    const tenantSchema = new mongoose.Schema({}, { strict: false });
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema, 'tenants');

    const tenants = await Tenant.find({}).select('slug name status').lean();

    if (tenants.length === 0) {
      console.log('❌ No tenants found in database');
    } else {
      console.log(`✅ Found ${tenants.length} tenant(s):\n`);
      tenants.forEach(tenant => {
        console.log(`  📍 Slug: ${tenant.slug}`);
        console.log(`     Name: ${tenant.name}`);
        console.log(`     Status: ${tenant.status || 'N/A'}`);
        console.log(`     ID: ${tenant._id}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

listTenants();
