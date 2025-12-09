import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  validateTenantActive,
  userBelongsToTenant,
  createTenant,
} from '@/lib/tenant-utils';
import User from '@/lib/models/User';
import { connectToDatabase } from '@/lib/db';

describe('Tenant Isolation Utilities', () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    await connectToDatabase();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
  });

  it('validates active tenant', async () => {
    const tenant = await createTenant({
      name: 'Active Tenant',
      slug: 'active-tenant',
      companyInfo: {
        name: 'Active Tenant',
        address: { city: 'Riyadh', country: 'SA' },
      },
    });

    tenant.status = 'active';
    await tenant.save();

    const isActive = await validateTenantActive(tenant._id);
    expect(isActive).toBe(true);
  });

  it('rejects suspended tenant', async () => {
    const tenant = await createTenant({
      name: 'Suspended Tenant',
      slug: 'suspended-tenant',
      companyInfo: {
        name: 'Suspended Tenant',
        address: { city: 'Jeddah', country: 'SA' },
      },
    });

    tenant.status = 'suspended';
    await tenant.save();

    const isActive = await validateTenantActive(tenant._id);
    expect(isActive).toBe(false);
  });

  it('verifies user belongs to tenant', async () => {
    const tenant = await createTenant({
      name: 'Tenant One',
      slug: 'tenant-one',
      companyInfo: {
        name: 'Tenant One',
        address: { city: 'Dammam', country: 'SA' },
      },
    });
    tenant.status = 'active';
    await tenant.save();

    const otherTenant = await createTenant({
      name: 'Tenant Two',
      slug: 'tenant-two',
      companyInfo: {
        name: 'Tenant Two',
        address: { city: 'Abha', country: 'SA' },
      },
    });

    const user = await User.create({
      email: 'member@example.com',
      password: 'hashed-password',
      firstName: 'Member',
      lastName: 'User',
      role: 'admin',
      tenantId: tenant._id,
      isActive: true,
    });

    const belongsToTenant = await userBelongsToTenant(user._id, tenant._id);
    const belongsToOtherTenant = await userBelongsToTenant(
      user._id,
      otherTenant._id
    );

    expect(belongsToTenant).toBe(true);
    expect(belongsToOtherTenant).toBe(false);
  });
});
