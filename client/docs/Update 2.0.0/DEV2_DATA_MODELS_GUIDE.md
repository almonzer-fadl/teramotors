# Developer 2: Data Models & Migrations Implementation Guide

**Branch:** `tenet/dev2-data-models`
**Timeline:** Weeks 1-5
**Dependencies:** Week 2+ requires Dev 1's Tenant model

---

## 🚀 Setup

```bash
# Create your branch
git checkout tenet
git pull origin tenet
git checkout -b tenet/dev2-data-models

# Install dependencies
npm install
```

---

## Week 1: Model Schema Updates (Part 1)

### Task 1.1: Update Customer Model

**File:** `/lib/models/Customer.ts` (UPDATE)

```typescript
// ADD TENANTID TO INTERFACE
export interface ICustomer extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS - REQUIRED
  // ... rest of existing fields
}

// UPDATE SCHEMA
const CustomerSchema = new Schema<ICustomer>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  // ... existing fields (firstName, lastName, etc.)

  email: {
    type: String,
    // REMOVE: unique: true (will be in compound index)
    lowercase: true,
    trim: true,
  },

  phone: {
    type: String,
    // REMOVE any unique constraint
  },

  // ... rest of fields
}, {
  timestamps: true,
});

// UPDATE INDEXES - Compound indexes with tenantId
CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true, sparse: true });
CustomerSchema.index({ tenantId: 1, phone: 1 });
CustomerSchema.index({ tenantId: 1, isActive: 1 });
CustomerSchema.index({ tenantId: 1, createdAt: -1 });

// ADD HELPER METHOD
CustomerSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
```

### Task 1.2: Update Vehicle Model

**File:** `/lib/models/Vehicle.ts` (UPDATE)

```typescript
export interface IVehicle extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  customerId: mongoose.Types.ObjectId;
  // ... rest of existing fields
}

const VehicleSchema = new Schema<IVehicle>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },

  // ... existing fields

  plateNumber: {
    type: String,
    // REMOVE unique: true
  },

  vin: {
    type: String,
    // REMOVE unique: true
  },

  // ... rest of fields
}, {
  timestamps: true,
});

// Compound indexes
VehicleSchema.index({ tenantId: 1, plateNumber: 1 }, { unique: true, sparse: true });
VehicleSchema.index({ tenantId: 1, vin: 1 }, { unique: true, sparse: true });
VehicleSchema.index({ tenantId: 1, customerId: 1 });
VehicleSchema.index({ tenantId: 1, isActive: 1 });

// Helper method
VehicleSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const Vehicle = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
```

### Task 1.3: Update Appointment Model

**File:** `/lib/models/Appointment.ts` (UPDATE)

```typescript
export interface IAppointment extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  customerId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  // ... rest of existing fields
}

const AppointmentSchema = new Schema<IAppointment>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },

  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
AppointmentSchema.index({ tenantId: 1, date: 1 });
AppointmentSchema.index({ tenantId: 1, customerId: 1 });
AppointmentSchema.index({ tenantId: 1, status: 1 });
AppointmentSchema.index({ tenantId: 1, createdAt: -1 });

// Helper
AppointmentSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
```

---

## Week 2: Model Schema Updates (Part 2)

### Task 2.1: Update JobCard Model

**File:** `/lib/models/JobCard.ts` (UPDATE)

```typescript
export interface IJobCard extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  jobCardNumber: string; // Will be unique per tenant
  // ... rest of existing fields
}

const JobCardSchema = new Schema<IJobCard>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  jobCardNumber: {
    type: String,
    required: true,
    // REMOVE unique: true
  },

  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },

  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Compound indexes
JobCardSchema.index({ tenantId: 1, jobCardNumber: 1 }, { unique: true });
JobCardSchema.index({ tenantId: 1, customerId: 1 });
JobCardSchema.index({ tenantId: 1, vehicleId: 1 });
JobCardSchema.index({ tenantId: 1, status: 1 });
JobCardSchema.index({ tenantId: 1, createdAt: -1 });

// Helper
JobCardSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

// Method to generate next job card number for tenant
JobCardSchema.statics.getNextJobCardNumber = async function(tenantId: string | mongoose.Types.ObjectId) {
  const lastJobCard = await this.findOne({ tenantId })
    .sort({ createdAt: -1 })
    .select('jobCardNumber');

  if (!lastJobCard) {
    return 'JC-0001';
  }

  const lastNumber = parseInt(lastJobCard.jobCardNumber.split('-')[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `JC-${nextNumber}`;
};

export const JobCard = mongoose.models.JobCard || mongoose.model<IJobCard>('JobCard', JobCardSchema);
```

