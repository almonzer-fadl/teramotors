const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

/**
 * Create a demo customer for testing the customer portal
 * This script will:
 * 1. Find the teramotors tenant
 * 2. Create a demo customer with portal access enabled
 * 3. Create demo vehicles for the customer
 * 4. Create demo appointments
 */

async function createDemoCustomer() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teramotors';
    await mongoose.connect(mongoUri, {
      dbName: 'teramotors'
    });

    console.log('🚀 Creating demo customer for portal testing...\n');

    // Define schemas
    const TenantSchema = new mongoose.Schema({}, { strict: false });
    const CustomerSchema = new mongoose.Schema({}, { strict: false });
    const VehicleSchema = new mongoose.Schema({}, { strict: false });
    const AppointmentSchema = new mongoose.Schema({}, { strict: false });
    const ServiceSchema = new mongoose.Schema({}, { strict: false });

    // Get or create models
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema, 'tenants');
    const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema, 'customers');
    const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema, 'vehicles');
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema, 'appointments');
    const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema, 'services');

    // Find the teramotors tenant
    const tenant = await Tenant.findOne({ slug: 'teramotors-default' });

    if (!tenant) {
      console.log('❌ Default tenant not found!');
      console.log('📝 Available tenants:');
      const tenants = await Tenant.find({}).select('slug name');
      tenants.forEach(t => console.log(`   - ${t.slug} (${t.name})`));
      throw new Error('Default tenant not found');
    }

    console.log(`✅ Found tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`   Tenant ID: ${tenant._id}\n`);

    // Check if demo customer already exists
    let customer = await Customer.findOne({
      tenantId: tenant._id,
      email: 'demo@customer.com'
    });

    if (customer) {
      console.log('⚠️  Demo customer already exists!');
      console.log(`   Customer ID: ${customer._id}`);
      console.log(`   Name: ${customer.firstName} ${customer.lastName}`);
      console.log(`   Email: ${customer.email}`);

      // Update portal access to ensure it's enabled
      customer.portalAccess = {
        enabled: true,
        lastLogin: undefined,
        otpSecret: undefined,
        otpCreatedAt: undefined,
        sessionToken: undefined,
        sessionExpiry: undefined
      };
      await customer.save();
      console.log('✅ Updated portal access settings\n');
    } else {
      // Create demo customer
      customer = await Customer.create({
        tenantId: tenant._id,
        firstName: 'Demo',
        lastName: 'Customer',
        email: 'demo@customer.com',
        phone: '+966501234567',
        isActive: true,
        language: 'en',
        portalAccess: {
          enabled: true,
          lastLogin: undefined,
          otpSecret: undefined,
          otpCreatedAt: undefined,
          sessionToken: undefined,
          sessionExpiry: undefined
        }
      });

      console.log('✅ Created demo customer:');
      console.log(`   Customer ID: ${customer._id}`);
      console.log(`   Name: ${customer.firstName} ${customer.lastName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Portal Access: Enabled\n`);
    }

    // Create demo vehicles
    const existingVehicles = await Vehicle.find({ customerId: customer._id });

    if (existingVehicles.length === 0) {
      const vehicles = await Vehicle.insertMany([
        {
          tenantId: tenant._id,
          customerId: customer._id,
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          licensePlate: 'ABC-1234',
          vin: '1HGBH41JXMN109186',
          color: 'Silver',
          isActive: true
        },
        {
          tenantId: tenant._id,
          customerId: customer._id,
          make: 'Honda',
          model: 'Accord',
          year: 2021,
          licensePlate: 'XYZ-5678',
          vin: '2HGFC2F59MH123456',
          color: 'Black',
          isActive: true
        }
      ]);

      console.log('✅ Created demo vehicles:');
      vehicles.forEach(v => {
        console.log(`   - ${v.year} ${v.make} ${v.model} (${v.licensePlate})`);
      });
      console.log('');
    } else {
      console.log(`✅ Demo customer already has ${existingVehicles.length} vehicle(s)\n`);
    }

    // Get vehicles for appointments
    const vehicles = await Vehicle.find({ customerId: customer._id });

    // Get services for appointments
    const services = await Service.find({ tenantId: tenant._id, isActive: true }).limit(3);

    if (services.length === 0) {
      console.log('⚠️  No services found. Skipping appointment creation.\n');
    } else {
      // Create demo appointments
      const existingAppointments = await Appointment.find({ customerId: customer._id });

      if (existingAppointments.length === 0 && vehicles.length > 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const appointments = await Appointment.insertMany([
          {
            tenantId: tenant._id,
            customerId: customer._id,
            vehicleId: vehicles[0]._id,
            serviceId: services[0]._id,
            scheduledDate: tomorrow,
            scheduledTime: '10:00',
            status: 'confirmed',
            notes: 'Regular maintenance check'
          },
          {
            tenantId: tenant._id,
            customerId: customer._id,
            vehicleId: vehicles.length > 1 ? vehicles[1]._id : vehicles[0]._id,
            serviceId: services.length > 1 ? services[1]._id : services[0]._id,
            scheduledDate: nextWeek,
            scheduledTime: '14:00',
            status: 'pending',
            notes: 'Brake inspection requested'
          },
          {
            tenantId: tenant._id,
            customerId: customer._id,
            vehicleId: vehicles[0]._id,
            serviceId: services.length > 2 ? services[2]._id : services[0]._id,
            scheduledDate: lastMonth,
            scheduledTime: '09:00',
            status: 'completed',
            notes: 'Completed oil change'
          }
        ]);

        console.log('✅ Created demo appointments:');
        console.log(`   - ${appointments.length} appointments created`);
        console.log(`   - 1 upcoming (confirmed)`);
        console.log(`   - 1 upcoming (pending)`);
        console.log(`   - 1 completed\n`);
      } else {
        console.log(`✅ Demo customer already has ${existingAppointments.length} appointment(s)\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Demo Customer Setup Complete!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 TESTING INSTRUCTIONS:\n');
    console.log('1. Go to: http://localhost:3000/portal/teramotors-default/login');
    console.log('2. Enter email: demo@customer.com');
    console.log('3. Click "Continue"');
    console.log('\n⚠️  IMPORTANT - OTP Code:');
    console.log('   Since email is not configured, the OTP will be logged to console.');
    console.log('   After clicking "Continue", check your terminal/server logs.');
    console.log('   Look for a box with the OTP code.\n');
    console.log('   Alternatively, you can query the database directly:');
    console.log('   db.customers.findOne({ email: "demo@customer.com" })');
    console.log('   Look for: portalAccess.otpSecret\n');
    console.log('4. Enter the 6-digit OTP code');
    console.log('5. You will be redirected to the customer portal dashboard\n');
    console.log('═══════════════════════════════════════════════════════\n');

    return {
      tenant,
      customer,
      vehicles
    };

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
createDemoCustomer()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
