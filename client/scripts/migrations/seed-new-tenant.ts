import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { Tenant } from '@/lib/models/Tenant';
import User from '@/lib/models/User';
import InspectionTemplate from '@/lib/models/InspectionTemplate';
import Service from '@/lib/models/Service';

interface SeedTenantOptions {
  name: string;
  slug: string;
  companyInfo: any;
  adminUser: {
    name: string;
    email: string;
    password: string;
  };
}

/**
 * Seed a new tenant with default data
 */
async function seedNewTenant(options: SeedTenantOptions) {
  try {
    await connectToDatabase();

    console.log(`🚀 Seeding new tenant: ${options.name}`);

    // Create tenant
    const tenant = await Tenant.create({
      name: options.name,
      slug: options.slug,
      status: 'trial',
      companyInfo: options.companyInfo,
      subscription: {
        plan: 'basic',
        startDate: new Date(),
        maxUsers: 5,
        maxVehicles: 100,
      },
    });

    console.log(`✅ Created tenant: ${tenant._id}`);

    // Create admin user
    const hashedPassword = await bcrypt.hash(options.adminUser.password, 10);

    const adminUser = await User.create({
      tenantId: tenant._id,
      name: options.adminUser.name,
      email: options.adminUser.email,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);

    // Create default inspection template
    const defaultTemplate = await InspectionTemplate.create({
      tenantId: tenant._id,
      name: 'Standard Vehicle Inspection',
      vehicleType: 'sedan',
      isActive: true,
      items: [
        { itemId: '1', name: 'Body Condition', category: 'Exterior' },
        { itemId: '2', name: 'Paint', category: 'Exterior' },
        { itemId: '3', name: 'Lights', category: 'Exterior' },
        { itemId: '4', name: 'Tires', category: 'Exterior' },
        { itemId: '5', name: 'Seats', category: 'Interior' },
        { itemId: '6', name: 'Dashboard', category: 'Interior' },
        { itemId: '7', name: 'Controls', category: 'Interior' },
        { itemId: '8', name: 'AC', category: 'Interior' },
        { itemId: '9', name: 'Oil Level', category: 'Engine' },
        { itemId: '10', name: 'Coolant', category: 'Engine' },
        { itemId: '11', name: 'Battery', category: 'Engine' },
        { itemId: '12', name: 'Belts', category: 'Engine' },
      ],
    });

    console.log('✅ Created default inspection template');

    // Create default services
    const defaultServices = [
      { code: 'OC001', name: 'Oil Change', laborRate: 150, laborHours: 1 },
      { code: 'BI001', name: 'Basic Inspection', laborRate: 100, laborHours: 0.5 },
      { code: 'BR001', name: 'Brake Service', laborRate: 300, laborHours: 2 },
      { code: 'TR001', name: 'Tire Rotation', laborRate: 80, laborHours: 0.5 },
    ];

    for (const svc of defaultServices) {
      await Service.create({
        tenantId: tenant._id,
        code: svc.code,
        name: svc.name,
        laborRate: svc.laborRate,
        laborHours: svc.laborHours,
        isActive: true,
      });
    }

    console.log('✅ Created default services');

    console.log('🎉 Tenant seeded successfully!');
    console.log(`📊 Tenant ID: ${tenant._id}`);
    console.log(`👤 Admin Email: ${adminUser.email}`);

    return {
      tenant,
      adminUser,
    };

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Example usage
if (require.main === module) {
  seedNewTenant({
    name: 'Test Company',
    slug: 'test-company',
    companyInfo: {
      name: 'Test Auto Repair',
      vatNumber: '123456789012345',
      address: {
        city: 'Riyadh',
        country: 'SA',
      },
      phone: '+966501234567',
      email: 'info@testcompany.com',
    },
    adminUser: {
      name: 'Admin User',
      email: 'admin@testcompany.com',
      password: 'ChangeMe123!',
    },
  })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedNewTenant;
