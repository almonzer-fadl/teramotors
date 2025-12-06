# Multi-Tenant SaaS Migration Plan
## TeraMotors - 4 Developer Parallel Implementation

**Branch:** `tenet`
**Timeline:** 4-6 weeks with 4 developers working in parallel
**Last Updated:** 2025-12-04

---

## 🎯 Overview

This plan divides the tenant migration into 4 parallel work streams that minimize conflicts and dependencies. Each developer works in their own feature branch and integrates regularly.

---

## 👥 Team Structure & Responsibilities

### **Developer 1: FOUNDATION & AUTH LEAD**
**Branch:** `tenet/dev1-foundation-auth`
**Primary Focus:** Core tenant infrastructure, authentication, and middleware
**Timeline:** Weeks 1-4

### **Developer 2: DATA MODELS & MIGRATIONS LEAD**
**Branch:** `tenet/dev2-data-models`
**Primary Focus:** Database schema updates, migrations, and core models
**Timeline:** Weeks 1-5

### **Developer 3: API & BUSINESS LOGIC LEAD**
**Branch:** `tenet/dev3-api-routes`
**Primary Focus:** API route updates, business logic, and query filtering
**Timeline:** Weeks 2-6

### **Developer 4: INTEGRATIONS & FRONTEND LEAD**
**Branch:** `tenet/dev4-integrations-ui`
**Primary Focus:** External services, file storage, and UI updates
**Timeline:** Weeks 2-6

---

## 📋 DEVELOPER 1: Foundation & Auth Lead

### Week 1: Core Tenant Model & Infrastructure
- [ ] Create `Tenant` model (`/lib/models/Tenant.ts`)
- [ ] Create `TenantConfig` model for per-tenant settings
- [ ] Add database indexes for tenant queries
- [ ] Create tenant management utilities (`/lib/tenant-utils.ts`)
- [ ] Set up tenant context middleware (`/lib/middleware/tenant-context.ts`)

### Week 2: Authentication System Updates
- [ ] Update JWT payload to include `tenantId`
- [ ] Update `/lib/simple-auth.ts` to handle tenant context
- [ ] Create `withTenantAuth` middleware wrapper
- [ ] Update User model to include `tenantId` (coordinate with Dev 2)
- [ ] Add tenant validation to all auth flows
- [ ] Create super admin role (`SUPER_ADMIN`)

### Week 3: Session & Middleware
- [ ] Update Next.js middleware (`/middleware.ts`) for tenant context
- [ ] Create tenant switching functionality
- [ ] Implement tenant isolation middleware for all API routes
- [ ] Add request logging with tenant context
- [ ] Create tenant-aware error handling

### Week 4: Testing & Documentation
- [ ] Write unit tests for auth with tenant context
- [ ] Create integration tests for tenant isolation
- [ ] Document authentication flow changes
- [ ] Code review and cleanup

### 📦 Deliverables
```
/lib/models/Tenant.ts
/lib/models/TenantConfig.ts
/lib/tenant-utils.ts
/lib/middleware/tenant-context.ts
/lib/middleware/withTenantAuth.ts
/lib/simple-auth.ts (updated)
/middleware.ts (updated)
/lib/models/User.ts (tenantId added)
/tests/auth/tenant-auth.test.ts
```

---

## 📋 DEVELOPER 2: Data Models & Migrations Lead

### Week 1: Model Schema Updates (Part 1)
- [ ] Add `tenantId` field to Customer model
- [ ] Add `tenantId` field to Vehicle model
- [ ] Add `tenantId` field to Appointment model
- [ ] Update all indexes to compound indexes with `tenantId`
- [ ] Create migration script template

### Week 2: Model Schema Updates (Part 2)
- [ ] Add `tenantId` field to JobCard model
- [ ] Add `tenantId` field to Service model
- [ ] Add `tenantId` field to Part model
- [ ] Add `tenantId` field to Invoice model
- [ ] Update unique constraints to be per-tenant

