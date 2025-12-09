# Developer 1: Foundation & Auth Implementation Guide

**Branch:** `tenet/dev1-foundation-auth`
**Timeline:** Weeks 1-4
**Dependencies:** None (start immediately)

---

## 🚀 Setup

```bash
# Create your branch
git checkout tenet
git pull origin tenet
git checkout -b tenet/dev1-foundation-auth

# Install dependencies (if needed)
npm install
```

---

## Week 1: Core Tenant Model & Infrastructure

### Task 1.1: Create Tenant Model

**File:** `/lib/models/Tenant.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string; // URL-friendly identifier
  status: 'active' | 'suspended' | 'trial' | 'cancelled';

  // Company information
  companyInfo: {
    name: string;
    nameAr?: string;
    vatNumber?: string;
    crNumber?: string; // Commercial Registration
    address: {
      street?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      country?: string;
    };
    phone?: string;
    email?: string;
    website?: string;
  };

  // Subscription
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    maxUsers: number;
    maxVehicles: number;
  };

  // Settings
  settings: {
    timezone: string;
    currency: string;
    locale: string;
    dateFormat: string;
  };

  // Branding
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const TenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial', 'cancelled'],
    default: 'trial',
    index: true,
  },
  companyInfo: {
    name: { type: String, required: true },
    nameAr: String,
    vatNumber: String,
    crNumber: String,
    address: {
      street: String,
      city: String,
      district: String,
      postalCode: String,
      country: { type: String, default: 'SA' },
    },
    phone: String,
    email: String,
    website: String,
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'trial',
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    maxUsers: { type: Number, default: 5 },
    maxVehicles: { type: Number, default: 100 },
  },
  settings: {
    timezone: { type: String, default: 'Asia/Riyadh' },
    currency: { type: String, default: 'SAR' },
    locale: { type: String, default: 'ar-SA' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
  },
  branding: {
    logoUrl: String,
    primaryColor: { type: String, default: '#3b82f6' },
    secondaryColor: { type: String, default: '#10b981' },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ status: 1 });
TenantSchema.index({ 'subscription.plan': 1 });

// Methods
TenantSchema.methods.isActive = function(): boolean {
  return this.status === 'active' || this.status === 'trial';
};

TenantSchema.methods.hasExpired = function(): boolean {
  if (!this.subscription.endDate) return false;
  return new Date() > this.subscription.endDate;
};

export const Tenant = mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
```

### Task 1.2: Create Tenant Utilities

**File:** `/lib/tenant-utils.ts`

```typescript
import { ITenant, Tenant } from './models/Tenant';
import mongoose from 'mongoose';

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string | mongoose.Types.ObjectId): Promise<ITenant | null> {
  return await Tenant.findById(tenantId);
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<ITenant | null> {
  return await Tenant.findOne({ slug });
}

/**
 * Validate tenant is active
 */
export async function validateTenantActive(tenantId: string | mongoose.Types.ObjectId): Promise<boolean> {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return false;

  return tenant.isActive() && !tenant.hasExpired();
}

/**
 * Create a new tenant
 */
export async function createTenant(data: {
  name: string;
  slug: string;
  companyInfo: ITenant['companyInfo'];
  createdBy?: mongoose.Types.ObjectId;
}): Promise<ITenant> {
  const tenant = new Tenant({
    name: data.name,
    slug: data.slug,
    companyInfo: data.companyInfo,
    status: 'trial',
    createdBy: data.createdBy,
  });

  await tenant.save();
  return tenant;
}

/**
 * Generate slug from company name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Check if user belongs to tenant
 */
export async function userBelongsToTenant(
  userId: string | mongoose.Types.ObjectId,
  tenantId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  const User = (await import('./models/User')).User;
  const user = await User.findById(userId);

  if (!user) return false;
  return user.tenantId?.toString() === tenantId.toString();
}
```

### Task 1.3: Create Tenant Context Middleware

**File:** `/lib/middleware/tenant-context.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from './simple-auth';
import { validateTenantActive } from '../tenant-utils';

export interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: string;
}

/**
 * Extract tenant context from request
 */
export async function getTenantContext(req: NextRequest): Promise<TenantContext | null> {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  const tenantId = session.user.tenantId;

  if (!tenantId) {
    // Super admin has no tenant - this is OK
    if (session.user.role === 'SUPER_ADMIN') {
      return {
        tenantId: '', // Empty for super admin
        userId: session.user.id,
        userRole: session.user.role,
      };
    }
    return null;
  }

  // Validate tenant is active
  const isActive = await validateTenantActive(tenantId);
  if (!isActive) {
    return null;
  }

  return {
    tenantId,
    userId: session.user.id,
    userRole: session.user.role,
  };
}

/**
 * Middleware to require tenant context
 */
export function requireTenantContext() {
  return async (req: NextRequest) => {
    const context = await getTenantContext(req);

    if (!context) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid tenant context' },
        { status: 401 }
      );
    }

    // Add to request headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-tenant-id', context.tenantId);
    requestHeaders.set('x-user-id', context.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };
}
```

