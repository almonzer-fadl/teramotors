# Developer 3: API Routes & Business Logic Implementation Guide

**Branch:** `tenet/dev3-api-routes`
**Timeline:** Weeks 2-6
**Dependencies:** Requires Dev 1 (auth) and Dev 2 (models) to merge first

---

## 🚀 Setup

```bash
# Wait for Dev 1 and Dev 2 to merge foundation work
# Then create your branch
git checkout tenet
git pull origin tenet
git checkout -b tenet/dev3-api-routes

npm install
```

---

## Week 2: Customer & Vehicle APIs

### Pattern to Follow

Every API route needs:
1. Import `withTenantAuth` middleware
2. Wrap handler with tenant context
3. Filter all queries by `tenantId`
4. Validate referenced resources belong to same tenant

### Task 2.1: Update Customer Routes

**File:** `/app/api/customers/route.ts` (UPDATE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Customer } from '@/lib/models/Customer';
import connectDB from '@/lib/db';

// GET /api/customers
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    // Extract query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build query with tenant filter
    const query: any = { tenantId };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch with tenant filtering
    const customers = await Customer.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  },
  { requireTenant: true }
);

// POST /api/customers
export const POST = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const data = await req.json();

    // Create with tenant context
    const customer = await Customer.create({
      ...data,
      tenantId, // Always set tenantId from auth context
    });

    return NextResponse.json({ customer }, { status: 201 });
  },
  { requireTenant: true }
);
```

**File:** `/app/api/customers/[id]/route.ts` (UPDATE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Customer } from '@/lib/models/Customer';
import connectDB from '@/lib/db';

// GET /api/customers/[id]
export const GET = withTenantAuth(
  async (req, { tenantId, params }) => {
    await connectDB();

    // Filter by BOTH id AND tenantId
    const customer = await Customer.findOne({
      _id: params.id,
      tenantId,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  },
  { requireTenant: true }
);

// PUT /api/customers/[id]
export const PUT = withTenantAuth(
  async (req, { tenantId, params }) => {
    await connectDB();

    const data = await req.json();

    // Update only if belongs to tenant
    const customer = await Customer.findOneAndUpdate(
      { _id: params.id, tenantId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  },
  { requireTenant: true }
);

// DELETE /api/customers/[id]
export const DELETE = withTenantAuth(
  async (req, { tenantId, params }) => {
    await connectDB();

    // Soft delete - set isActive to false
    const customer = await Customer.findOneAndUpdate(
      { _id: params.id, tenantId },
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
```

### Task 2.2: Update Vehicle Routes

**File:** `/app/api/vehicles/route.ts` (UPDATE)

Apply the same pattern:

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Vehicle } from '@/lib/models/Vehicle';
import { Customer } from '@/lib/models/Customer';

// GET /api/vehicles
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    const query: any = { tenantId };
    if (customerId) {
      query.customerId = customerId;
    }

    const vehicles = await Vehicle.find(query)
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ vehicles });
  },
  { requireTenant: true }
);

// POST /api/vehicles
export const POST = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const data = await req.json();

    // CRITICAL: Validate customer belongs to same tenant
    const customer = await Customer.findOne({
      _id: data.customerId,
      tenantId,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or does not belong to your organization' },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.create({
      ...data,
      tenantId,
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  },
  { requireTenant: true }
);
```

**File:** `/app/api/vehicles/[id]/route.ts` (UPDATE)

Same pattern as customers - always filter by `{ _id: params.id, tenantId }`.

---

## Week 3: Job Management APIs

### Task 3.1: Update Appointments Routes

**File:** `/app/api/appointments/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Appointment } from '@/lib/models/Appointment';
import { Customer } from '@/lib/models/Customer';
import { Vehicle } from '@/lib/models/Vehicle';

// GET /api/appointments
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const query: any = { tenantId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'make model plateNumber')
      .sort({ date: 1 });

    return NextResponse.json({ appointments });
  },
  { requireTenant: true }
);

// POST /api/appointments
export const POST = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const data = await req.json();

    // Validate customer and vehicle belong to tenant
    const [customer, vehicle] = await Promise.all([
      Customer.findOne({ _id: data.customerId, tenantId }),
      Vehicle.findOne({ _id: data.vehicleId, tenantId }),
    ]);

    if (!customer || !vehicle) {
      return NextResponse.json(
        { error: 'Customer or vehicle not found' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.create({
      ...data,
      tenantId,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  },
  { requireTenant: true }
);
```

### Task 3.2: Update Job Cards Routes

**File:** `/app/api/job-cards/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { JobCard } from '@/lib/models/JobCard';
import { Customer } from '@/lib/models/Customer';
import { Vehicle } from '@/lib/models/Vehicle';

// GET /api/job-cards
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = { tenantId };
    if (status) {
      query.status = status;
    }

    const jobCards = await JobCard.find(query)
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'make model plateNumber year')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobCards });
  },
  { requireTenant: true }
);

