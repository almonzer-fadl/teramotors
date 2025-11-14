# Inspection Automation System Update - Implementation Task List

**Project:** TeraMotors Inspection Workflow Automation
**Date:** 2025-11-14
**Estimated Duration:** 92 hours (11-12 working days)

---

## Overview

This document outlines the step-by-step implementation of a comprehensive inspection workflow automation system with the following key features:

1. **Unique Code System** - Links parts, services, and inspection items with consistent codes (e.g., E015)
2. **UI Modernization** - Circular button interface for touch-friendly inspection forms
3. **Intelligent Part Matching** - Algorithm to match parts based on vehicle details
4. **Automated Workflow** - From inspection creation to auto-generated estimates and invoices

---

## Phase 1: Database Schema Updates (16 hours)

### Task 1.1: Update Part Model ✓
**File:** `/client/lib/models/Part.ts`

**Changes:**
```typescript
// ADD after line 18 (after partNumber field):
uniqueCode: {
  type: String,
  required: false,  // Will be required after migration
  unique: true,
  sparse: true,
  index: true,
  match: /^[A-Z]\d{3}$/  // Format: E015, B023, T007
}

compatibleVehicles: [{
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true }
}]  // May already exist - verify first
```

**Indexes to add:**
```typescript
PartSchema.index({ uniqueCode: 1 });
```

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 1.2: Update Service Model ✓
**File:** `/client/lib/models/Service.ts`

**Changes:**
```typescript
// ADD after line 9 (after laborHours field):
uniqueCode: {
  type: String,
  required: false,  // Will be required after migration
  unique: true,
  sparse: true,
  index: true,
  match: /^[A-Z]\d{3}$/
}
```

**Update partsRequired array:**
```typescript
partsRequired: [{
  partId: { type: Schema.Types.ObjectId, ref: 'Part' },
  uniqueCode: { type: String, required: false },  // ADD THIS
  quantity: { type: Number, required: true, min: 1 },
  cost: { type: Number, required: true, min: 0 }
}]
```

**Indexes to add:**
```typescript
ServiceSchema.index({ uniqueCode: 1 });
```

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 1.3: Update InspectionTemplate Model ✓
**File:** `/client/lib/models/InspectionTemplate.ts`

**Changes:**
```typescript
// MODIFY items array (lines 9-12):
items: [{
  itemId: { type: String, required: true },
  name: { type: String, required: true },  // ADD
  category: { type: String, required: true },
  uniqueCode: { type: String, required: false }  // ADD
}]
```

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 1.4: Update VehicleInspection Model ✓
**File:** `/client/lib/models/VehicleInspection.ts`

**Changes:**
```typescript
// MODIFY items array (lines 12-16):
items: [{
  itemId: { type: String, required: true },
  name: { type: String, required: true },  // ADD
  category: { type: String, required: true },
  uniqueCode: { type: String, required: false },  // ADD
  condition: { type: String, enum: ['good', 'fair', 'poor'], required: true }
  // Note: Remove 'critical' from enum, use only good/fair/poor
}]

// ADD new fields after line 21 (after updatedAt):
jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: false },
generatedEstimateId: { type: Schema.Types.ObjectId, ref: 'Estimate', required: false },
generatedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: false }
```

**Indexes to add:**
```typescript
VehicleInspectionSchema.index({ jobCardId: 1 });
VehicleInspectionSchema.index({ generatedEstimateId: 1 });
VehicleInspectionSchema.index({ generatedInvoiceId: 1 });
```

**Estimated Time:** 1.5 hours
**Risk Level:** Low

---

### Task 1.5: Update JobCard Model ✓
**File:** `/client/lib/models/JobCard.ts`

**Changes:**
```typescript
// ADD after line 6 (after inspectionId):
type: {
  type: String,
  enum: ['regular', 'inspection', 'repair'],
  default: 'regular'
},
parentJobCardId: {
  type: Schema.Types.ObjectId,
  ref: 'JobCard',
  required: false
},
inspectionFeeDeducted: {
  type: Number,
  default: 0,
  min: 0
}
```

