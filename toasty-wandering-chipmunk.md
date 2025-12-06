# Implementation Plan: Usage Enforcement, Backup & Recovery, Analytics

## Selected Features
1. ✅ **Usage Monitoring & Enforcement** - Prevent tenants from exceeding subscription limits
2. ✅ **Backup & Recovery** - Manual MongoDB backups (no Atlas/cloud costs)
3. ✅ **Advanced Analytics Dashboard** - Revenue trends, growth charts, KPIs
4. ❌ Payment Gateway - Deferred
5. ❌ Alerting System - Deferred

---

## FEATURE 1: USAGE MONITORING & ENFORCEMENT

### Goal
Prevent tenants from exceeding subscription limits (maxUsers, maxVehicles) with real-time enforcement and monitoring dashboard.

### Implementation Steps

#### Step 1: Update Tenant Model with Stats Tracking
**File:** `/client/lib/models/Tenant.ts`

Add `stats` field to track current usage:
```typescript
stats: {
  currentUsers: { type: Number, default: 0 },
  currentVehicles: { type: Number, default: 0 },
  currentCustomers: { type: Number, default: 0 },
  storageUsed: { type: Number, default: 0 }, // MB
  lastUpdated: { type: Date, default: Date.now }
}
```

Add indexes for performance:
```typescript
TenantSchema.index({ 'stats.currentUsers': 1 });
TenantSchema.index({ 'stats.currentVehicles': 1 });
```

#### Step 2: Create Usage Enforcement Middleware
**File:** `/client/lib/middleware/usage-enforcement.ts` (NEW)

```typescript
export async function checkUsageLimit(
  tenantId: string,
  resourceType: 'user' | 'vehicle',
  action: 'create' | 'delete'
): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> {
  const tenant = await Tenant.findById(tenantId);

  const limitKey = resourceType === 'user' ? 'maxUsers' : 'maxVehicles';
  const countKey = resourceType === 'user' ? 'currentUsers' : 'currentVehicles';

  const limit = tenant.subscription[limitKey];
  const current = tenant.stats[countKey];

  if (action === 'create' && current >= limit) {
    return {
      allowed: false,
      reason: `${resourceType} limit reached (${current}/${limit})`,
      current,
      limit
    };
  }

  return { allowed: true, current, limit };
}
```

#### Step 3: Create Usage Tracker Utility
**File:** `/client/lib/utils/usage-tracker.ts` (NEW)

```typescript
export async function updateTenantStats(tenantId: string): Promise<void> {
  const [userCount, vehicleCount, customerCount] = await Promise.all([
    User.countDocuments({ tenantId }),
    Vehicle.countDocuments({ tenantId }),
    Customer.countDocuments({ tenantId })
  ]);

  await Tenant.findByIdAndUpdate(tenantId, {
    'stats.currentUsers': userCount,
    'stats.currentVehicles': vehicleCount,
    'stats.currentCustomers': customerCount,
    'stats.lastUpdated': new Date()
  });
}
```

#### Step 4: Modify User Creation API
**File:** `/client/app/api/users/route.ts`

Add usage check before creating user:
```typescript
// Before creating user
const usageCheck = await checkUsageLimit(tenantId, 'user', 'create');
if (!usageCheck.allowed) {
  return NextResponse.json({
    error: usageCheck.reason,
    current: usageCheck.current,
    limit: usageCheck.limit
  }, { status: 403 });
}
```

#### Step 5: Modify Vehicle Creation API
**File:** `/client/app/api/vehicles/route.ts`

Similar usage check for vehicles.

#### Step 6: Create Usage Analytics API
**File:** `/client/app/api/admin/usage/route.ts` (NEW)

```typescript
GET /api/admin/usage
- Returns list of all tenants with usage vs limits
- Response: { tenantId, name, users: { current, limit, percentage }, vehicles: { current, limit, percentage } }
```

#### Step 7: Create Usage Monitoring Dashboard Component
**File:** `/client/components/admin/UsageMonitoringDashboard.tsx` (NEW)

Features:
- Table showing all tenants with progress bars (current/limit)
- Color coding: green (<70%), yellow (70-90%), red (>90%)
- Search and filter functionality
- Click tenant to see details

#### Step 8: Add Tab to Admin System Page
**File:** `/client/app/(dashboard)/admin/system/page.tsx`

Add new tab: "Usage Monitoring"

---

## FEATURE 2: BACKUP & RECOVERY

### Goal
Manual MongoDB backup/restore using native tools without cloud storage costs.

### Implementation Steps

#### Step 1: Create Backup Model
**File:** `/client/lib/models/Backup.ts` (NEW)

```typescript
interface IBackup {
  type: 'full' | 'tenant';
  tenantId?: ObjectId;
  filename: string;
  filepath: string;
  size: number;
  status: 'in_progress' | 'completed' | 'failed';
  createdBy: ObjectId;
  createdAt: Date;
  completedAt?: Date;
  metadata: {
    documentCounts: Record<string, number>;
    collections: string[];
  };
}
```