// POST /api/job-cards
export const POST = withTenantAuth(
  async (req, { tenantId, session }) => {
    await connectDB();

    const data = await req.json();

    // Validate customer and vehicle
    const [customer, vehicle] = await Promise.all([
      Customer.findOne({ _id: data.customerId, tenantId }),
      Vehicle.findOne({ _id: data.vehicleId, tenantId }),
    ]);

    if (!customer || !vehicle) {
      return NextResponse.json(
        { error: 'Customer or vehicle not found' },
        { status: 400 }
      );
    }

    // Generate next job card number for this tenant
    const jobCardNumber = await JobCard.getNextJobCardNumber(tenantId);

    const jobCard = await JobCard.create({
      ...data,
      tenantId,
      jobCardNumber,
      createdBy: session.user.id,
    });

    return NextResponse.json({ jobCard }, { status: 201 });
  },
  { requireTenant: true, allowedRoles: ['admin', 'mechanic'] }
);
```

**File:** `/app/api/job-cards/[id]/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { JobCard } from '@/lib/models/JobCard';
import { Service } from '@/lib/models/Service';
import { Part } from '@/lib/models/Part';

// GET /api/job-cards/[id]
export const GET = withTenantAuth(
  async (req, { tenantId, params }) => {
    await connectDB();

    const jobCard = await JobCard.findOne({
      _id: params.id,
      tenantId,
    })
      .populate('customerId')
      .populate('vehicleId')
      .populate('services.serviceId')
      .populate('parts.partId');

    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ jobCard });
  },
  { requireTenant: true }
);

// PUT /api/job-cards/[id]
export const PUT = withTenantAuth(
  async (req, { tenantId, params, session }) => {
    await connectDB();

    const data = await req.json();

    // If updating services/parts, validate they belong to tenant
    if (data.services) {
      const serviceIds = data.services.map((s: any) => s.serviceId);
      const servicesCount = await Service.countDocuments({
        _id: { $in: serviceIds },
        tenantId,
      });

      if (servicesCount !== serviceIds.length) {
        return NextResponse.json(
          { error: 'One or more services not found' },
          { status: 400 }
        );
      }
    }

    if (data.parts) {
      const partIds = data.parts.map((p: any) => p.partId);
      const partsCount = await Part.countDocuments({
        _id: { $in: partIds },
        tenantId,
      });

      if (partsCount !== partIds.length) {
        return NextResponse.json(
          { error: 'One or more parts not found' },
          { status: 400 }
        );
      }
    }

    const jobCard = await JobCard.findOneAndUpdate(
      { _id: params.id, tenantId },
      { $set: { ...data, updatedBy: session.user.id } },
      { new: true, runValidators: true }
    );

    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ jobCard });
  },
  { requireTenant: true, allowedRoles: ['admin', 'mechanic'] }
);
```

### Task 3.3: Update Services Routes

**File:** `/app/api/services/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Service } from '@/lib/models/Service';

// GET /api/services
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');

    const query: any = { tenantId };
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const services = await Service.find(query).sort({ name: 1 });

    return NextResponse.json({ services });
  },
  { requireTenant: true }
);

// POST /api/services
export const POST = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const data = await req.json();

    // Check if code already exists for this tenant
    const existing = await Service.findOne({
      tenantId,
      code: data.code,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Service code already exists' },
        { status: 400 }
      );
    }

    const service = await Service.create({
      ...data,
      tenantId,
    });

    return NextResponse.json({ service }, { status: 201 });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
```

### Task 3.4: Update Parts Routes

Same pattern as Services.

---

## Week 4: Financial APIs

### Task 4.1: Update Invoices Routes

**File:** `/app/api/invoices/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Invoice } from '@/lib/models/Invoice';
import { JobCard } from '@/lib/models/JobCard';
import { Customer } from '@/lib/models/Customer';

// GET /api/invoices
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const query: any = { tenantId };

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    const invoices = await Invoice.find(query)
      .populate('customerId', 'firstName lastName')
      .populate('jobCardId', 'jobCardNumber')
      .sort({ issueDate: -1 });

    return NextResponse.json({ invoices });
  },
  { requireTenant: true }
);

// POST /api/invoices
export const POST = withTenantAuth(
  async (req, { tenantId, session }) => {
    await connectDB();

    const data = await req.json();

    // Validate customer belongs to tenant
    const customer = await Customer.findOne({
      _id: data.customerId,
      tenantId,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      );
    }

    // Validate job card if provided
    if (data.jobCardId) {
      const jobCard = await JobCard.findOne({
        _id: data.jobCardId,
        tenantId,
      });

      if (!jobCard) {
        return NextResponse.json(
          { error: 'Job card not found' },
          { status: 400 }
        );
      }
    }

    // Generate invoice number for this tenant
    const invoiceNumber = await Invoice.getNextInvoiceNumber(tenantId);

    const invoice = await Invoice.create({
      ...data,
      tenantId,
      invoiceNumber,
      createdBy: session.user.id,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
```

### Task 4.2: Update Estimates Routes

Same pattern as Invoices.

### Task 4.3: Update Payments Routes

**File:** `/app/api/payments/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { Payment } from '@/lib/models/Payment';
import { Invoice } from '@/lib/models/Invoice';

// GET /api/payments
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const payments = await Payment.find({ tenantId })
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ payments });
  },
  { requireTenant: true }
);