**Indexes to add:**
```typescript
JobCardSchema.index({ type: 1 });
JobCardSchema.index({ parentJobCardId: 1 });
```

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 1.6: Update Estimate Model (verify if needed) ✓
**File:** `/client/lib/models/Estimate.ts`

**Check if this field exists:**
```typescript
inspectionFee: { type: Number, default: 0, min: 0 }
```

**If not, add it after the tax field.**

**Estimated Time:** 0.5 hours
**Risk Level:** Low

---

### Task 1.7: Update Invoice Model (verify if needed) ✓
**File:** `/client/lib/models/Invoice.ts`

**Check if this field exists:**
```typescript
isInspectionInvoice: { type: Boolean, default: false }
inspectionId: { type: Schema.Types.ObjectId, ref: 'VehicleInspection', required: false }
```

**If not, add these fields.**

**Estimated Time:** 0.5 hours
**Risk Level:** Low

---

## Phase 2: Data Migration (10 hours)

### Task 2.1: Create Migration Script ✓
**File:** `/server/migrations/001-add-unique-codes.js` (NEW FILE)

**Script Structure:**
```javascript
// 1. Define category prefix mapping
const CATEGORY_PREFIXES = {
  'Engine': 'E',
  'Brakes': 'B',
  'Tires': 'T',
  'Suspension': 'S',
  'Electrical': 'L',
  'Transmission': 'R',
  'Cooling': 'C',
  'Fuel': 'F',
  'Exhaust': 'X',
  'Body': 'D',
  'Interior': 'I',
  'Safety': 'A',
  'General': 'G',
  'Maintenance': 'M'
};

// 2. Migrate Parts (assign codes based on category)
// 3. Migrate Services (assign codes based on category)
// 4. Migrate InspectionTemplate items
// 5. Migrate VehicleInspection items
// 6. Generate mapping CSV for review
```

**Estimated Time:** 4 hours
**Risk Level:** Medium

---

### Task 2.2: Create Rollback Script ✓
**File:** `/server/migrations/001-rollback-unique-codes.js` (NEW FILE)

**Script to remove uniqueCode fields and restore original state.**

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 2.3: Test Migration on Development Database ✓
- Create database backup
- Run migration script
- Verify all records have codes
- Check for duplicates
- Verify uniqueness constraints

**Estimated Time:** 2 hours
**Risk Level:** Medium

---

### Task 2.4: Generate Migration Report ✓
**Output:** `/server/migrations/migration-report-YYYY-MM-DD.csv`

**Columns:**
- Entity Type (Part/Service/Template Item)
- Original ID
- Name
- Original Category
- Assigned Prefix
- Generated Code
- Status (Success/Failed/Duplicate)

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 2.5: Execute Migration on Staging ✓
- Backup staging database
- Run migration
- Verify results
- Test application functionality

**Estimated Time:** 1 hour
**Risk Level:** Medium

---

## Phase 3: UI Component Updates (20 hours)

### Task 3.1: Update InspectionForm - Circular Buttons ✓
**File:** `/client/components/forms/InspectionForm.tsx`

**Location:** Around line 512-526 (condition dropdown)

**Replace:**
```typescript
// OLD: Dropdown
<select id={`condition-${index}`} ...>

// NEW: Circular Buttons
<div className="flex gap-4 justify-center">
  {['good', 'fair', 'poor'].map(condition => (
    <button
      key={condition}
      type="button"
      onClick={() => handleItemChange(index, "condition", condition)}
      className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                  transition-all shadow-md hover:scale-110 active:scale-95 ${
        item.condition === condition
          ? condition === 'good'
            ? 'bg-green-500 ring-4 ring-green-300'
            : condition === 'fair'
            ? 'bg-yellow-500 ring-4 ring-yellow-300'
            : 'bg-red-500 ring-4 ring-red-300'
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      aria-label={`Set condition to ${condition}`}
    >
      {item.condition === condition && (
        <CheckIcon className="w-8 h-8 text-white" />
      )}
    </button>
  ))}
</div>

{/* Legend for clarity */}
<div className="flex gap-2 justify-center mt-2 text-xs text-gray-600">
  <span className="flex items-center gap-1">
    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    Good
  </span>
  <span className="flex items-center gap-1">
    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
    Fair
  </span>
  <span className="flex items-center gap-1">
    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
    Poor
  </span>
</div>
```