### Task 2.2: Update Service Model

**File:** `/lib/models/Service.ts` (UPDATE)

```typescript
export interface IService extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  code: string; // Unique per tenant
  name: string;
  // ... rest of fields
}

const ServiceSchema = new Schema<IService>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  code: {
    type: String,
    required: true,
    // REMOVE unique: true
  },

  name: {
    type: String,
    required: true,
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
ServiceSchema.index({ tenantId: 1, code: 1 }, { unique: true });
ServiceSchema.index({ tenantId: 1, name: 1 });
ServiceSchema.index({ tenantId: 1, isActive: 1 });

// Helper
ServiceSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
```

### Task 2.3: Update Part Model

**File:** `/lib/models/Part.ts` (UPDATE)

```typescript
export interface IPart extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  partNumber: string; // Unique per tenant
  name: string;
  // ... rest of fields
}

const PartSchema = new Schema<IPart>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  partNumber: {
    type: String,
    required: true,
    // REMOVE unique: true
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
PartSchema.index({ tenantId: 1, partNumber: 1 }, { unique: true });
PartSchema.index({ tenantId: 1, name: 1 });
PartSchema.index({ tenantId: 1, isActive: 1 });
PartSchema.index({ tenantId: 1, stock: 1 });

// Helper
PartSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const Part = mongoose.models.Part || mongoose.model<IPart>('Part', PartSchema);
```

### Task 2.4: Update Invoice Model

**File:** `/lib/models/Invoice.ts` (UPDATE)

```typescript
export interface IInvoice extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  invoiceNumber: string; // Sequential per tenant
  // ... rest of fields
}

const InvoiceSchema = new Schema<IInvoice>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  invoiceNumber: {
    type: String,
    required: true,
    // REMOVE unique: true
  },

  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },

  jobCardId: {
    type: Schema.Types.ObjectId,
    ref: 'JobCard',
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ tenantId: 1, customerId: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, issueDate: -1 });

// Helper
InvoiceSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

// Generate next invoice number for tenant
InvoiceSchema.statics.getNextInvoiceNumber = async function(tenantId: string | mongoose.Types.ObjectId) {
  const lastInvoice = await this.findOne({ tenantId })
    .sort({ createdAt: -1 })
    .select('invoiceNumber');

  if (!lastInvoice) {
    return 'INV-0001';
  }

  const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `INV-${nextNumber}`;
};

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
```

---

## Week 3: Model Schema Updates (Part 3)

### Task 3.1: Update Estimate Model

**File:** `/lib/models/Estimate.ts` (UPDATE)

```typescript
export interface IEstimate extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  estimateNumber: string;
  // ... rest of fields
}

const EstimateSchema = new Schema<IEstimate>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  estimateNumber: {
    type: String,
    required: true,
  },

  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },

  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
EstimateSchema.index({ tenantId: 1, estimateNumber: 1 }, { unique: true });
EstimateSchema.index({ tenantId: 1, customerId: 1 });
EstimateSchema.index({ tenantId: 1, status: 1 });

// Helper
EstimateSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const Estimate = mongoose.models.Estimate || mongoose.model<IEstimate>('Estimate', EstimateSchema);
```

### Task 3.2: Update Payment Model

**File:** `/lib/models/Payment.ts` (UPDATE)

```typescript
export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  paymentNumber: string;
  // ... rest of fields
}

const PaymentSchema = new Schema<IPayment>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  paymentNumber: {
    type: String,
    required: true,
  },

  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },

  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
PaymentSchema.index({ tenantId: 1, paymentNumber: 1 }, { unique: true });
PaymentSchema.index({ tenantId: 1, invoiceId: 1 });
PaymentSchema.index({ tenantId: 1, customerId: 1 });
PaymentSchema.index({ tenantId: 1, createdAt: -1 });

// Helper
PaymentSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
```

### Task 3.3: Update VehicleInspection Model