### Week 3: Model Schema Updates (Part 3)
- [ ] Add `tenantId` field to Estimate model
- [ ] Add `tenantId` field to Payment model
- [ ] Add `tenantId` field to VehicleInspection model
- [ ] Add `tenantId` field to InspectionTemplate model
- [ ] Create model query helpers for tenant filtering

### Week 4: Migration Scripts
- [ ] Create data migration script for existing data
- [ ] Create seed data script for new tenants
- [ ] Create tenant onboarding script
- [ ] Test migrations in development environment

### Week 5: Validation & Testing
- [ ] Create model validation tests with tenant context
- [ ] Test data isolation between tenants
- [ ] Verify all indexes are working
- [ ] Document model changes

### 📦 Deliverables
```
/lib/models/Customer.ts (updated)
/lib/models/Vehicle.ts (updated)
/lib/models/Appointment.ts (updated)
/lib/models/JobCard.ts (updated)
/lib/models/Service.ts (updated)
/lib/models/Part.ts (updated)
/lib/models/Invoice.ts (updated)
/lib/models/Estimate.ts (updated)
/lib/models/Payment.ts (updated)
/lib/models/VehicleInspection.ts (updated)
/lib/models/InspectionTemplate.ts (updated)
/lib/model-helpers/tenant-query.ts
/scripts/migrations/add-tenant-to-existing-data.ts
/scripts/migrations/seed-new-tenant.ts
/tests/models/tenant-isolation.test.ts
```

---

## 📋 DEVELOPER 3: API & Business Logic Lead

### Week 2: Customer & Vehicle APIs
- [ ] Update `/api/customers/*` routes with tenant filtering
- [ ] Update `/api/vehicles/*` routes with tenant filtering
- [ ] Add tenant validation to all customer operations
- [ ] Add tenant validation to all vehicle operations
- [ ] Test customer/vehicle APIs with multiple tenants

### Week 3: Job Management APIs
- [ ] Update `/api/appointments/*` routes with tenant filtering
- [ ] Update `/api/job-cards/*` routes with tenant filtering
- [ ] Update `/api/services/*` routes with tenant filtering
- [ ] Update `/api/parts/*` routes with tenant filtering
- [ ] Ensure workflow integrity within tenant boundaries

### Week 4: Financial APIs
- [ ] Update `/api/invoices/*` routes with tenant filtering
- [ ] Update `/api/estimates/*` routes with tenant filtering
- [ ] Update `/api/payments/*` routes with tenant filtering
- [ ] Add tenant-specific invoice numbering
- [ ] Update financial reports to be tenant-scoped

### Week 5: Inspection & Template APIs
- [ ] Update `/api/vehicle-inspections/*` routes with tenant filtering
- [ ] Update `/api/inspection-templates/*` routes with tenant filtering
- [ ] Update dashboard APIs for tenant-specific stats
- [ ] Update search/filter endpoints with tenant context

### Week 6: Testing & Optimization
- [ ] Create API integration tests with tenant context
- [ ] Test cross-tenant access prevention
- [ ] Performance testing with multiple tenants
- [ ] API documentation updates

### 📦 Deliverables
```
/app/api/customers/* (all routes updated)
/app/api/vehicles/* (all routes updated)
/app/api/appointments/* (all routes updated)
/app/api/job-cards/* (all routes updated)
/app/api/services/* (all routes updated)
/app/api/parts/* (all routes updated)
/app/api/invoices/* (all routes updated)
/app/api/estimates/* (all routes updated)
/app/api/payments/* (all routes updated)
/app/api/vehicle-inspections/* (all routes updated)
/app/api/inspection-templates/* (all routes updated)
/tests/api/tenant-isolation-api.test.ts
```

---

## 📋 DEVELOPER 4: Integrations & Frontend Lead

### Week 2: File Storage & External Services
- [ ] Update Cloudinary integration for tenant-based folders
- [ ] Create tenant-specific file upload utilities
- [ ] Update file access validation with tenant context
- [ ] Test file isolation between tenants