**Import CheckIcon:**
```typescript
import { CheckIcon } from '@heroicons/react/24/solid';
```

**Estimated Time:** 4 hours
**Risk Level:** Low

---

### Task 3.2: Update InspectionForm - Category Headers ✓
**File:** `/client/components/forms/InspectionForm.tsx`

**Add useMemo to group items:**
```typescript
const groupedItems = useMemo(() => {
  return formData.items.reduce((acc, item, index) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<typeof formData.items[0] & { originalIndex: number }>>);
}, [formData.items]);
```

**Replace items rendering section:**
```typescript
{Object.entries(groupedItems).map(([category, items]) => (
  <div key={category} className="mb-8">
    {/* Category Header */}
    <div className="flex items-center mb-4 pb-2 border-b-2 border-blue-600">
      <div className="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
      <h4 className="text-xl font-bold text-gray-900">{category}</h4>
      <span className="ml-auto text-sm text-gray-500">{items.length} items</span>
    </div>

    {/* Items in this category */}
    {items.map((item) => (
      <div key={item.originalIndex}>
        {/* existing item rendering logic, use item.originalIndex for handlers */}
      </div>
    ))}
  </div>
))}
```

**Estimated Time:** 3 hours
**Risk Level:** Low

---

### Task 3.3: Add Tablet Optimization Styles ✓
**File:** `/client/components/forms/InspectionForm.tsx`

**Add responsive classes and touch optimization:**
```typescript
// Larger font sizes for tablet
// Increased touch targets (20x20 instead of 16x16)
// Better spacing between elements
// Sticky category headers on scroll
```

**Test on:**
- Mobile (375px)
- Tablet (768px, 1024px)
- Desktop (1440px)

**Estimated Time:** 3 hours
**Risk Level:** Low

---

### Task 3.4: Update InlineInspectionCreator ✓
**File:** `/client/components/forms/InlineInspectionCreator.tsx`

**Apply same UI changes:**
- Circular buttons for conditions
- Category grouping (if has multiple items)

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 3.5: Update JobCardForm - Type Selector ✓
**File:** `/client/components/forms/JobCardForm.tsx`

**Add at top of form (after customer/vehicle selection):**
```typescript
{/* Job Card Type */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Job Type
  </label>
  <select
    value={formData.type || 'regular'}
    onChange={(e) => handleInputChange('type', e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  >
    <option value="regular">Regular Service</option>
    <option value="inspection">Inspection Only</option>
    <option value="repair">Repair Work</option>
  </select>
</div>

{/* Show inspection creator if type is inspection */}
{formData.type === 'inspection' && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
    <h4 className="font-semibold mb-2">Create Inspection</h4>
    <InlineInspectionCreator
      customerId={formData.customerId}
      vehicleId={formData.vehicleId}
      onInspectionCreated={(inspectionId) => {
        handleInputChange('inspectionId', inspectionId);
      }}
    />
  </div>
)}
```

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 3.6: Add Translations for New UI Elements ✓
**Files:**
- `/client/locales/en/common.json`
- `/client/locales/ar/common.json`

**Add keys:**
```json
{
  "inspection": {
    "condition": {
      "good": "Good",
      "fair": "Fair",
      "poor": "Poor",
      "selectCondition": "Select Condition"
    },
    "jobType": {
      "regular": "Regular Service",
      "inspection": "Inspection Only",
      "repair": "Repair Work"
    }
  }
}
```

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 3.7: Update TypeScript Types ✓
**Files:**
- `/client/types/inspection.ts` (if exists)
- `/client/types/jobCard.ts` (if exists)

