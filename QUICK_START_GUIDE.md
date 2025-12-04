# Multi-Tenant Migration - Quick Start Guide

**Project:** TeraMotors SaaS Conversion
**Branch:** `tenet`
**Timeline:** 4-6 weeks with 4 parallel developers

---

## 🎯 Overview

Converting TeraMotors from single-tenant to multi-tenant SaaS with row-level tenant isolation.

**Complexity:** MEDIUM-HIGH
**Estimated Effort:** 400-600 hours (10-15 weeks solo, 4-6 weeks with 4 devs)

---

## 👥 Team Assignments

| Developer | Branch | Focus Area | Timeline |
|-----------|--------|------------|----------|
| **Dev 1** | `tenet/dev1-foundation-auth` | Tenant model, auth, middleware | Weeks 1-4 |
| **Dev 2** | `tenet/dev2-data-models` | All 12 models + migrations | Weeks 1-5 |
| **Dev 3** | `tenet/dev3-api-routes` | 86 API routes + business logic | Weeks 2-6 |
| **Dev 4** | `tenet/dev4-integrations-ui` | External services + frontend | Weeks 2-6 |

---

## 🚀 Getting Started (15 minutes)

### Step 1: Run Setup Script

```bash
# Make sure you're on the tenet branch
git checkout tenet
git pull origin tenet

# Run the setup script
./scripts/setup-parallel-dev.sh
```

This creates:
- 4 developer feature branches
- Task tracking files
- Progress dashboard
- Developer workspace

### Step 2: Assign Developers

Each developer checks out their branch:

```bash
# Developer 1
git checkout tenet/dev1-foundation-auth

# Developer 2
git checkout tenet/dev2-data-models

# Developer 3
git checkout tenet/dev3-api-routes

# Developer 4
git checkout tenet/dev4-integrations-ui
```

### Step 3: Read Your Guide

**Each developer reads their implementation guide:**

- Dev 1: [DEV1_FOUNDATION_AUTH_GUIDE.md](DEV1_FOUNDATION_AUTH_GUIDE.md)
- Dev 2: [DEV2_DATA_MODELS_GUIDE.md](DEV2_DATA_MODELS_GUIDE.md)
- Dev 3: [DEV3_API_ROUTES_GUIDE.md](DEV3_API_ROUTES_GUIDE.md)
- Dev 4: [DEV4_INTEGRATIONS_UI_GUIDE.md](DEV4_INTEGRATIONS_UI_GUIDE.md)

### Step 4: Daily Workflow

```bash
# Morning: Sync with main branch
git checkout tenet
git pull origin tenet
git checkout tenet/dev[X]-[your-area]
git merge tenet

# Work on your tasks...

# Evening: Commit and push
git add .
git commit -m "feat: descriptive message"
git push origin tenet/dev[X]-[your-area]

# Update your task tracker
# Edit: .devworkspace/dev[X]-*/TASKS.md
```

---

## 📅 Weekly Milestones

### Week 1
- ✅ Dev 1: Tenant model created
- ✅ Dev 2: Customer, Vehicle, Appointment models updated
- **Merge:** Dev 1 foundation → `tenet`

### Week 2
- ✅ Dev 1: Auth system tenant-aware
- ✅ Dev 2: JobCard, Service, Part, Invoice models updated
- ✅ Dev 3: Customer & Vehicle APIs updated
- ✅ Dev 4: File storage isolated
- **Merge:** Dev 2 core models → `tenet`

### Week 3
- ✅ Dev 1: Middleware complete
- ✅ Dev 2: Remaining models + helpers
- ✅ Dev 3: Job management APIs updated
- ✅ Dev 4: Communication services multi-tenant
- **Merges:** Dev 1 complete → `tenet`, Dev 4 file storage → `tenet`

### Week 4
- ✅ Dev 1: Testing complete
- ✅ Dev 2: Migration scripts ready
- ✅ Dev 3: Financial APIs updated
- ✅ Dev 4: ZATCA multi-tenant
- **Merges:** Dev 2 complete → `tenet`, Dev 3 customer APIs → `tenet`

### Week 5
- ✅ Dev 2: Final validation
- ✅ Dev 3: Inspection & dashboard APIs
- ✅ Dev 4: Real-time + frontend components
- **Merges:** Dev 3 all APIs → `tenet`, Dev 4 integrations → `tenet`

### Week 6
- ✅ Dev 3: API testing complete
- ✅ Dev 4: Admin UI complete
- ✅ Full integration testing
- ✅ Security audit
- ✅ Performance testing
- **Merge:** Dev 4 UI → `tenet`

---

## 🔑 Key Concepts

### Row-Level Tenant Isolation

Every model gets a `tenantId` field:

```typescript
// BEFORE
const CustomerSchema = new Schema({
  email: { type: String, unique: true },
});

// AFTER
const CustomerSchema = new Schema({
  tenantId: { type: ObjectId, ref: 'Tenant', required: true, index: true },
  email: String, // No longer globally unique
});

// Compound index for per-tenant uniqueness
CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
```

### Authentication Pattern

JWT includes tenant context:

```typescript
// Session payload
{
  user: {
    id: "user123",
    email: "user@example.com",
    role: "admin",
    tenantId: "tenant456" // ADD THIS
  }
}
```

### API Route Pattern

All routes use tenant filtering:

