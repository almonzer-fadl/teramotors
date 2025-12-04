#!/bin/bash

# Multi-Tenant Migration - Parallel Development Setup Script
# This script sets up the 4 developer branches for parallel work

set -e

echo "🚀 Setting up parallel development branches for tenant migration..."

# Ensure we're on the tenet branch
git checkout tenet
git pull origin tenet

echo ""
echo "📋 Creating developer branches..."

# Create developer branches
BRANCHES=(
  "tenet/dev1-foundation-auth"
  "tenet/dev2-data-models"
  "tenet/dev3-api-routes"
  "tenet/dev4-integrations-ui"
)

for branch in "${BRANCHES[@]}"; do
  if git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "⚠️  Branch $branch already exists, skipping..."
  else
    git checkout -b "$branch"
    git push -u origin "$branch"
    echo "✅ Created and pushed $branch"
    git checkout tenet
  fi
done

echo ""
echo "📁 Creating developer workspace directories..."

# Create directories for each developer
mkdir -p .devworkspace/dev1-foundation-auth
mkdir -p .devworkspace/dev2-data-models
mkdir -p .devworkspace/dev3-api-routes
mkdir -p .devworkspace/dev4-integrations-ui

echo "✅ Developer workspace directories created"

echo ""
echo "📝 Creating .gitignore entry for dev workspace..."

# Add to .gitignore if not already there
if ! grep -q ".devworkspace" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Developer workspace" >> .gitignore
  echo ".devworkspace/" >> .gitignore
  echo "✅ Added .devworkspace to .gitignore"
else
  echo "⚠️  .devworkspace already in .gitignore"
fi

echo ""
echo "🎯 Creating task tracking files..."

# Create task tracking files for each developer
cat > .devworkspace/dev1-foundation-auth/TASKS.md << 'EOF'
# Dev 1: Foundation & Auth - Task Tracker

## Week 1: Core Tenant Model & Infrastructure
- [ ] Create Tenant model
- [ ] Create TenantConfig model
- [ ] Create tenant utilities
- [ ] Create tenant context middleware

## Week 2: Authentication System Updates
- [ ] Update JWT payload with tenantId
- [ ] Update simple-auth.ts
- [ ] Create withTenantAuth middleware
- [ ] Update User model with tenantId
- [ ] Add super admin role

## Week 3: Session & Middleware
- [ ] Update Next.js middleware
- [ ] Create tenant API routes
- [ ] Implement tenant switching

## Week 4: Testing & Documentation
- [ ] Write auth tests
- [ ] Integration tests
- [ ] Documentation

## Notes
-
EOF

cat > .devworkspace/dev2-data-models/TASKS.md << 'EOF'
# Dev 2: Data Models & Migrations - Task Tracker

## Week 1: Model Schema Updates (Part 1)
- [ ] Update Customer model
- [ ] Update Vehicle model
- [ ] Update Appointment model

## Week 2: Model Schema Updates (Part 2)
- [ ] Update JobCard model
- [ ] Update Service model
- [ ] Update Part model
- [ ] Update Invoice model

## Week 3: Model Schema Updates (Part 3)
- [ ] Update Estimate model
- [ ] Update Payment model
- [ ] Update VehicleInspection model
- [ ] Update InspectionTemplate model
- [ ] Create model query helpers

## Week 4: Migration Scripts
- [ ] Create migration script for existing data
- [ ] Create seed script for new tenants
- [ ] Test migrations

## Week 5: Validation & Testing
- [ ] Model validation tests
- [ ] Tenant isolation tests
- [ ] Documentation

## Notes
-
EOF

cat > .devworkspace/dev3-api-routes/TASKS.md << 'EOF'
# Dev 3: API Routes & Business Logic - Task Tracker