**Add/update interfaces to match new schema.**

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 3.8: UI Testing ✓
**Test checklist:**
- [ ] Circular buttons work on touch devices
- [ ] Category headers display correctly
- [ ] Categories are properly grouped
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Arabic RTL layout works
- [ ] Job type selector works
- [ ] Inspection creator shows/hides correctly

**Estimated Time:** 4 hours
**Risk Level:** Low

---

## Phase 4: Part Matching Algorithm (24 hours)

### Task 4.1: Create PartMatchingService Class ✓
**File:** `/client/lib/services/PartMatchingService.ts` (NEW FILE)

**Class structure:**
```typescript
export interface MatchedPart {
  inspectionItem: {
    itemId: string;
    name: string;
    uniqueCode: string;
    category: string;
    condition: string;
  };
  service?: {
    _id: string;
    name: string;
    uniqueCode: string;
    laborHours: number;
    laborRate: number;
  };
  part: {
    _id: string;
    name: string;
    uniqueCode: string;
    cost: number;
    sellingPrice: number;
  };
  quantity: number;
  confidence: 'high' | 'medium' | 'low';
  matchReason: string;
}

export class PartMatchingService {
  async matchInspectionItemsToParts(
    inspectionItems: InspectionItem[],
    vehicleInfo: { make: string; model: string; year: number }
  ): Promise<MatchedPart[]>

  private async findServiceByCode(uniqueCode: string): Promise<Service | null>

  private async findPartByCode(uniqueCode: string): Promise<Part | null>

  private checkVehicleCompatibility(part: Part, vehicle: VehicleInfo): boolean

  private async findPartsByCodeAndVehicle(
    uniqueCode: string,
    vehicle: VehicleInfo
  ): Promise<Part[]>
}
```

**Estimated Time:** 6 hours
**Risk Level:** Medium

---

### Task 4.2: Implement Service Matching Logic ✓
**Method:** `findServiceByCode()`

**Logic:**
1. Query Service model by uniqueCode
2. Return service with populated partsRequired
3. Handle case when no service found (return null)

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 4.3: Implement Part Matching Logic ✓
**Method:** `findPartsByCodeAndVehicle()`

**Logic:**
1. Find all parts with matching uniqueCode
2. Filter by vehicle compatibility
3. If no compatible parts, return generic parts
4. Sort by compatibility confidence

**Estimated Time:** 4 hours
**Risk Level:** Medium

---

### Task 4.4: Implement Vehicle Compatibility Check ✓
**Method:** `checkVehicleCompatibility()`

**Logic:**
```typescript
private checkVehicleCompatibility(
  part: Part,
  vehicle: VehicleInfo
): boolean {
  // No compatibility data = fits all vehicles
  if (!part.compatibleVehicles || part.compatibleVehicles.length === 0) {
    return true;
  }

  // Check for exact match
  const exactMatch = part.compatibleVehicles.some(compat =>
    compat.make.toLowerCase() === vehicle.make.toLowerCase() &&
    compat.model.toLowerCase() === vehicle.model.toLowerCase() &&
    compat.year === vehicle.year
  );

  if (exactMatch) return true;

  // Check for make/model match (year flexible)
  const modelMatch = part.compatibleVehicles.some(compat =>
    compat.make.toLowerCase() === vehicle.make.toLowerCase() &&
    compat.model.toLowerCase() === vehicle.model.toLowerCase()
  );

  return modelMatch;
}
```

**Estimated Time:** 3 hours
**Risk Level:** Low

---

### Task 4.5: Create Part Matching API Endpoint ✓
**File:** `/client/app/api/inspections/[id]/match-parts/route.ts` (NEW FILE)

**Endpoint:** `POST /api/inspections/:id/match-parts`

**Logic:**
1. Fetch inspection by ID with populated vehicle
2. Filter inspection items (only fair/poor conditions)
3. Call PartMatchingService.matchInspectionItemsToParts()
4. Return matched parts with confidence scores