---

## Week 2: Authentication System Updates

### Task 2.1: Update JWT Payload

**File:** `/lib/simple-auth.ts` (UPDATE)

Find the `createSession` function and update it:

```typescript
// BEFORE
export async function createSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  // ...
}

// AFTER
export async function createSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string; // ADD THIS
}) {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId, // ADD THIS
    },
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };

  // ... rest of function
}
```

Update the session type:

```typescript
export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId?: string; // ADD THIS
  };
  exp: number;
}
```

### Task 2.2: Create withTenantAuth Middleware

**File:** `/lib/middleware/withTenantAuth.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../simple-auth';
import { validateTenantActive } from '../tenant-utils';

export type TenantAuthOptions = {
  requireTenant?: boolean;
  allowedRoles?: string[];
  allowSuperAdmin?: boolean;
};

/**
 * Higher-order function for tenant-aware authentication
 */
export function withTenantAuth(
  handler: (req: NextRequest, context: {
    session: any;
    tenantId: string;
    params?: any;
  }) => Promise<NextResponse>,
  options: TenantAuthOptions = {}
) {
  return async (req: NextRequest, { params }: any = {}) => {
    const {
      requireTenant = true,
      allowedRoles = [],
      allowSuperAdmin = false,
    } = options;

    // Get session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Check if super admin
    if (session.user.role === 'SUPER_ADMIN' && allowSuperAdmin) {
      return handler(req, { session, tenantId: '', params });
    }

    // Check role
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check tenant
    const tenantId = session.user.tenantId;

    if (requireTenant && !tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized - No tenant assigned' },
        { status: 401 }
      );
    }

    // Validate tenant is active
    if (tenantId) {
      const isActive = await validateTenantActive(tenantId);
      if (!isActive) {
        return NextResponse.json(
          { error: 'Forbidden - Tenant is not active' },
          { status: 403 }
        );
      }
    }

    // Call handler with context
    return handler(req, { session, tenantId: tenantId || '', params });
  };
}
```

### Task 2.3: Update User Model

**File:** `/lib/models/User.ts` (UPDATE)

Add tenantId field:

```typescript
// ADD TO INTERFACE
export interface IUser extends Document {
  // ... existing fields
  tenantId?: mongoose.Types.ObjectId; // ADD THIS
  isSuperAdmin?: boolean; // ADD THIS
}

// ADD TO SCHEMA
const UserSchema = new Schema<IUser>({
  // ... existing fields

  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true,
    // Not required - super admins don't have tenants
  },

  isSuperAdmin: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ['admin', 'mechanic', 'inspector', 'SUPER_ADMIN'], // ADD SUPER_ADMIN
    default: 'mechanic',
  },
}, {
  timestamps: true,
});

// UPDATE INDEXES - email should be unique per tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, isActive: 1 });
```

### Task 2.4: Update Login Flow

**File:** `/app/api/auth/login/route.ts` (UPDATE)

Update the login response to include tenantId:

```typescript
// Find user and include tenantId in session
const user = await User.findOne({ email }).select('+password');

if (!user || !user.isActive) {
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}

// Verify password
const isValid = await bcrypt.compare(password, user.password);
if (!isValid) {
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}

// Create session WITH tenantId
await createSession({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  tenantId: user.tenantId?.toString(), // ADD THIS
});
```

---

## Week 3: Session & Middleware

### Task 3.1: Update Next.js Middleware

**File:** `/middleware.ts` (UPDATE)

Add tenant context to protected routes:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from './lib/simple-auth';
import { validateTenantActive } from './lib/tenant-utils';

