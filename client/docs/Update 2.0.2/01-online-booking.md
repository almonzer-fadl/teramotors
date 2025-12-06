# TeraMotors - Feature #1: Online Booking System
**Implementation Plan**
**Date:** December 6, 2025

## Executive Summary

**Goal:** Enable customers to book appointments 24/7 without requiring login

**Business Impact:**
- 20-30% revenue increase (24/7 availability)
- 50% reduction in phone calls  
- Competitive parity with 85% of industry

**Timeline:** 4-6 weeks | **Complexity:** Medium

---

## Architecture

### URL Structure
```
https://teramotors.com/book/{tenant-slug}
```

### Booking Flow
1. Select Service
2. Choose Date & Time
3. Enter Customer & Vehicle Info
4. Confirmation

---

## Files to Create (21 files)

### Pages & Components
- `/app/(marketing)/book/[slug]/page.tsx`
- `/components/booking/BookingWizard.tsx`
- `/components/booking/ServiceSelector.tsx`
- `/components/booking/DateTimePicker.tsx`
- `/components/booking/CustomerForm.tsx`
- `/components/booking/BookingConfirmation.tsx`

### API Routes
- `/app/api/public/tenants/[slug]/booking-info/route.ts`
- `/app/api/public/tenants/[slug]/available-slots/route.ts`
- `/app/api/public/tenants/[slug]/book/route.ts`
- `/app/(dashboard)/settings/booking/page.tsx`

### Services
- `/lib/services/BookingNotificationService.ts`
- `/lib/services/SlotCalculator.ts`
- `/lib/validation/booking.ts`
- `/lib/email-templates/booking-confirmation.html`

### Scripts
- `/scripts/migrate-booking-settings.js`
- `/scripts/add-booking-source.js`
- `/scripts/generate-slugs.js`

### i18n
- `/lib/locales/en/booking.json`
- `/lib/locales/ar/booking.json`

### Tests
- `/tests/booking/slot-calculator.test.ts`
- `/tests/booking/booking-flow.test.ts`

---

## Files to Modify (4 files)

### 1. Tenant Model
**Add bookingSettings:**
```typescript
bookingSettings: {
  enabled: boolean;
  workingHours: { monday: {start, end, closed}, ... };
  appointmentDuration: number;
  bufferTime: number;
  advanceBookingDays: number;
  requireApproval: boolean;
}
```

### 2. Appointment Model  
**Add fields:**
```typescript
source: 'admin' | 'customer' | 'api' | 'phone';
confirmationNumber: string; // APT-XXXX
requiresApproval: boolean;
```

### 3. Service Model
**Add fields:**
```typescript
estimatedDuration: number;
bookingEnabled: boolean;
```

### 4. Landing Page
**Add booking CTA button**

---

## Timeline (6 weeks)

**Week 1-2:** Database & API  
**Week 3-4:** Frontend Components  
**Week 5:** Public Booking Page  
**Week 6:** Notifications & Admin

---

## Success Metrics

**Month 1:**
- 100+ online bookings
- 15%+ conversion rate
- 20%+ phone call reduction

---

Ready to implement!