**Estimated Time:** 3 hours
**Risk Level:** Low

---

### Task 4.6: Create Unit Tests for PartMatchingService ✓
**File:** `/client/lib/services/__tests__/PartMatchingService.test.ts` (NEW FILE)

**Test cases:**
- Match by uniqueCode only
- Match with vehicle compatibility
- Handle no matches found
- Handle multiple parts with same code
- Confidence scoring
- Edge cases (null/undefined values)

**Estimated Time:** 4 hours
**Risk Level:** Low

---

### Task 4.7: Integration Testing ✓
**Test scenarios:**
- Create inspection with various items
- Call match-parts endpoint
- Verify correct parts returned
- Test with different vehicle makes/models
- Test with missing data

**Estimated Time:** 2 hours
**Risk Level:** Medium

---

## Phase 5: Workflow Automation (32 hours)

### Task 5.1: Create Inspection Completion Endpoint ✓
**File:** `/client/app/api/inspections/[id]/complete/route.ts` (NEW FILE)

**Endpoint:** `POST /api/inspections/:id/complete`

**Steps:**
1. Mark inspection status as 'completed'
2. Auto-generate estimate from fair/poor items
3. Create invoice for inspection fee (configurable amount)
4. Link estimate and invoice to inspection
5. Update job card status to 'completed'
6. Send WhatsApp notification

**Estimated Time:** 6 hours
**Risk Level:** High

---

### Task 5.2: Implement Auto-Estimate Generation ✓
**Enhancement to:** `/client/app/api/estimates/from-inspection/route.ts`

**Update logic to use uniqueCode matching:**
1. Fetch inspection items (fair/poor)
2. Use PartMatchingService to find services/parts
3. Create estimate with matched items
4. Calculate totals (15% tax on parts only)
5. Set 30-day validity
6. Link back to inspection

**Estimated Time:** 4 hours
**Risk Level:** Medium

---

### Task 5.3: Implement Auto-Invoice Generation ✓
**Location:** Within completion endpoint or new service

**Logic:**
1. Create invoice with inspection fee (default: 150 SAR, configurable)
2. Mark as isInspectionInvoice = true
3. Link to inspection and job card
4. Set status to 'pending'
5. Set 7-day due date
6. Generate ZATCA compliance data

**Estimated Time:** 3 hours
**Risk Level:** Medium

---

### Task 5.4: Create Job Card from Inspection Endpoint ✓
**File:** `/client/app/api/job-cards/from-inspection/route.ts` (NEW FILE)

**Endpoint:** `POST /api/job-cards/from-inspection`

**Request body:**
```json
{
  "inspectionId": "...",
  "estimateId": "..." // optional
}
```

**Logic:**
1. Fetch inspection with vehicle details
2. Call PartMatchingService to get services/parts
3. Create new job card with:
   - type: 'repair'
   - parentJobCardId: original inspection job card ID
   - inspectionId: reference to inspection
   - services: from matched items
   - partsUsed: from matched items
   - inspectionFeeDeducted: amount from inspection invoice
4. Update estimate status to 'approved'
5. Return new job card

**Estimated Time:** 6 hours
**Risk Level:** High

---

### Task 5.5: Implement Inspection Fee Deduction Logic ✓
**File:** `/client/app/api/invoices/route.ts` (MODIFY)

**When creating invoice from job card:**
```typescript
// Check if job card has inspectionFeeDeducted > 0
if (jobCard.inspectionFeeDeducted > 0) {
  // Subtract from total
  invoice.totalAmount -= jobCard.inspectionFeeDeducted;
  invoice.notes += `\n\nInspection fee of ${jobCard.inspectionFeeDeducted} SAR deducted from total.`;
}
```

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 5.6: Update Job Card Creation to Support Inspection Type ✓
**File:** `/client/app/api/job-cards/route.ts` (MODIFY)

