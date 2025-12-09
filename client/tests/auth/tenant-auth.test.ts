import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createTenant } from '@/lib/tenant-utils';
import { createSession } from '@/lib/simple-auth';
import { connectToDatabase } from '@/lib/db';

const mockCookieStore = (() => {
  const store = new Map<string, { value: string }>();
  return {
    get: (name: string) => store.get(name),
    set: (name: string, value: string) => {
      store.set(name, { value });
      return store.get(name);
    },
    delete: (name: string) => {
      store.delete(name);
    },
  };
})();

jest.mock('next/headers', () => ({
  cookies: () => mockCookieStore,
}));

describe('Tenant Authentication', () => {
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

  it('creates a session that includes tenant context', async () => {
    const tenant = await createTenant({
      name: 'Test Tenant',
      slug: 'test-tenant',
      companyInfo: {
        name: 'Test Tenant',
        address: { city: 'Riyadh', country: 'SA' },
      },
    });

    tenant.status = 'active';
    await tenant.save();

    const session = await createSession({
      id: new mongoose.Types.ObjectId().toString(),
      email: 'tenant-user@example.com',
      name: 'Tenant User',
      role: 'admin',
      tenantId: tenant._id.toString(),
    });

    expect(session).toBeDefined();
    expect(session.user.tenantId).toEqual(tenant._id.toString());
  });

  it('allows creating session for super admin without tenant', async () => {
    const session = await createSession({
      id: new mongoose.Types.ObjectId().toString(),
      email: 'super@example.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    });

    expect(session).toBeDefined();
    expect(session.user.role).toBe('SUPER_ADMIN');
    expect(session.user.tenantId).toBeUndefined();
  });
});