#### Step 2: Create Backup Manager Utility
**File:** `/client/lib/utils/backup-manager.ts` (NEW)

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function createFullBackup(): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = `/Users/almonzerfadl/Desktop/Work/Programming/teramotors/backups/backup_full_${timestamp}`;

  // Use mongodump
  const command = `mongodump --uri="${process.env.MONGODB_URI}" --out="${backupPath}" --gzip`;

  await execAsync(command);

  // Get file size, document counts
  return { backupPath, size, collections };
}
```

#### Step 3: Create Backup API Endpoints
**File:** `/client/app/api/admin/backup/route.ts` (NEW)

```typescript
POST /api/admin/backup
- Body: { type: 'full' | 'tenant', tenantId?: string }
- Triggers backup creation
- Returns: { backupId, status }

GET /api/admin/backup
- Lists all backups
- Returns: { backups: [...], total }
```

**File:** `/client/app/api/admin/backup/[id]/download/route.ts` (NEW)

```typescript
GET /api/admin/backup/:id/download
- Streams backup file for download
- Content-Type: application/gzip
```

#### Step 4: Create Restore Manager Utility
**File:** `/client/lib/utils/restore-manager.ts` (NEW)

```typescript
export async function restoreFullBackup(filepath: string): Promise<void> {
  const command = `mongorestore --uri="${process.env.MONGODB_URI}" --drop --gzip "${filepath}"`;
  await execAsync(command);
}
```

#### Step 5: Create Backup UI Component
**File:** `/client/components/admin/BackupManager.tsx` (NEW)

Features:
- "Create Full Backup" button
- "Create Tenant Backup" dropdown
- Backup history table (Date, Type, Size, Status, Actions)
- Download and Restore actions with confirmations

#### Step 6: Add Tab to Admin System Page
**File:** `/client/app/(dashboard)/admin/system/page.tsx`

Add new tab: "Backup & Recovery"

---

## FEATURE 3: ADVANCED ANALYTICS DASHBOARD

### Goal
Business intelligence dashboard with revenue trends, growth metrics, and interactive charts.

### Implementation Steps

#### Step 1: Create Analytics Calculator Utility
**File:** `/client/lib/utils/analytics-calculator.ts` (NEW)

```typescript
export async function calculateMRR(): Promise<number> {
  // Calculate Monthly Recurring Revenue
  const activeSubscriptions = await Tenant.find({
    'subscription.status': 'active'
  });

  return activeSubscriptions.reduce((mrr, tenant) => {
    const planValue = getPlanMonthlyValue(tenant.subscription.plan);
    return mrr + planValue;
  }, 0);
}

export async function calculateRevenueTrend(
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month'
): Promise<TrendData[]> {
  // Aggregate invoices by date interval
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'paid'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  return Invoice.aggregate(pipeline);
}
```

#### Step 2: Create Analytics API Endpoints
**File:** `/client/app/api/admin/analytics/revenue/route.ts` (NEW)

```typescript
GET /api/admin/analytics/revenue?startDate=2025-01-01&endDate=2025-12-06&interval=day
- Returns time-series revenue data
- Response: { data: [{ date, revenue, invoiceCount }], summary: { total, average, growth } }
```

**File:** `/client/app/api/admin/analytics/tenants/route.ts` (NEW)

```typescript
GET /api/admin/analytics/tenants?days=30
- Returns tenant growth data
- Response: { growth: [{ date, total, new, churned }], summary: {...} }
```

**File:** `/client/app/api/admin/analytics/subscriptions/route.ts` (NEW)

```typescript
GET /api/admin/analytics/subscriptions
- Returns subscription distribution
- Response: { distribution: [{ plan, count, percentage }] }
```

**File:** `/client/app/api/admin/analytics/mrr/route.ts` (NEW)

```typescript
GET /api/admin/analytics/mrr
- Returns MRR metrics
- Response: { current, previous, growth, trend: [...] }
```

#### Step 3: Create Chart Components
**File:** `/client/components/admin/analytics/RevenueChart.tsx` (NEW)

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#F97402" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**File:** `/client/components/admin/analytics/SubscriptionPieChart.tsx` (NEW)

```typescript
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