**When type === 'inspection':**
- Require inspectionId
- Don't require services/parts
- Set default status to 'in-progress'
- Auto-link inspection to job card

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 5.7: Add Configuration for Inspection Fee ✓
**File:** `/client/lib/config/inspection.ts` (NEW FILE)

```typescript
export const INSPECTION_CONFIG = {
  DEFAULT_FEE: 150, // SAR
  INVOICE_DUE_DAYS: 7,
  ESTIMATE_VALIDITY_DAYS: 30,
  AUTO_CLOSE_INSPECTION_JOB_CARD: true
};
```

**Estimated Time:** 0.5 hours
**Risk Level:** Low

---

### Task 5.8: Update WhatsApp Notifications ✓
**File:** `/client/lib/services/WhatsAppEventListeners.ts` (MODIFY)

**Add new event:**
```typescript
async onInspectionCompleted(customerId: string, inspectionId: string) {
  // Send message about completed inspection
  // Include link to estimate
  // Mention invoice for inspection fee
}
```

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 5.9: Create Admin UI for Inspection Fee Configuration ✓
**File:** `/client/app/(dashboard)/settings/inspection/page.tsx` (NEW FILE)

**Settings page to configure:**
- Default inspection fee
- Auto-generate estimate (toggle)
- Auto-generate invoice (toggle)
- Auto-close job card (toggle)

**Estimated Time:** 3 hours
**Risk Level:** Low

---

### Task 5.10: Workflow Integration Testing ✓

**End-to-end test:**
1. Create inspection job card
2. Technician marks inspection items
3. Complete inspection
4. Verify auto-generated estimate
5. Verify auto-generated invoice
6. Approve estimate
7. Create repair job card
8. Verify services/parts populated
9. Verify inspection fee deducted from final invoice

**Estimated Time:** 3.5 hours
**Risk Level:** High

---

## Phase 6: Testing & Quality Assurance (16 hours)

### Task 6.1: Unit Tests ✓
**Files to test:**
- PartMatchingService
- All new API endpoints
- Updated models

**Estimated Time:** 4 hours
**Risk Level:** Low

---

### Task 6.2: Integration Tests ✓
**Test suites:**
- Complete workflow (inspection → estimate → job card → invoice)
- Part matching with different vehicles
- Fee deduction calculation
- Auto-generation triggers

**Estimated Time:** 4 hours
**Risk Level:** Medium

---

### Task 6.3: UI/UX Testing ✓
**Devices:**
- Mobile (iOS Safari, Android Chrome)
- Tablet (iPad, Android tablet)
- Desktop (Chrome, Firefox, Safari, Edge)

**Focus areas:**
- Touch responsiveness
- Category grouping clarity
- Circular button usability
- Form flow

**Estimated Time:** 3 hours
**Risk Level:** Low

---

### Task 6.4: Performance Testing ✓
**Test scenarios:**
- Large inspections (50+ items)
- Part matching with large catalog (1000+ parts)
- Concurrent inspection completions
- Database query optimization

**Estimated Time:** 2 hours
**Risk Level:** Medium

---

### Task 6.5: Security Review ✓
**Check:**
- Authentication on all new endpoints
- Authorization (admin-only endpoints)
- Input validation
- SQL injection prevention
- XSS prevention

**Estimated Time:** 2 hours
**Risk Level:** High

---

### Task 6.6: Accessibility Testing ✓
**WCAG 2.1 AA compliance:**
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus indicators
- ARIA labels

**Estimated Time:** 1 hour
**Risk Level:** Low

---

## Phase 7: Documentation & Deployment (8 hours)

### Task 7.1: Update API Documentation ✓
**File:** `/server/SERVER_DOCUMENTATION.md` (UPDATE)

**Document new endpoints:**
- POST /api/inspections/:id/complete
- POST /api/inspections/:id/match-parts
- POST /api/job-cards/from-inspection

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 7.2: Create User Guide ✓
**File:** `/docs/INSPECTION_WORKFLOW_GUIDE.md` (NEW FILE)