**File:** `/lib/models/VehicleInspection.ts` (UPDATE)

```typescript
export interface IVehicleInspection extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  inspectionNumber: string;
  // ... rest of fields
}

const VehicleInspectionSchema = new Schema<IVehicleInspection>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  inspectionNumber: {
    type: String,
    required: true,
  },

  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },

  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
VehicleInspectionSchema.index({ tenantId: 1, inspectionNumber: 1 }, { unique: true });
VehicleInspectionSchema.index({ tenantId: 1, vehicleId: 1 });
VehicleInspectionSchema.index({ tenantId: 1, customerId: 1 });

// Helper
VehicleInspectionSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const VehicleInspection = mongoose.models.VehicleInspection || mongoose.model<IVehicleInspection>('VehicleInspection', VehicleInspectionSchema);
```

### Task 3.4: Update InspectionTemplate Model

**File:** `/lib/models/InspectionTemplate.ts` (UPDATE)

```typescript
export interface IInspectionTemplate extends Document {
  tenantId: mongoose.Types.ObjectId; // ADD THIS
  name: string;
  // ... rest of fields
}

const InspectionTemplateSchema = new Schema<IInspectionTemplate>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },

  name: {
    type: String,
    required: true,
  },

  // ... existing fields
}, {
  timestamps: true,
});

// Indexes
InspectionTemplateSchema.index({ tenantId: 1, name: 1 }, { unique: true });
InspectionTemplateSchema.index({ tenantId: 1, isActive: 1 });

// Helper
InspectionTemplateSchema.statics.findByTenant = function(tenantId: string | mongoose.Types.ObjectId, filter = {}) {
  return this.find({ tenantId, ...filter });
};

export const InspectionTemplate = mongoose.models.InspectionTemplate || mongoose.model<IInspectionTemplate>('InspectionTemplate', InspectionTemplateSchema);
```

### Task 3.5: Create Model Query Helpers

**File:** `/lib/model-helpers/tenant-query.ts` (NEW)

```typescript
import mongoose from 'mongoose';

/**
 * Helper to add tenant filter to query
 */
export function withTenantFilter<T>(
  tenantId: string | mongoose.Types.ObjectId,
  filter: any = {}
): any {
  return {
    tenantId,
    ...filter,
  };
}

/**
 * Helper to create tenant-scoped model wrapper
 */
export function createTenantScopedModel<T extends mongoose.Model<any>>(
  Model: T,
  tenantId: string | mongoose.Types.ObjectId
) {
  return {
    find: (filter = {}) => Model.find(withTenantFilter(tenantId, filter)),
    findOne: (filter = {}) => Model.findOne(withTenantFilter(tenantId, filter)),
    findById: (id: string) => Model.findOne(withTenantFilter(tenantId, { _id: id })),
    count: (filter = {}) => Model.countDocuments(withTenantFilter(tenantId, filter)),
    create: (data: any) => Model.create({ ...data, tenantId }),
    updateOne: (filter: any, update: any) =>
      Model.updateOne(withTenantFilter(tenantId, filter), update),
    updateMany: (filter: any, update: any) =>
      Model.updateMany(withTenantFilter(tenantId, filter), update),
    deleteOne: (filter: any) =>
      Model.deleteOne(withTenantFilter(tenantId, filter)),
    deleteMany: (filter: any) =>
      Model.deleteMany(withTenantFilter(tenantId, filter)),
  };
}

/**
 * Validate all documents belong to tenant
 */
export async function validateTenantOwnership(
  Model: mongoose.Model<any>,
  tenantId: string | mongoose.Types.ObjectId,
  ids: string[]
): Promise<boolean> {
  const count = await Model.countDocuments({
    _id: { $in: ids },
    tenantId,
  });

  return count === ids.length;
}
```

---

## Week 4: Migration Scripts

### Task 4.1: Create Migration Script for Existing Data

**File:** `/scripts/migrations/add-tenant-to-existing-data.ts` (NEW)

