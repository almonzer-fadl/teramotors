/**
 * Script to migrate tenant IDs for all collections
 * Run from project root: node scripts/migrate-tenant-ids.js
 * Or from client directory: node ../scripts/migrate-tenant-ids.js
 *
 * Optional: Specify tenant slug as argument
 * Example: node scripts/migrate-tenant-ids.js teramotors-default
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

// Get tenant slug from command line argument or use default
const tenantSlug = process.argv[2] || 'teramotors-default';

async function migrateTenantIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📋 Target tenant slug: ${tenantSlug}\n`);

    // Define schemas
    const TenantSchema = new mongoose.Schema({
      name: String,
      slug: String,
      status: String,
      companyInfo: Object,
      subscription: Object,
    });

    const UserSchema = new mongoose.Schema({
      email: String,
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    }, { strict: false });

    const GenericSchema = new mongoose.Schema({
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    }, { strict: false });

    const WorkLogSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    }, { strict: false });

    const WhatsAppMessageSchema = new mongoose.Schema({
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
      tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    }, { strict: false });

    // Get or create models
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Customer = mongoose.models.Customer || mongoose.model('Customer', GenericSchema, 'customers');
    const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', GenericSchema, 'vehicles');
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', GenericSchema, 'appointments');
    const JobCard = mongoose.models.JobCard || mongoose.model('JobCard', GenericSchema, 'jobcards');
    const Service = mongoose.models.Service || mongoose.model('Service', GenericSchema, 'services');
    const Part = mongoose.models.Part || mongoose.model('Part', GenericSchema, 'parts');
    const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', GenericSchema, 'invoices');
    const Estimate = mongoose.models.Estimate || mongoose.model('Estimate', GenericSchema, 'estimates');
    const Payment = mongoose.models.Payment || mongoose.model('Payment', GenericSchema, 'payments');
    const VehicleInspection = mongoose.models.VehicleInspection || mongoose.model('VehicleInspection', GenericSchema, 'vehicleinspections');
    const InspectionTemplate = mongoose.models.InspectionTemplate || mongoose.model('InspectionTemplate', GenericSchema, 'inspectiontemplates');
    const WorkLog = mongoose.models.WorkLog || mongoose.model('WorkLog', WorkLogSchema, 'worklogs');
    const WhatsAppMessage = mongoose.models.WhatsAppMessage || mongoose.model('WhatsAppMessage', WhatsAppMessageSchema, 'whatsappmessages');

    // Find or create tenant
    let tenant = await Tenant.findOne({ slug: tenantSlug });

    if (!tenant) {
      console.log(`⚠️  Tenant '${tenantSlug}' not found. Creating...`);
      tenant = await Tenant.create({
        name: 'TeraMotors',
        slug: tenantSlug,
        status: 'active',
        companyInfo: {
          name: 'شركه تيرا فيجنز',
          vatNumber: '314211338900003',
          address: { city: 'Riyadh', country: 'SA' },
        },
        subscription: {
          plan: 'enterprise',
          startDate: new Date(),
          maxUsers: 100,
          maxVehicles: 10000,
        },
      });
      console.log(`✅ Created tenant: ${tenant.name} (${tenant._id})\n`);
    } else {
      console.log(`✅ Found tenant: ${tenant.name} (${tenant._id})\n`);
    }

    const tenantId = tenant._id;

    // Collections to migrate
    const collections = [
      { name: 'Customers', model: Customer },
      { name: 'Vehicles', model: Vehicle },
      { name: 'Appointments', model: Appointment },
      { name: 'JobCards', model: JobCard },
      { name: 'Services', model: Service },
      { name: 'Parts', model: Part },
      { name: 'Invoices', model: Invoice },
      { name: 'Estimates', model: Estimate },
      { name: 'Payments', model: Payment },
      { name: 'VehicleInspections', model: VehicleInspection },
      { name: 'InspectionTemplates', model: InspectionTemplate },
      { name: 'Users', model: User },
    ];

    const collectionUpdates = {};
    const errors = [];

    console.log('🔄 Starting migration...\n');

    // Migrate standard collections
    for (const collection of collections) {
      try {
        const result = await collection.model.updateMany(
          { tenantId: { $exists: false } },
          { $set: { tenantId } }
        );
        collectionUpdates[collection.name] = result.modifiedCount || 0;
        console.log(`✓ ${collection.name}: ${result.modifiedCount} records updated`);
      } catch (err) {
        const errorMsg = `${collection.name}: ${err.message}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
    }

    // Migrate WorkLogs - get tenantId from the associated User
    let workLogsUpdated = 0;
    try {
      const workLogs = await WorkLog.find({ tenantId: { $exists: false } });
      console.log(`\n🔄 Migrating ${workLogs.length} WorkLogs...`);

      for (const workLog of workLogs) {
        try {
          const user = await User.findById(workLog.userId).select('tenantId');
          const derivedTenantId = user?.tenantId || tenantId;
          await WorkLog.findByIdAndUpdate(workLog._id, { tenantId: derivedTenantId });
          workLogsUpdated++;
        } catch (err) {
          errors.push(`WorkLog ${workLog._id}: ${err.message}`);
        }
      }
      console.log(`✓ WorkLogs: ${workLogsUpdated} records updated`);
    } catch (err) {
      errors.push(`WorkLog migration failed: ${err.message}`);
      console.error(`✗ WorkLog migration failed: ${err.message}`);
    }

    // Migrate WhatsAppMessages - get tenantId from the associated Customer
    let whatsappMessagesUpdated = 0;
    try {
      const messages = await WhatsAppMessage.find({ tenantId: { $exists: false } });
      console.log(`\n🔄 Migrating ${messages.length} WhatsApp messages...`);

      for (const message of messages) {
        try {
          const customer = await Customer.findById(message.customerId).select('tenantId');
          const derivedTenantId = customer?.tenantId || tenantId;
          await WhatsAppMessage.findByIdAndUpdate(message._id, { tenantId: derivedTenantId });
          whatsappMessagesUpdated++;
        } catch (err) {
          errors.push(`WhatsAppMessage ${message._id}: ${err.message}`);
        }
      }
      console.log(`✓ WhatsApp Messages: ${whatsappMessagesUpdated} records updated`);
    } catch (err) {
      errors.push(`WhatsAppMessage migration failed: ${err.message}`);
      console.error(`✗ WhatsAppMessage migration failed: ${err.message}`);
    }

    // Summary
    console.log('\n=====================================');
    console.log('🎉 Migration Complete!');
    console.log('=====================================');
    console.log(`Tenant: ${tenant.name} (${tenantSlug})`);
    console.log(`Tenant ID: ${tenantId}`);
    console.log('\nUpdates:');
    Object.keys(collectionUpdates).forEach(key => {
      console.log(`  ${key}: ${collectionUpdates[key]}`);
    });
    console.log(`  WorkLogs: ${workLogsUpdated}`);
    console.log(`  WhatsApp Messages: ${whatsappMessagesUpdated}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Warnings:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n=====================================\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrateTenantIds();