### Week 3: Communication Services
- [ ] Update email service for per-tenant configuration
- [ ] Update WhatsApp integration for multi-tenant support
- [ ] Update SMS (Twilio) for tenant-specific sending
- [ ] Create tenant configuration management

### Week 4: ZATCA & Compliance
- [ ] Update ZATCA integration for per-tenant credentials
- [ ] Create tenant-specific ZATCA configuration storage
- [ ] Update invoice generation with tenant ZATCA data
- [ ] Test ZATCA compliance per tenant

### Week 5: Real-time & Frontend
- [ ] Update Socket.io server for tenant rooms
- [ ] Create tenant selector component
- [ ] Add tenant context to Zustand stores
- [ ] Update PDF generation with tenant branding
- [ ] Update email templates with tenant branding

### Week 6: Admin UI & Polish
- [ ] Create super admin dashboard
- [ ] Create tenant management UI (CRUD)
- [ ] Create tenant onboarding flow
- [ ] Update all forms to include tenant context
- [ ] Create tenant settings page
- [ ] UI/UX testing

### 📦 Deliverables
```
/lib/cloudinary.ts (updated)
/lib/email-service.ts (updated)
/lib/whatsapp-service.ts (updated)
/lib/twilio-service.ts (updated)
/zatca/* (all files updated)
/server/server.js (Socket.io updated)
/components/admin/TenantSelector.tsx
/components/admin/TenantManagement.tsx
/components/admin/SuperAdminDashboard.tsx
/app/admin/tenants/page.tsx
/app/admin/tenants/new/page.tsx
/app/admin/tenants/[id]/page.tsx
/lib/stores/tenant-store.ts
/tests/integration/file-isolation.test.ts
```

---

## 🔄 Integration & Merge Strategy

### Daily Sync
- **Daily standup:** Share progress and blockers
- **Pull from `tenet`:** Each dev pulls latest changes daily
- **Push to feature branch:** Commit and push to own branch daily

### Weekly Merges
- **End of Week 1:** Dev 1 merges foundation → `tenet`
- **End of Week 2:** Dev 2 merges core models → `tenet`, Dev 3 starts
- **End of Week 3:** Dev 1 final merge, Dev 4 merges file storage
- **End of Week 4:** Dev 2 final merge, Dev 3 merges customer/job APIs
- **End of Week 5:** Dev 3 merges financial APIs, Dev 4 merges integrations
- **End of Week 6:** Dev 4 final merge, full integration testing

### Merge Order
```
Week 1: tenet ← dev1-foundation-auth (foundation only)
Week 2: tenet ← dev2-data-models (core models)
Week 3: tenet ← dev1-foundation-auth (auth complete)
        tenet ← dev4-integrations-ui (file storage)
Week 4: tenet ← dev2-data-models (all models)
        tenet ← dev3-api-routes (customer/vehicle APIs)
Week 5: tenet ← dev3-api-routes (all APIs)
        tenet ← dev4-integrations-ui (integrations)
Week 6: tenet ← dev4-integrations-ui (UI complete)
        Full testing and bug fixes
```

---

## 🧪 Testing Strategy

### Continuous Testing (Each Developer)
- Unit tests for their components
- Integration tests for their modules
- Daily smoke tests on their branch

### Weekly Integration Testing
- Merge to `tenet` and run full test suite
- Test tenant isolation
- Test cross-module functionality

### Final Testing (Week 6)
- [ ] Full tenant isolation testing
- [ ] Security penetration testing
- [ ] Performance testing with 10+ mock tenants
- [ ] End-to-end user flow testing
- [ ] Data migration testing with production data copy

---

## 🚨 Conflict Prevention Rules

### File Ownership
1. **Developer 1 owns:**
   - `/lib/simple-auth.ts`
   - `/middleware.ts`
   - `/lib/middleware/*`
   - `/lib/models/User.ts`
   - `/lib/models/Tenant.ts`

