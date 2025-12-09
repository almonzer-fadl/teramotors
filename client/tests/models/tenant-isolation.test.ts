import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Tenant } from '@/lib/models/Tenant';
import Customer from '@/lib/models/Customer';
import Vehicle from '@/lib/models/Vehicle';

describe('Model Tenant Isolation', () => {
  let tenant1: any;
  let tenant2: any;

  beforeAll(async () => {
    await connectDB();

    // Create two test tenants
    tenant1 = await Tenant.create({
      name: 'Tenant 1',
      slug: 'tenant-1',
      companyInfo: { name: 'Company 1', address: { city: 'Riyadh', country: 'SA' } },
      subscription: {
        plan: 'basic',
        startDate: new Date(),
        maxUsers: 5,
        maxVehicles: 100,
      },
    });

    tenant2 = await Tenant.create({
      name: 'Tenant 2',
      slug: 'tenant-2',
      companyInfo: { name: 'Company 2', address: { city: 'Jeddah', country: 'SA' } },
      subscription: {
        plan: 'basic',
        startDate: new Date(),
        maxUsers: 5,
        maxVehicles: 100,
      },
    });
  });

  afterAll(async () => {
    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Tenant.deleteMany({});
    await mongoose.connection.close();
  });

  it('should isolate customers by tenant', async () => {
    // Create customer for tenant 1
    const customer1 = await Customer.create({
      tenantId: tenant1._id,
      firstName: 'Ahmed',
      lastName: 'Ali',
      email: 'ahmed@example.com',
      phone: '+966501234567',
    });

    // Create customer for tenant 2 with same email (should work)
    const customer2 = await Customer.create({
      tenantId: tenant2._id,
      firstName: 'Mohamed',
      lastName: 'Salem',
      email: 'ahmed@example.com', // Same email, different tenant
      phone: '+966501234568',
    });

    // Query tenant 1 customers
    const tenant1Customers = await Customer.find({ tenantId: tenant1._id });
    expect(tenant1Customers.length).toBe(1);
    expect(tenant1Customers[0].firstName).toBe('Ahmed');

    // Query tenant 2 customers
    const tenant2Customers = await Customer.find({ tenantId: tenant2._id });
    expect(tenant2Customers.length).toBe(1);
    expect(tenant2Customers[0].firstName).toBe('Mohamed');
  });

  it('should prevent duplicate emails within same tenant', async () => {
    await expect(async () => {
      await Customer.create({
        tenantId: tenant1._id,
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'ahmed@example.com', // Already exists for tenant1
        phone: '+966509999999',
      });
    }).rejects.toThrow();
  });

  it('should isolate vehicles by tenant', async () => {
    const customer1 = await Customer.findOne({ tenantId: tenant1._id });
    const customer2 = await Customer.findOne({ tenantId: tenant2._id });

    // Create vehicle for tenant 1
    await Vehicle.create({
      tenantId: tenant1._id,
      customerId: customer1._id,
      licensePlate: 'ABC-1234',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
    });

    // Create vehicle for tenant 2 with same plate number
    await Vehicle.create({
      tenantId: tenant2._id,
      customerId: customer2._id,
      licensePlate: 'ABC-1234', // Same plate, different tenant
      make: 'Honda',
      model: 'Accord',
      year: 2023,
    });

    const tenant1Vehicles = await Vehicle.find({ tenantId: tenant1._id });
    expect(tenant1Vehicles.length).toBe(1);
    expect(tenant1Vehicles[0].make).toBe('Toyota');

    const tenant2Vehicles = await Vehicle.find({ tenantId: tenant2._id });
    expect(tenant2Vehicles.length).toBe(1);
    expect(tenant2Vehicles[0].make).toBe('Honda');
  });
});
