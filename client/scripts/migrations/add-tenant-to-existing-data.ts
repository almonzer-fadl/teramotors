import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Tenant } from '@/lib/models/Tenant';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';
import Appointment from '@/lib/models/Appointment';
import JobCard from '@/lib/models/JobCard';
import Service from '@/lib/models/Service';
import Part from '@/lib/models/Part';
import Invoice from '@/lib/models/Invoice';
import Estimate from '@/lib/models/Estimate';
import Payment from '@/lib/models/Payment';
import VehicleInspection from '@/lib/models/VehicleInspection';
import InspectionTemplate from '@/lib/models/InspectionTemplate';
import User from '@/lib/models/User';

/**
 * Migration script to add tenantId to all existing data
 * This assumes you're migrating a single-tenant installation
 */
async function migrateExistingDataToTenant() {
  try {
    await connectDB();

    console.log('🚀 Starting migration...');

    // Step 1: Create default tenant for existing data
    console.log('📝 Creating default tenant...');
    const defaultTenant = await Tenant.create({
      name: 'TeraMotors',
      slug: 'teramotors-default',
      status: 'active',
      companyInfo: {
        name: 'شركه تيرا فيجنز',
        vatNumber: '314211338900003',
        address: {
          city: 'Riyadh',
          country: 'SA',
        },
      },
      subscription: {
        plan: 'enterprise',
        startDate: new Date(),
        maxUsers: 100,
        maxVehicles: 10000,
      },
    });

    console.log(`✅ Created tenant: ${defaultTenant._id}`);

    const tenantId = defaultTenant._id;

    // Step 2: Update all collections
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

    for (const collection of collections) {
      console.log(`📦 Migrating ${collection.name}...`);

      const result = await collection.model.updateMany(
        { tenantId: { $exists: false } }, // Only update documents without tenantId
        { $set: { tenantId } }
      );

      console.log(`✅ Updated ${result.modifiedCount} ${collection.name}`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Default Tenant ID: ${tenantId}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run migration
if (require.main === module) {
  migrateExistingDataToTenant()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default migrateExistingDataToTenant;