```typescript
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Tenant } from '@/lib/models/Tenant';
import { Customer } from '@/lib/models/Customer';
import { Vehicle } from '@/lib/models/Vehicle';
import { Appointment } from '@/lib/models/Appointment';
import { JobCard } from '@/lib/models/JobCard';
import { Service } from '@/lib/models/Service';
import { Part } from '@/lib/models/Part';
import { Invoice } from '@/lib/models/Invoice';
import { Estimate } from '@/lib/models/Estimate';
import { Payment } from '@/lib/models/Payment';
import { VehicleInspection } from '@/lib/models/VehicleInspection';
import { InspectionTemplate } from '@/lib/models/InspectionTemplate';
import { User } from '@/lib/models/User';

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
```

### Task 4.2: Create Seed Script for New Tenants

**File:** `/scripts/migrations/seed-new-tenant.ts` (NEW)

```typescript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { Tenant } from '@/lib/models/Tenant';
import { User } from '@/lib/models/User';
import { InspectionTemplate } from '@/lib/models/InspectionTemplate';
import { Service } from '@/lib/models/Service';

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
    await connectDB();

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
      isActive: true,
      sections: [
        {
          name: 'Exterior',
          items: ['Body Condition', 'Paint', 'Lights', 'Tires'],
        },
        {
          name: 'Interior',
          items: ['Seats', 'Dashboard', 'Controls', 'AC'],
        },
        {
          name: 'Engine',
          items: ['Oil Level', 'Coolant', 'Battery', 'Belts'],
        },
      ],
    });

    console.log('✅ Created default inspection template');

    // Create default services
    const defaultServices = [
      { code: 'OC', name: 'Oil Change', price: 150 },
      { code: 'BI', name: 'Basic Inspection', price: 100 },
      { code: 'BR', name: 'Brake Service', price: 300 },
      { code: 'TR', name: 'Tire Rotation', price: 80 },
    ];

    for (const svc of defaultServices) {
      await Service.create({
        tenantId: tenant._id,
        code: svc.code,
        name: svc.name,
        price: svc.price,
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
      phone: '+966553022102',
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
```

---

## Week 5: Validation & Testing

### Task 5.1: Create Model Tests

**File:** `/tests/models/tenant-isolation.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Tenant } from '@/lib/models/Tenant';
import { Customer } from '@/lib/models/Customer';
import { Vehicle } from '@/lib/models/Vehicle';

describe('Model Tenant Isolation', () => {
  let tenant1: any;
  let tenant2: any;

  beforeAll(async () => {
    await connectDB();

    // Create two test tenants
    tenant1 = await Tenant.create({
      name: 'Tenant 1',
      slug: 'tenant-1',
      companyInfo: { name: 'Company 1', address: { city: 'Riyadh' } },
    });

    tenant2 = await Tenant.create({
      name: 'Tenant 2',
      slug: 'tenant-2',
      companyInfo: { name: 'Company 2', address: { city: 'Jeddah' } },
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
      phone: '+966553022102',
    });

    // Create customer for tenant 2 with same email (should work)
    const customer2 = await Customer.create({
      tenantId: tenant2._id,
      firstName: 'Mohamed',
      lastName: 'Salem',
      email: 'ahmed@example.com', // Same email, different tenant
      phone: '+966553022102',
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
        phone: '+966553022102',
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
      plateNumber: 'ABC-1234',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
    });

    // Create vehicle for tenant 2 with same plate number
    await Vehicle.create({
      tenantId: tenant2._id,
      customerId: customer2._id,
      plateNumber: 'ABC-1234', // Same plate, different tenant
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
```

---

## 🧪 Testing Checklist

- [ ] All models have tenantId field
- [ ] All compound indexes created correctly
- [ ] Unique constraints work per-tenant (not globally)
- [ ] Helper methods (findByTenant) work
- [ ] Sequential number generation works per-tenant
- [ ] Migration script successfully migrates existing data
- [ ] Seed script creates complete tenant setup
- [ ] Tenant isolation tests all pass

---

## 📝 Merge Checklist

- [ ] All model files updated
- [ ] All tests passing
- [ ] Migration scripts tested
- [ ] No TypeScript errors
- [ ] Coordinated with Dev 1 on User model
- [ ] Documentation updated

---

## 🆘 Common Issues

**Issue:** Unique index errors
**Solution:** Drop existing indexes before creating compound indexes

**Issue:** Migration script fails
**Solution:** Check that Tenant model exists first (coordinate with Dev 1)

**Issue:** TypeScript errors on model methods
**Solution:** Update model interface declarations

---

**Questions? Contact Tech Lead or post in #tenet-migration**