## Week 2: Customer & Vehicle APIs
- [ ] Update /api/customers/* routes
- [ ] Update /api/vehicles/* routes
- [ ] Add tenant validation

## Week 3: Job Management APIs
- [ ] Update /api/appointments/* routes
- [ ] Update /api/job-cards/* routes
- [ ] Update /api/services/* routes
- [ ] Update /api/parts/* routes

## Week 4: Financial APIs
- [ ] Update /api/invoices/* routes
- [ ] Update /api/estimates/* routes
- [ ] Update /api/payments/* routes

## Week 5: Inspection & Dashboard APIs
- [ ] Update /api/vehicle-inspections/* routes
- [ ] Update /api/inspection-templates/* routes
- [ ] Update dashboard APIs

## Week 6: Testing & Optimization
- [ ] API integration tests
- [ ] Performance testing
- [ ] Documentation

## Notes
-
EOF

cat > .devworkspace/dev4-integrations-ui/TASKS.md << 'EOF'
# Dev 4: Integrations & Frontend - Task Tracker

## Week 2: File Storage & External Services
- [ ] Update Cloudinary integration
- [ ] Update email service
- [ ] File isolation testing

## Week 3: Communication Services
- [ ] Update WhatsApp integration
- [ ] Update Twilio SMS
- [ ] Tenant-specific configs

## Week 4: ZATCA & Compliance
- [ ] Update ZATCA integration
- [ ] Per-tenant credentials
- [ ] Test compliance

## Week 5: Real-time & Frontend
- [ ] Update Socket.io server
- [ ] Create tenant selector component
- [ ] Create tenant store
- [ ] Update PDF generation

## Week 6: Admin UI & Polish
- [ ] Create super admin dashboard
- [ ] Create tenant management UI
- [ ] Create tenant settings page
- [ ] UI testing

## Notes
-
EOF

echo "✅ Task tracking files created"

echo ""
echo "📊 Creating progress tracking dashboard..."

cat > .devworkspace/PROGRESS.md << 'EOF'
# Multi-Tenant Migration - Progress Dashboard

Last Updated: $(date)

## Overall Progress

### Week 1
- [ ] Dev 1: Foundation complete
- [ ] Dev 2: Part 1 models complete

### Week 2
- [ ] Dev 1: Auth updates complete
- [ ] Dev 2: Part 2 models complete
- [ ] Dev 3: Customer/Vehicle APIs complete
- [ ] Dev 4: File storage complete

### Week 3
- [ ] Dev 1: Middleware complete
- [ ] Dev 2: Part 3 models complete
- [ ] Dev 3: Job management APIs complete
- [ ] Dev 4: Communication services complete

### Week 4
- [ ] Dev 1: Testing complete
- [ ] Dev 2: Migration scripts complete
- [ ] Dev 3: Financial APIs complete
- [ ] Dev 4: ZATCA integration complete

### Week 5
- [ ] Dev 2: Final testing complete
- [ ] Dev 3: Inspection APIs complete
- [ ] Dev 4: Real-time updates complete

### Week 6
- [ ] Dev 3: API testing complete
- [ ] Dev 4: Admin UI complete
- [ ] Full integration testing
- [ ] Security audit
- [ ] Performance testing

## Merge Status

- [ ] Week 1: Dev 1 foundation → tenet
- [ ] Week 2: Dev 2 core models → tenet
- [ ] Week 3: Dev 1 auth complete → tenet, Dev 4 file storage → tenet
- [ ] Week 4: Dev 2 all models → tenet, Dev 3 customer APIs → tenet
- [ ] Week 5: Dev 3 all APIs → tenet, Dev 4 integrations → tenet
- [ ] Week 6: Dev 4 UI → tenet, final testing

## Blockers & Issues

### Dev 1
-

### Dev 2
-

### Dev 3
-

### Dev 4
-

## Notes
-
EOF

echo "✅ Progress dashboard created"

echo ""
echo "🔧 Setting up npm scripts..."

# Check if package.json has our custom scripts
if ! grep -q "migrate:tenant" package.json 2>/dev/null; then
  echo "⚠️  Please add these scripts to package.json manually:"
  echo ""
  echo '  "scripts": {'
  echo '    "migrate:tenant": "tsx scripts/migrations/add-tenant-to-existing-data.ts",'
  echo '    "seed:tenant": "tsx scripts/migrations/seed-new-tenant.ts",'
  echo '    "test:tenant": "jest --testPathPattern=tenant"'
  echo '  }'
else
  echo "✅ Migration scripts already configured"
fi

echo ""
echo "📖 Creating developer README..."

cat > .devworkspace/README.md << 'EOF'
# Developer Workspace

This directory contains resources for the multi-tenant migration.

## For Developers

### Your Branch
Each developer has their own feature branch:
- Dev 1: `tenet/dev1-foundation-auth`
- Dev 2: `tenet/dev2-data-models`
- Dev 3: `tenet/dev3-api-routes`
- Dev 4: `tenet/dev4-integrations-ui`

### Getting Started

1. Check out your branch:
```bash
git checkout tenet/dev[X]-[your-area]
```

2. Read your implementation guide:
```bash
# Located in project root:
# DEV1_FOUNDATION_AUTH_GUIDE.md
# DEV2_DATA_MODELS_GUIDE.md
# DEV3_API_ROUTES_GUIDE.md
# DEV4_INTEGRATIONS_UI_GUIDE.md
```

3. Track your progress:
```bash
# Update your TASKS.md in .devworkspace/dev[X]-*/TASKS.md
```

### Daily Workflow

```bash
# Start of day: Pull latest from tenet
git checkout tenet
git pull origin tenet
git checkout tenet/dev[X]-[your-area]
git merge tenet

# Do your work...

# End of day: Push your changes
git add .
git commit -m "feat: descriptive message"
git push origin tenet/dev[X]-[your-area]

# Update your TASKS.md with progress
```

### Communication

- **Daily standup:** Share progress and blockers
- **Slack channel:** `#tenet-migration`
- **Weekly sync:** Coordinate merges

### Merge Process

1. Ensure all tests pass
2. Get code review approval
3. Merge to `tenet` branch
4. Update PROGRESS.md
5. Notify team in Slack

## Resources

- Main Plan: `/TENANT_MIGRATION_PLAN.md`
- Progress Dashboard: `.devworkspace/PROGRESS.md`
- Implementation Guides: `DEV[X]_*_GUIDE.md` files

EOF

echo "✅ Developer README created"

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Assign developers to their branches:"
echo "   - Dev 1: git checkout tenet/dev1-foundation-auth"
echo "   - Dev 2: git checkout tenet/dev2-data-models"
echo "   - Dev 3: git checkout tenet/dev3-api-routes"
echo "   - Dev 4: git checkout tenet/dev4-integrations-ui"
echo ""
echo "2️⃣  Each developer should read their guide:"
echo "   - DEV1_FOUNDATION_AUTH_GUIDE.md"
echo "   - DEV2_DATA_MODELS_GUIDE.md"
echo "   - DEV3_API_ROUTES_GUIDE.md"
echo "   - DEV4_INTEGRATIONS_UI_GUIDE.md"
echo ""
echo "3️⃣  Review the main plan: TENANT_MIGRATION_PLAN.md"
echo ""
echo "4️⃣  Track progress in: .devworkspace/PROGRESS.md"
echo ""
echo "🚀 Ready to start the migration!"
echo ""