// POST /api/payments
export const POST = withTenantAuth(
  async (req, { tenantId, session }) => {
    await connectDB();

    const data = await req.json();

    // Validate invoice belongs to tenant
    const invoice = await Invoice.findOne({
      _id: data.invoiceId,
      tenantId,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      ...data,
      tenantId,
      customerId: invoice.customerId,
      createdBy: session.user.id,
    });

    // Update invoice status
    await Invoice.findByIdAndUpdate(invoice._id, {
      $inc: { paidAmount: data.amount },
    });

    return NextResponse.json({ payment }, { status: 201 });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
```

---

## Week 5: Inspection & Dashboard APIs

### Task 5.1: Update Vehicle Inspections Routes

**File:** `/app/api/vehicle-inspections/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { VehicleInspection } from '@/lib/models/VehicleInspection';
import { Vehicle } from '@/lib/models/Vehicle';
import { InspectionTemplate } from '@/lib/models/InspectionTemplate';

// GET /api/vehicle-inspections
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');

    const query: any = { tenantId };
    if (vehicleId) query.vehicleId = vehicleId;

    const inspections = await VehicleInspection.find(query)
      .populate('vehicleId', 'make model plateNumber')
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ inspections });
  },
  { requireTenant: true }
);

// POST /api/vehicle-inspections
export const POST = withTenantAuth(
  async (req, { tenantId, session }) => {
    await connectDB();

    const data = await req.json();

    // Validate vehicle and template belong to tenant
    const [vehicle, template] = await Promise.all([
      Vehicle.findOne({ _id: data.vehicleId, tenantId }),
      InspectionTemplate.findOne({ _id: data.templateId, tenantId }),
    ]);

    if (!vehicle || !template) {
      return NextResponse.json(
        { error: 'Vehicle or template not found' },
        { status: 400 }
      );
    }

    const inspection = await VehicleInspection.create({
      ...data,
      tenantId,
      customerId: vehicle.customerId,
      inspectedBy: session.user.id,
    });

    return NextResponse.json({ inspection }, { status: 201 });
  },
  { requireTenant: true, allowedRoles: ['admin', 'inspector'] }
);
```

### Task 5.2: Update Dashboard Stats API

**File:** `/app/api/dashboard/stats/route.ts` (UPDATE)

```typescript
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { JobCard } from '@/lib/models/JobCard';
import { Invoice } from '@/lib/models/Invoice';
import { Appointment } from '@/lib/models/Appointment';
import { Customer } from '@/lib/models/Customer';

// GET /api/dashboard/stats
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    await connectDB();

    // All stats MUST be filtered by tenantId
    const [
      totalCustomers,
      activeJobCards,
      pendingInvoices,
      todayAppointments,
      monthlyRevenue,
    ] = await Promise.all([
      Customer.countDocuments({ tenantId, isActive: true }),

      JobCard.countDocuments({
        tenantId,
        status: { $in: ['in_progress', 'pending'] },
      }),

      Invoice.countDocuments({
        tenantId,
        status: 'pending',
      }),

      Appointment.countDocuments({
        tenantId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),

      Invoice.aggregate([
        {
          $match: {
            tenantId: new mongoose.Types.ObjectId(tenantId),
            issueDate: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      totalCustomers,
      activeJobCards,
      pendingInvoices,
      todayAppointments,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
    });
  },
  { requireTenant: true }
);
```

---

## Week 6: Testing & Optimization

### Task 6.1: Create API Integration Tests

**File:** `/tests/api/tenant-isolation-api.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { createMocks } from 'node-mocks-http';

describe('API Tenant Isolation', () => {
  it('should only return tenant-scoped customers', async () => {
    // Test implementation
  });

  it('should prevent cross-tenant access', async () => {
    // Test implementation
  });

  it('should validate referenced resources belong to tenant', async () => {
    // Test implementation
  });
});
```

### Task 6.2: Performance Testing

Create script to test with multiple tenants:
- Generate 10 test tenants
- Create 100 customers per tenant
- Test query performance
- Verify indexes are being used

---

## 🧪 Testing Checklist

- [ ] All API routes use `withTenantAuth`
- [ ] All queries include `tenantId` filter
- [ ] Referenced resources validated (customer, vehicle, etc.)
- [ ] Sequential numbers work per-tenant
- [ ] Dashboard stats are tenant-scoped
- [ ] Cross-tenant access blocked
- [ ] All tests passing

---

## 📝 Critical Security Rules

**NEVER DO THIS:**
```typescript
// ❌ WRONG - No tenant filter
const customer = await Customer.findById(id);

// ❌ WRONG - Trusting client data
const customer = await Customer.findOne({ _id: id, tenantId: data.tenantId });
```

**ALWAYS DO THIS:**
```typescript
// ✅ CORRECT - Filter by tenant from auth context
const customer = await Customer.findOne({ _id: id, tenantId });

// ✅ CORRECT - Validate cross-references
const customer = await Customer.findOne({ _id: data.customerId, tenantId });
if (!customer) return error;
```

---

**Questions? Contact Tech Lead or post in #tenet-migration**