export default function SubscriptionPieChart({ data }) {
  const COLORS = ['#4ADE80', '#F97402', '#3B82F6', '#8B5CF6'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

**File:** `/client/components/admin/analytics/TenantGrowthChart.tsx` (NEW)

Area chart for tenant growth over time.

**File:** `/client/components/admin/analytics/MetricCard.tsx` (NEW)

Reusable KPI card with trend indicator.

#### Step 4: Create Analytics Dashboard Page
**File:** `/client/app/(dashboard)/admin/analytics/page.tsx` (NEW)

Layout:
- Date range selector (7 days, 30 days, 90 days, custom)
- Metric cards row (MRR, Total Revenue, Active Tenants, Conversion Rate)
- Revenue trend chart (full width)
- Tenant growth chart + Subscription pie chart
- Top tenants table

#### Step 5: Add Navigation Link
**File:** `/client/app/(dashboard)/admin/page.tsx`

Add quick action: "View Analytics"

---

## IMPLEMENTATION ORDER

### Phase 1: Usage Enforcement (Week 1)
1. Update Tenant model with stats field
2. Create usage enforcement middleware
3. Create usage tracker utility
4. Modify user/vehicle POST APIs
5. Create usage analytics API
6. Create UsageMonitoringDashboard component
7. Add tab to admin system page
8. Test with different subscription limits

### Phase 2: Backup & Recovery (Week 2)
1. Create Backup model
2. Create backup-manager utility (mongodump)
3. Create restore-manager utility (mongorestore)
4. Implement backup API endpoints
5. Create BackupManager UI component
6. Add tab to admin system page
7. Test full backup/restore cycle
8. Test tenant-specific backup

### Phase 3: Analytics Dashboard (Week 3-4)
1. Create analytics-calculator utility
2. Implement analytics API endpoints
3. Create chart components (Revenue, Pie, Growth)
4. Create MetricCard component
5. Create AnalyticsDashboard page
6. Add navigation links
7. Test with real data
8. Add caching for performance

---

## CRITICAL FILES TO CREATE/MODIFY

### New Files (21 total)

**Models:**
- `/client/lib/models/Backup.ts`
- `/client/lib/models/UsageLog.ts`

**Middleware/Utils:**
- `/client/lib/middleware/usage-enforcement.ts`
- `/client/lib/utils/usage-tracker.ts`
- `/client/lib/utils/backup-manager.ts`
- `/client/lib/utils/restore-manager.ts`
- `/client/lib/utils/analytics-calculator.ts`

**API Routes:**
- `/client/app/api/admin/usage/route.ts`
- `/client/app/api/admin/backup/route.ts`
- `/client/app/api/admin/backup/[id]/download/route.ts`
- `/client/app/api/admin/analytics/revenue/route.ts`
- `/client/app/api/admin/analytics/tenants/route.ts`
- `/client/app/api/admin/analytics/subscriptions/route.ts`
- `/client/app/api/admin/analytics/mrr/route.ts`

**Components:**
- `/client/components/admin/UsageMonitoringDashboard.tsx`
- `/client/components/admin/BackupManager.tsx`
- `/client/components/admin/analytics/RevenueChart.tsx`
- `/client/components/admin/analytics/SubscriptionPieChart.tsx`
- `/client/components/admin/analytics/TenantGrowthChart.tsx`
- `/client/components/admin/analytics/MetricCard.tsx`

**Pages:**
- `/client/app/(dashboard)/admin/analytics/page.tsx`

### Modified Files (4 total)
- `/client/lib/models/Tenant.ts` - Add stats field
- `/client/app/api/users/route.ts` - Add usage check
- `/client/app/api/vehicles/route.ts` - Add usage check
- `/client/app/(dashboard)/admin/system/page.tsx` - Add new tabs

---

## ENVIRONMENT VARIABLES

Add to `.env.local`:
```
BACKUP_STORAGE_PATH=/Users/almonzerfadl/Desktop/Work/Programming/teramotors/backups
MAX_BACKUP_SIZE_MB=1024
ANALYTICS_CACHE_TTL=3600
```

---

## TESTING CHECKLIST

### Usage Enforcement
- [ ] Create user when under limit (should succeed)
- [ ] Create user at limit (should fail with clear message)
- [ ] Delete user (should update stats)
- [ ] Verify usage dashboard shows correct numbers
- [ ] Test with different subscription plans

### Backup & Recovery
- [ ] Create full backup (verify file created)
- [ ] Download backup (verify file downloads)
- [ ] Restore from backup (verify data restored)
- [ ] Create tenant-specific backup
- [ ] Test restore on empty database
- [ ] Verify backup metadata is accurate

### Analytics
- [ ] Verify revenue chart shows correct data
- [ ] Test date range selector
- [ ] Verify MRR calculation is correct
- [ ] Test subscription distribution pie chart
- [ ] Verify tenant growth chart
- [ ] Test with large datasets for performance

---

## SUCCESS METRICS

✅ **Usage Enforcement:**
- Tenants cannot exceed subscription limits
- Clear error messages when limit reached
- Admin can monitor usage across all tenants

✅ **Backup & Recovery:**
- Can create manual backups on demand
- Can download backup files
- Can restore from backup successfully
- Backup metadata tracked in database

✅ **Analytics:**
- Revenue trends displayed with charts
- MRR calculated accurately
- Tenant growth visualized
- Dashboard loads in <2 seconds

---

## ESTIMATED TIMELINE

- **Week 1:** Usage Enforcement (5-7 days)
- **Week 2:** Backup & Recovery (4-5 days)
- **Week 3-4:** Analytics Dashboard (7-10 days)

**Total: 3-4 weeks** for full implementation and testing.