```typescript
// BEFORE - NO TENANT FILTER ❌
const customers = await Customer.find({ isActive: true });

// AFTER - WITH TENANT FILTER ✅
export const GET = withTenantAuth(
  async (req, { tenantId }) => {
    const customers = await Customer.find({ tenantId, isActive: true });
    return NextResponse.json({ customers });
  },
  { requireTenant: true }
);
```

### Critical Security Rule

**NEVER trust client-provided tenantId:**

```typescript
// ❌ WRONG
const data = await req.json();
const customer = await Customer.findOne({
  _id: id,
  tenantId: data.tenantId // NEVER DO THIS
});

// ✅ CORRECT
export const GET = withTenantAuth(
  async (req, { tenantId }) => { // From auth context
    const customer = await Customer.findOne({ _id: id, tenantId });
  }
);
```

---

## 📊 Progress Tracking

### Update Task Tracker Daily

Edit your task file:
- `.devworkspace/dev1-foundation-auth/TASKS.md`
- `.devworkspace/dev2-data-models/TASKS.md`
- `.devworkspace/dev3-api-routes/TASKS.md`
- `.devworkspace/dev4-integrations-ui/TASKS.md`

### Update Progress Dashboard Weekly

Edit: `.devworkspace/PROGRESS.md`

Mark completed milestones and blockers.

---

## 🧪 Testing Requirements

### Each Developer Tests Their Work

```bash
# Run your specific tests
npm test -- tests/auth/  # Dev 1
npm test -- tests/models/  # Dev 2
npm test -- tests/api/  # Dev 3
npm test -- tests/integration/  # Dev 4
```

### Integration Testing (Week 6)

```bash
# Full test suite
npm test

# Tenant isolation tests
npm test -- --grep "tenant"

# Performance tests
npm run test:performance
```

---

## 🚨 Common Pitfalls

### ❌ Pitfall 1: Forgetting Tenant Filter

```typescript
// ❌ WRONG - Missing tenant filter
const invoice = await Invoice.findById(invoiceId);
```

**Impact:** Data leakage across tenants (CRITICAL security issue)

**Solution:** Always include tenantId in queries

```typescript
// ✅ CORRECT
const invoice = await Invoice.findOne({ _id: invoiceId, tenantId });
```

### ❌ Pitfall 2: Not Validating Cross-References

```typescript
// ❌ WRONG - Not checking if vehicle belongs to tenant
const jobCard = await JobCard.create({
  vehicleId: data.vehicleId, // Could be from another tenant!
  tenantId,
});
```

**Solution:** Validate referenced resources

```typescript
// ✅ CORRECT
const vehicle = await Vehicle.findOne({ _id: data.vehicleId, tenantId });
if (!vehicle) {
  return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
}
const jobCard = await JobCard.create({ vehicleId: vehicle._id, tenantId });
```

### ❌ Pitfall 3: Global Unique Constraints

```typescript
// ❌ WRONG - Email is globally unique
email: { type: String, unique: true }
```

**Impact:** Can't have same email in different tenants

**Solution:** Compound unique index

```typescript
// ✅ CORRECT
email: String,
// Then add compound index:
Schema.index({ tenantId: 1, email: 1 }, { unique: true });
```

---

## 🆘 Getting Help

### Documentation
- **Main Plan:** [TENANT_MIGRATION_PLAN.md](TENANT_MIGRATION_PLAN.md)
- **Your Guide:** DEV[X]_*_GUIDE.md
- **Progress:** `.devworkspace/PROGRESS.md`

### Communication
- **Slack Channel:** `#tenet-migration`
- **Daily Standup:** 10 AM
- **Weekly Sync:** Friday 3 PM
- **Code Review:** All merges require 1+ approval

### Escalation
- Blocker? Post in Slack immediately
- Security concern? Alert tech lead
- Can't merge? Request code review

---

## ✅ Pre-Merge Checklist

Before merging to `tenet`:

- [ ] All tests passing
- [ ] Code reviewed by peer
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] No console.log or debugging code
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Task tracker updated
- [ ] Progress dashboard updated

---

## 📈 Success Metrics

### Functional
- [ ] Users only see their tenant's data
- [ ] Cross-tenant access blocked
- [ ] File storage isolated
- [ ] Sequential numbers work per-tenant
- [ ] External integrations work per-tenant

### Security
- [ ] Zero data leakage in tests
- [ ] All queries filtered by tenant
- [ ] File access validated
- [ ] Auth includes tenant context

### Performance
- [ ] Page loads < 2 seconds
- [ ] API responses < 500ms
- [ ] Proper indexes used
- [ ] Supports 100+ tenants

### Testing
- [ ] 90%+ code coverage on tenant logic
- [ ] All integration tests pass
- [ ] Security audit passed
- [ ] Performance benchmarks met

---

## 🎉 Launch Checklist (Week 6+)

- [ ] All developers merged
- [ ] Full integration testing passed
- [ ] Security audit complete
- [ ] Performance testing passed
- [ ] Migration scripts tested on production copy
- [ ] Rollback plan documented
- [ ] Monitoring setup
- [ ] Documentation complete
- [ ] Team training complete
- [ ] Product team sign-off

---

## 📞 Emergency Contacts

**Tech Lead:** [Your Name]
**Project Manager:** [PM Name]
**Security Lead:** [Security Name]
**DevOps:** [DevOps Name]

---

**Last Updated:** 2025-12-04
**Version:** 1.0

Good luck! 🚀