**Sections:**
- Overview of new workflow
- How to create inspection job cards
- How to use circular button interface
- Understanding unique codes
- Auto-generation features
- Inspection fee handling

**Estimated Time:** 2 hours
**Risk Level:** Low

---

### Task 7.3: Create Migration Guide ✓
**File:** `/docs/MIGRATION_GUIDE.md` (NEW FILE)

**Steps for production deployment:**
1. Backup database
2. Run migration script
3. Verify migration results
4. Deploy new code
5. Test critical workflows
6. Rollback procedure

**Estimated Time:** 1 hour
**Risk Level:** Low

---

### Task 7.4: Deploy to Staging ✓
**Steps:**
1. Backup staging database
2. Run migration
3. Deploy code
4. Run smoke tests
5. Fix any issues

**Estimated Time:** 2 hours
**Risk Level:** Medium

---

### Task 7.5: Production Deployment ✓
**Prerequisites:**
- [ ] All tests passing
- [ ] Staging tested successfully
- [ ] Database backup completed
- [ ] Migration script tested
- [ ] Rollback plan ready
- [ ] User training completed

**Steps:**
1. Backup production database
2. Enable maintenance mode
3. Run migration script
4. Deploy new code
5. Verify critical workflows
6. Disable maintenance mode
7. Monitor for issues

**Estimated Time:** 1 hour (execution)
**Risk Level:** High

---

## Risk Matrix

| Risk Level | Count | Mitigation |
|------------|-------|------------|
| **High** | 5 | Extensive testing, rollback plans, gradual rollout |
| **Medium** | 11 | Thorough testing, code review |
| **Low** | 30 | Standard testing procedures |

---

## Dependencies

### External
- None (all features use existing infrastructure)

### Internal
- Database must support unique sparse indexes
- Socket.IO must be running for real-time updates
- WhatsApp service (WAHA) for notifications

---

## Configuration Changes

### Environment Variables (if needed)
```env
# Add to .env
INSPECTION_DEFAULT_FEE=150
INSPECTION_AUTO_GENERATE=true
```

---

## Database Backup Strategy

### Before Migration
```bash
# MongoDB backup
mongodump --uri="mongodb://..." --out=/backup/pre-migration-$(date +%Y%m%d)
```

### Restore if Needed
```bash
# MongoDB restore
mongorestore --uri="mongodb://..." /backup/pre-migration-YYYYMMDD
```

---

## Success Criteria

- [ ] All 46 tasks completed
- [ ] All tests passing (unit + integration)
- [ ] UI works on mobile/tablet/desktop
- [ ] Migration successful with 100% code assignment
- [ ] Part matching accuracy >85%
- [ ] Complete workflow tested end-to-end
- [ ] Documentation complete
- [ ] Production deployment successful
- [ ] No critical bugs in first week

---

## Timeline Summary

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Database Schema | 16 hours | Day 1 | Day 2 |
| Phase 2: Migration | 10 hours | Day 2 | Day 3 |
| Phase 3: UI Updates | 20 hours | Day 3 | Day 5 |
| Phase 4: Part Matching | 24 hours | Day 6 | Day 8 |
| Phase 5: Workflow Automation | 32 hours | Day 9 | Day 12 |
| Phase 6: Testing & QA | 16 hours | Day 13 | Day 14 |
| Phase 7: Documentation & Deployment | 8 hours | Day 15 | Day 15 |

**Total: 126 hours (15.75 working days)**

---

## Next Steps

1. **Review this document** with stakeholders
2. **Approve category prefix mapping** (Engine=E, Brakes=B, etc.)
3. **Set inspection fee amount** (default: 150 SAR)
4. **Schedule implementation** start date
5. **Prepare staging environment**
6. **Begin Phase 1** - Database Schema Updates

---

## Contact & Support

For questions or issues during implementation, refer to:
- Technical Lead: [Name]
- Project Manager: [Name]
- Database Admin: [Name]

---

**Document Version:** 1.0
**Last Updated:** 2025-11-14
**Status:** Ready for Implementation