export async function middleware(request: NextRequest) {
  const session = await getServerSession();

  // Public routes
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const path = request.nextUrl.pathname;

  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Require authentication
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Super admin bypass
  if (session.user.role === 'SUPER_ADMIN') {
    return NextResponse.next();
  }

  // Validate tenant
  if (!session.user.tenantId) {
    return NextResponse.redirect(new URL('/no-tenant', request.url));
  }

  const isActive = await validateTenantActive(session.user.tenantId);
  if (!isActive) {
    return NextResponse.redirect(new URL('/tenant-suspended', request.url));
  }

  // Add tenant context to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', session.user.tenantId);
  requestHeaders.set('x-user-id', session.user.id);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Task 3.2: Create Tenant API Routes

**File:** `/app/api/tenants/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Tenant } from '@/lib/models/Tenant';
import { createTenant, generateSlug } from '@/lib/tenant-utils';
import connectDB from '@/lib/db';

// GET /api/tenants - List all tenants (super admin only)
export const GET = withTenantAuth(
  async (req, { session }) => {
    await connectDB();

    const tenants = await Tenant.find()
      .select('-__v')
      .sort({ createdAt: -1 });

    return NextResponse.json({ tenants });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

// POST /api/tenants - Create new tenant (super admin only)
export const POST = withTenantAuth(
  async (req, { session }) => {
    await connectDB();

    const data = await req.json();
    const { name, companyInfo } = data;

    if (!name || !companyInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(name);

    // Check if slug exists
    const existing = await Tenant.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create tenant
    const tenant = await createTenant({
      name,
      slug,
      companyInfo,
      createdBy: session.user.id,
    });

    return NextResponse.json({ tenant }, { status: 201 });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);
```

**File:** `/app/api/tenants/[id]/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Tenant } from '@/lib/models/Tenant';
import connectDB from '@/lib/db';

// GET /api/tenants/[id]
export const GET = withTenantAuth(
  async (req, { params }) => {
    await connectDB();

    const tenant = await Tenant.findById(params.id);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

// PUT /api/tenants/[id]
export const PUT = withTenantAuth(
  async (req, { params }) => {
    await connectDB();

    const data = await req.json();

    const tenant = await Tenant.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);

// DELETE /api/tenants/[id]
export const DELETE = withTenantAuth(
  async (req, { params }) => {
    await connectDB();

    // Soft delete - set status to cancelled
    const tenant = await Tenant.findByIdAndUpdate(
      params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tenant cancelled successfully' });
  },
  { requireTenant: false, allowSuperAdmin: true, allowedRoles: ['SUPER_ADMIN'] }
);
```

---

## Week 4: Testing & Documentation

### Task 4.1: Create Auth Tests

**File:** `/tests/auth/tenant-auth.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createSession, getServerSession } from '@/lib/simple-auth';
import { createTenant } from '@/lib/tenant-utils';
import { Tenant } from '@/lib/models/Tenant';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

describe('Tenant Authentication', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await Tenant.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create session with tenant context', async () => {
    const tenant = await createTenant({
      name: 'Test Company',
      slug: 'test-company',
      companyInfo: {
        name: 'Test Company Inc.',
        address: { city: 'Riyadh', country: 'SA' },
      },
    });

    const session = await createSession({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      tenantId: tenant._id.toString(),
    });

    expect(session).toBeDefined();
    expect(session.user.tenantId).toBe(tenant._id.toString());
  });

  it('should allow super admin without tenant', async () => {
    const session = await createSession({
      id: 'super-admin-id',
      email: 'super@example.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    });

    expect(session).toBeDefined();
    expect(session.user.tenantId).toBeUndefined();
  });
});
```

### Task 4.2: Create Integration Tests

**File:** `/tests/auth/tenant-isolation.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { validateTenantActive, userBelongsToTenant } from '@/lib/tenant-utils';

describe('Tenant Isolation', () => {
  it('should validate active tenant', async () => {
    // Test implementation
  });

  it('should reject suspended tenant', async () => {
    // Test implementation
  });

  it('should verify user belongs to tenant', async () => {
    // Test implementation
  });
});
```

---

## 🧪 Testing Checklist

- [ ] Tenant model CRUD operations work
- [ ] JWT includes tenantId
- [ ] Login flow creates session with tenant context
- [ ] Middleware validates tenant on protected routes
- [ ] Super admin can access without tenant
- [ ] Regular users cannot access without active tenant
- [ ] withTenantAuth middleware works correctly
- [ ] Tenant API routes work (super admin only)

---

## 📝 Merge Checklist

Before merging to `tenet`:

- [ ] All tests passing
- [ ] Code reviewed by peer
- [ ] No breaking changes to existing code
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] TypeScript compiles without errors
- [ ] ESLint passes

---

## 🆘 Common Issues & Solutions

**Issue:** TypeScript errors on User model
**Solution:** Make sure to coordinate with Dev 2 on User model changes

**Issue:** JWT not including tenantId
**Solution:** Check that createSession is being called with tenantId parameter

**Issue:** Middleware blocking all requests
**Solution:** Verify session is being read correctly and tenant validation logic

---

**Questions? Contact Tech Lead or post in #tenet-migration**