2. **Developer 2 owns:**
   - All files in `/lib/models/` (except User.ts, Tenant.ts)
   - `/scripts/migrations/*`

3. **Developer 3 owns:**
   - All files in `/app/api/*`
   - API business logic

4. **Developer 4 owns:**
   - `/lib/cloudinary.ts`
   - `/lib/email-service.ts`
   - `/zatca/*`
   - `/server/server.js`
   - `/components/admin/*`
   - All UI components

### Communication Rules
- **Slack channel:** `#tenet-migration` for daily updates
- **Shared document:** Track completed tasks
- **Code review:** All merges require 1+ reviewer approval
- **Conflicts:** Discuss immediately, don't commit over each other

---

## 📊 Progress Tracking

### Week 1 Goals
- ✅ Tenant model created
- ✅ Core models updated (Customer, Vehicle, Appointment)
- ✅ Feature branches created

### Week 2 Goals
- ✅ Auth system tenant-aware
- ✅ All models updated with tenantId
- ✅ File storage isolated
- ✅ Customer/Vehicle APIs updated

### Week 3 Goals
- ✅ All auth flows complete
- ✅ Job management APIs updated
- ✅ Communication services multi-tenant

### Week 4 Goals
- ✅ All models merged
- ✅ Financial APIs updated
- ✅ ZATCA multi-tenant

### Week 5 Goals
- ✅ All APIs updated
- ✅ Real-time updates tenant-aware
- ✅ Frontend components updated

### Week 6 Goals
- ✅ Admin UI complete
- ✅ All tests passing
- ✅ Ready for staging deployment

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] Users can only see data for their tenant
- [ ] Admins can manage multiple tenants (super admin)
- [ ] Each tenant has isolated data (customers, jobs, invoices)
- [ ] File storage is tenant-isolated
- [ ] ZATCA integration works per tenant
- [ ] WhatsApp/Email/SMS work per tenant

### Security Requirements
- [ ] Zero cross-tenant data leakage
- [ ] All queries include tenant filter
- [ ] Authentication includes tenant context
- [ ] File access validates tenant ownership
- [ ] API endpoints validate tenant access

### Performance Requirements
- [ ] Page load times < 2 seconds
- [ ] API responses < 500ms
- [ ] Database queries use proper indexes
- [ ] Supports 100+ tenants on current infrastructure

### Testing Requirements
- [ ] 90%+ code coverage on tenant logic
- [ ] All integration tests passing
- [ ] Security audit passed
- [ ] Performance benchmarks met

---

## 📞 Support & Resources

### Development Environment
```bash
# Create your feature branch
git checkout tenet
git pull origin tenet
git checkout -b tenet/dev[1-4]-[your-area]

# Daily workflow
git pull origin tenet
# ... do your work ...
git add .
git commit -m "feat: descriptive message"
git push origin tenet/dev[1-4]-[your-area]

# Weekly merge
git checkout tenet
git pull origin tenet
git merge tenet/dev[1-4]-[your-area]
# ... resolve conflicts ...
git push origin tenet
```

### Testing Commands
```bash
# Run unit tests
npm test

# Run with tenant isolation tests
npm test -- --grep "tenant"

# Run specific developer's tests
npm test -- tests/auth/  # Dev 1
npm test -- tests/models/  # Dev 2
npm test -- tests/api/  # Dev 3
npm test -- tests/integration/  # Dev 4
```

### Documentation
- **Architecture:** See `/docs/architecture/multi-tenant.md`
- **API Reference:** See `/docs/api/tenant-endpoints.md`
- **Database Schema:** See `/docs/database/tenant-schema.md`

---

## 🎉 Completion Checklist

- [ ] All 4 developers have merged their work
- [ ] All tests passing (unit + integration + e2e)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Migration scripts tested
- [ ] Staging deployment successful
- [ ] Product team sign-off
- [ ] Ready for production deployment

---

**Questions? Contact project lead or post in #tenet-migration**
