# TeraMotors - Feature #2: Customer Portal
**Implementation Plan**
**Date:** December 6, 2025

## Executive Summary

**Goal:** Provide customers with self-service access to view appointments, approve estimates, track repair status, and make payments online.

**Business Impact:**
- 40% reduction in customer service calls
- 25% increase in estimate approval rates
- Faster payment collection
- Improved customer satisfaction
- Competitive parity with 70% of industry leaders

**Timeline:** 6-8 weeks
**Complexity:** High
**Dependencies:** Feature #1 (Online Booking) recommended but not required

---

## What Customers Can Do

### 1. **View Appointments**
- See all upcoming and past appointments
- View appointment details (service, date, time, mechanic)
- See appointment status in real-time
- Receive status change notifications

### 2. **Track Repair Status**
- Live job card status (pending → in-progress → completed)
- See mechanic assigned to job
- View photos uploaded by mechanic (before/after)
- Real-time progress updates via Socket.io
- Estimated completion time

### 3. **Approve/Reject Estimates**
- View detailed estimates with line items
- See service breakdown (labor + parts)
- Approve or request changes
- Digital signature for approval
- Automatic conversion to job card on approval

### 4. **Make Payments**
- Pay invoices online (credit card, Apple Pay, Google Pay)
- View payment history
- Download receipts/invoices
- Set up payment plans (if BNPL enabled)
- Automatic receipt via email/WhatsApp

### 5. **Manage Vehicles**
- View all registered vehicles
- See service history per vehicle
- Add new vehicles
- Update vehicle information
- Track mileage and maintenance schedules

### 6. **Communication**
- Two-way messaging with shop
- Receive notifications (WhatsApp, Email, SMS, Push)
- Schedule callbacks
- Submit service requests

---

## Architecture Design

### URL Structure
```
https://teramotors.com/portal/{tenant-slug}
```

Examples:
- `https://teramotors.com/portal/riyadh-auto-care`
- Customer logs in with email/phone + OTP (passwordless auth)

### Authentication Strategy

**Passwordless OTP Authentication:**
1. Customer enters email or phone number
2. System sends OTP (6-digit code) via email/SMS/WhatsApp
3. Customer enters OTP to log in
4. Session valid for 30 days (remember me option)
5. No password required (better UX, more secure)

**Why Passwordless?**
- Easier for customers (no password to remember)
- More secure (no password to leak)
- Industry standard for customer portals (AutoLeap, Shopmonkey)
- Works globally (email/phone universal)

---

## Files to Create (32 files)

### Portal Pages
- `/app/(portal)/portal/[slug]/page.tsx` - Portal landing/redirect
- `/app/(portal)/portal/[slug]/login/page.tsx` - OTP login
- `/app/(portal)/portal/[slug]/dashboard/page.tsx` - Customer dashboard
- `/app/(portal)/portal/[slug]/appointments/page.tsx` - Appointments list
- `/app/(portal)/portal/[slug]/appointments/[id]/page.tsx` - Appointment details
- `/app/(portal)/portal/[slug]/jobs/page.tsx` - Job cards list
- `/app/(portal)/portal/[slug]/jobs/[id]/page.tsx` - Job card details (live tracking)
- `/app/(portal)/portal/[slug]/estimates/page.tsx` - Estimates list
- `/app/(portal)/portal/[slug]/estimates/[id]/page.tsx` - Estimate approval
- `/app/(portal)/portal/[slug]/invoices/page.tsx` - Invoices list
- `/app/(portal)/portal/[slug]/invoices/[id]/page.tsx` - Invoice details
- `/app/(portal)/portal/[slug]/vehicles/page.tsx` - Vehicles list
- `/app/(portal)/portal/[slug]/vehicles/[id]/page.tsx` - Vehicle history
- `/app/(portal)/portal/[slug]/messages/page.tsx` - Two-way messaging
- `/app/(portal)/portal/[slug]/settings/page.tsx` - Customer settings

### Portal Components
- `/components/portal/PortalNavigation.tsx` - Portal sidebar/nav
- `/components/portal/DashboardStats.tsx` - Customer stats widget
- `/components/portal/AppointmentCard.tsx` - Appointment display card
- `/components/portal/JobCardTracker.tsx` - Live job tracking UI
- `/components/portal/EstimateApproval.tsx` - Estimate approval widget
- `/components/portal/InvoiceViewer.tsx` - Invoice display
- `/components/portal/PaymentForm.tsx` - Payment form (Stripe/Tabby)
- `/components/portal/VehicleCard.tsx` - Vehicle display card
- `/components/portal/ServiceHistoryTimeline.tsx` - Timeline view
- `/components/portal/MessageThread.tsx` - Chat/messaging UI
- `/components/portal/NotificationBell.tsx` - Notifications dropdown

### Authentication
- `/app/api/portal/auth/send-otp/route.ts` - Send OTP to email/phone
- `/app/api/portal/auth/verify-otp/route.ts` - Verify OTP and create session
- `/app/api/portal/auth/logout/route.ts` - End session
- `/lib/auth/otp-service.ts` - OTP generation and validation
- `/lib/auth/portal-session.ts` - Customer session management

### API Routes (Customer-Scoped)
- `/app/api/portal/[slug]/customer/profile/route.ts` - Get/update customer info
- `/app/api/portal/[slug]/appointments/route.ts` - List customer appointments
- `/app/api/portal/[slug]/appointments/[id]/route.ts` - Get appointment details
- `/app/api/portal/[slug]/jobs/route.ts` - List customer job cards
- `/app/api/portal/[slug]/jobs/[id]/route.ts` - Get job card with real-time status
- `/app/api/portal/[slug]/estimates/route.ts` - List customer estimates
- `/app/api/portal/[slug]/estimates/[id]/approve/route.ts` - Approve estimate
- `/app/api/portal/[slug]/estimates/[id]/reject/route.ts` - Reject estimate
- `/app/api/portal/[slug]/invoices/route.ts` - List customer invoices
- `/app/api/portal/[slug]/invoices/[id]/route.ts` - Get invoice details
- `/app/api/portal/[slug]/invoices/[id]/pay/route.ts` - Process payment
- `/app/api/portal/[slug]/vehicles/route.ts` - List customer vehicles
- `/app/api/portal/[slug]/vehicles/[id]/history/route.ts` - Get vehicle service history
- `/app/api/portal/[slug]/messages/route.ts` - Get/send messages
- `/app/api/portal/[slug]/notifications/route.ts` - Get notifications

### Services
- `/lib/services/OTPService.ts` - OTP generation, sending, validation
- `/lib/services/CustomerNotificationService.ts` - Customer notifications
- `/lib/services/PaymentService.ts` - Payment processing (Stripe/Tabby)
- `/lib/services/EstimateApprovalService.ts` - Estimate approval workflow

### Email Templates
- `/lib/email-templates/otp-login.html` - OTP email
- `/lib/email-templates/estimate-ready.html` - Estimate notification
- `/lib/email-templates/job-completed.html` - Job completion
- `/lib/email-templates/invoice-ready.html` - Invoice notification
- `/lib/email-templates/payment-receipt.html` - Payment confirmation

### i18n
- `/lib/locales/en/portal.json` - Portal English translations
- `/lib/locales/ar/portal.json` - Portal Arabic translations

### Tests
- `/tests/portal/otp-auth.test.ts` - OTP authentication tests
- `/tests/portal/estimate-approval.test.ts` - Estimate approval flow
- `/tests/portal/payment-flow.test.ts` - Payment processing tests

---

## Files to Modify (6 files)

### 1. Customer Model
**File:** `/lib/models/Customer.ts`

**Add fields:**
```typescript
portalAccess: {
  enabled: boolean;
  lastLogin?: Date;
  otpSecret?: string; // For OTP generation
  sessionToken?: string;
  sessionExpiry?: Date;
};
preferences: {
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  language: 'ar' | 'en';
  timezone: string;
};
```

### 2. Estimate Model
**File:** `/lib/models/Estimate.ts`

**Add fields:**
```typescript
approvalStatus: 'pending' | 'approved' | 'rejected' | 'changes_requested';
approvedBy?: 'customer' | 'admin';
approvedAt?: Date;
customerSignature?: string; // Base64 image
rejectionReason?: string;
customerNotes?: string;
viewedByCustomer: boolean;
viewedAt?: Date;
```

### 3. JobCard Model
**File:** `/lib/models/JobCard.ts`

**Add fields:**
```typescript
customerVisibility: {
  visible: boolean; // Show to customer in portal
  hidePhotos: boolean; // Hide internal photos
  hidePricing: boolean; // Hide pricing breakdown
};
estimatedCompletionTime?: Date;
customerNotified: boolean;
lastCustomerView?: Date;
```

### 4. Invoice Model
**File:** `/lib/models/Invoice.ts`

**Add fields:**
```typescript
portalPayment: {
  allowOnlinePayment: boolean;
  paymentUrl?: string; // Stripe checkout URL
  paidOnline: boolean;
  paymentProvider?: 'stripe' | 'tabby' | 'card';
  transactionId?: string;
};
viewedByCustomer: boolean;
viewedAt?: Date;
remindersSent: number;
```

### 5. Tenant Model
**File:** `/lib/models/Tenant.ts`

**Add fields:**
```typescript
portalSettings: {
  enabled: boolean;
  allowOnlinePayments: boolean;
  allowEstimateApproval: boolean;
  allowMessaging: boolean;
  requireEstimateApproval: boolean; // Jobs can't start without approval
  logo?: string;
  primaryColor?: string;
  welcomeMessage?: string;
};
```

### 6. Landing Page
**File:** `/app/(marketing)/page.tsx`

**Add "Customer Portal" link to navigation and footer**

---

## Database Schema Updates

### New Model: CustomerNotification

**File:** `/lib/models/CustomerNotification.ts`

```typescript
export interface ICustomerNotification extends Document {
  tenantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  type: 'appointment' | 'estimate' | 'job_update' | 'invoice' | 'payment' | 'message';
  title: string;
  message: string;
  link?: string; // Deep link to portal page
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high';
  channels: ('email' | 'sms' | 'whatsapp' | 'push')[];
  sentAt?: Date;
  deliveryStatus: {
    email?: 'sent' | 'delivered' | 'failed';
    sms?: 'sent' | 'delivered' | 'failed';
    whatsapp?: 'sent' | 'delivered' | 'failed';
    push?: 'sent' | 'delivered' | 'failed';
  };
  createdAt: Date;
}
```

### New Model: CustomerMessage

**File:** `/lib/models/CustomerMessage.ts`

```typescript
export interface ICustomerMessage extends Document {
  tenantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  jobCardId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  sender: 'customer' | 'admin' | 'mechanic';
  senderUserId?: mongoose.Types.ObjectId; // If sender is admin/mechanic
  message: string;
  attachments?: string[]; // URLs to files
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}
```

---

## Key Features Implementation

### 1. OTP Authentication

**Flow:**
```
1. Customer enters email/phone → POST /api/portal/auth/send-otp
2. System generates 6-digit OTP (valid 10 minutes)
3. OTP sent via email/SMS/WhatsApp
4. Customer enters OTP → POST /api/portal/auth/verify-otp
5. If valid, create session token (JWT)
6. Session stored in httpOnly cookie (30 days if "remember me")
7. Redirect to portal dashboard
```

**OTP Service:**
```typescript
// /lib/auth/otp-service.ts

export async function generateOTP(customer: Customer): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in database (hashed)
  customer.portalAccess.otpSecret = await bcrypt.hash(otp, 10);
  customer.portalAccess.otpExpiry = expiresAt;
  await customer.save();

  return otp;
}

export async function sendOTP(customer: Customer, otp: string) {
  const message = customer.language === 'ar'
    ? `رمز التحقق الخاص بك: ${otp}\nصالح لمدة 10 دقائق`
    : `Your verification code: ${otp}\nValid for 10 minutes`;

  // Send via preferred channel
  if (customer.preferences.notifications.whatsapp && customer.whatsappEnabled) {
    await sendWhatsApp(customer.phone, message);
  } else if (customer.preferences.notifications.sms) {
    await sendSMS(customer.phone, message);
  }

  if (customer.preferences.notifications.email) {
    await sendEmail({
      to: customer.email,
      subject: 'Your Login Code',
      template: 'otp-login',
      data: { otp, customerName: customer.firstName }
    });
  }
}

export async function verifyOTP(customer: Customer, otp: string): Promise<boolean> {
  if (!customer.portalAccess.otpSecret || !customer.portalAccess.otpExpiry) {
    return false;
  }

  // Check expiry
  if (new Date() > customer.portalAccess.otpExpiry) {
    return false;
  }

  // Verify OTP
  const valid = await bcrypt.compare(otp, customer.portalAccess.otpSecret);

  if (valid) {
    // Clear OTP after successful verification
    customer.portalAccess.otpSecret = undefined;
    customer.portalAccess.otpExpiry = undefined;
    customer.portalAccess.lastLogin = new Date();
    await customer.save();
  }

  return valid;
}
```

---

### 2. Live Job Tracking

**Component:** `JobCardTracker.tsx`

**Features:**
- Real-time status updates via Socket.io
- Progress bar (0% → 25% → 50% → 75% → 100%)
- Timeline of status changes
- Photos uploaded by mechanic
- Estimated completion time
- Current mechanic assigned

**UI:**
```tsx
<div className="job-tracker">
  {/* Progress Bar */}
  <div className="progress-bar">
    <div className="progress" style={{ width: `${progress}%` }} />
  </div>

  {/* Status */}
  <div className="status">
    <StatusBadge status={jobCard.status} />
    {jobCard.estimatedCompletionTime && (
      <p>Estimated completion: {formatTime(jobCard.estimatedCompletionTime)}</p>
    )}
  </div>

  {/* Timeline */}
  <div className="timeline">
    <TimelineItem
      icon={<CheckCircle />}
      title="Job Created"
      time={jobCard.createdAt}
      completed
    />
    <TimelineItem
      icon={<Wrench />}
      title="Work in Progress"
      time={jobCard.actualStartTime}
      completed={jobCard.status !== 'pending'}
      active={jobCard.status === 'in-progress'}
    />
    <TimelineItem
      icon={<CheckCircle />}
      title="Completed"
      time={jobCard.actualEndTime}
      completed={jobCard.status === 'completed'}
    />
  </div>

  {/* Photos */}
  {!jobCard.customerVisibility.hidePhotos && jobCard.photos.length > 0 && (
    <div className="photos-grid">
      {jobCard.photos.map(photo => (
        <img key={photo} src={photo} alt="Work progress" onClick={() => openLightbox(photo)} />
      ))}
    </div>
  )}

  {/* Mechanic */}
  <div className="mechanic-info">
    <p>Your mechanic: <strong>{mechanic.fullName}</strong></p>
    <button onClick={handleMessage}>Send Message</button>
  </div>
</div>
```

**Socket.io Integration:**
```typescript
// Real-time updates
useEffect(() => {
  socket.on(`job-card-updated:${jobCardId}`, (updatedJobCard) => {
    setJobCard(updatedJobCard);
    calculateProgress(updatedJobCard);

    // Show notification
    toast.success('Job status updated!');
  });

  return () => socket.off(`job-card-updated:${jobCardId}`);
}, [jobCardId]);
```

---

### 3. Estimate Approval Flow

**Component:** `EstimateApproval.tsx`

**Features:**
- View estimate line items (services + parts)
- See pricing breakdown
- Digital signature pad
- Approve or request changes
- Add notes for shop
- Automatic conversion to job card on approval

**UI:**
```tsx
<div className="estimate-approval">
  {/* Header */}
  <div className="header">
    <h2>Estimate #{estimate.estimateNumber}</h2>
    <StatusBadge status={estimate.approvalStatus} />
  </div>

  {/* Line Items */}
  <div className="line-items">
    <h3>Services</h3>
    {estimate.services.map(service => (
      <div key={service._id} className="line-item">
        <div>
          <p className="font-semibold">{service.name}</p>
          <p className="text-sm text-gray-600">{service.description}</p>
        </div>
        <p className="font-semibold">{service.totalCost} SAR</p>
      </div>
    ))}

    <h3>Parts</h3>
    {estimate.parts.map(part => (
      <div key={part._id} className="line-item">
        <div>
          <p className="font-semibold">{part.name}</p>
          <p className="text-sm text-gray-600">Qty: {part.quantity}</p>
        </div>
        <p className="font-semibold">{part.totalCost} SAR</p>
      </div>
    ))}
  </div>

  {/* Total */}
  <div className="totals">
    <div className="total-row">
      <span>Subtotal</span>
      <span>{estimate.subtotal} SAR</span>
    </div>
    <div className="total-row">
      <span>VAT (15%)</span>
      <span>{estimate.tax} SAR</span>
    </div>
    <div className="total-row font-bold">
      <span>Total</span>
      <span>{estimate.total} SAR</span>
    </div>
  </div>

  {/* Actions */}
  {estimate.approvalStatus === 'pending' && (
    <div className="actions">
      <div className="signature-section">
        <label>Your Signature (Required)</label>
        <SignaturePad
          ref={signaturePadRef}
          onEnd={() => setSignature(signaturePadRef.current.toDataURL())}
        />
        <button onClick={() => signaturePadRef.current.clear()}>Clear</button>
      </div>

      <textarea
        placeholder="Notes for the shop (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="buttons">
        <button
          onClick={handleApprove}
          disabled={!signature}
          className="btn-approve"
        >
          Approve & Start Work
        </button>
        <button onClick={handleRequestChanges} className="btn-secondary">
          Request Changes
        </button>
      </div>
    </div>
  )}

  {estimate.approvalStatus === 'approved' && (
    <div className="approved-message">
      <CheckCircle className="text-green-500" />
      <p>You approved this estimate on {formatDate(estimate.approvedAt)}</p>
      <Link href={`/portal/${tenantSlug}/jobs`}>View Job Progress →</Link>
    </div>
  )}
</div>
```

**Approval API:**
```typescript
// POST /api/portal/[slug]/estimates/[id]/approve

export const POST = async (req: Request, { params }) => {
  const { signature, notes } = await req.json();
  const customerId = req.session.customerId; // From session

  const estimate = await Estimate.findById(params.id);

  // Verify customer owns this estimate
  if (estimate.customerId.toString() !== customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Update estimate
  estimate.approvalStatus = 'approved';
  estimate.approvedBy = 'customer';
  estimate.approvedAt = new Date();
  estimate.customerSignature = signature;
  estimate.customerNotes = notes;
  await estimate.save();

  // Auto-create job card
  const jobCard = await JobCard.create({
    tenantId: estimate.tenantId,
    customerId: estimate.customerId,
    vehicleId: estimate.vehicleId,
    status: 'pending',
    services: estimate.services.map(s => ({
      serviceId: s.serviceId,
      quantity: s.quantity,
      laborHours: s.laborHours,
      laborRate: s.laborRate
    })),
    partsUsed: estimate.parts.map(p => ({
      partId: p.partId,
      quantity: p.quantity,
      cost: p.unitCost
    })),
    source: 'customer',
    inspectionFeeDeducted: estimate.inspectionFee || 0
  });

  // Notify shop admin
  await notifyShopAdmin({
    type: 'estimate_approved',
    estimateId: estimate._id,
    jobCardId: jobCard._id,
    customerName: `${customer.firstName} ${customer.lastName}`
  });

  return NextResponse.json({ success: true, jobCard });
};
```

---

### 4. Payment Processing

**Component:** `PaymentForm.tsx`

**Payment Methods:**
- **Stripe** (credit cards, Apple Pay, Google Pay)
- **Tabby** (buy now, pay later for GCC region)
- **Card** (direct card processing)

**Flow:**
```
1. Customer views invoice → Click "Pay Now"
2. Redirect to Stripe Checkout or Tabby
3. Customer completes payment
4. Webhook receives payment confirmation
5. Update invoice status to "paid"
6. Send receipt via email/WhatsApp
7. Update customer portal to show payment
```

**Stripe Integration:**
```typescript
// /lib/services/PaymentService.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(invoice: Invoice) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(invoice.totalAmount * 100), // Convert to cents
    currency: 'sar',
    metadata: {
      invoiceId: invoice._id.toString(),
      customerId: invoice.customerId.toString(),
      tenantId: invoice.tenantId.toString()
    },
    automatic_payment_methods: {
      enabled: true
    }
  });

  // Store payment URL
  invoice.portalPayment.paymentUrl = paymentIntent.client_secret;
  await invoice.save();

  return paymentIntent;
}

export async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata.invoiceId;

  const invoice = await Invoice.findById(invoiceId);
  invoice.status = 'paid';
  invoice.paidAmount = paymentIntent.amount / 100;
  invoice.paymentMethod = 'card';
  invoice.paymentDate = new Date();
  invoice.portalPayment.paidOnline = true;
  invoice.portalPayment.paymentProvider = 'stripe';
  invoice.portalPayment.transactionId = paymentIntent.id;
  await invoice.save();

  // Create payment record
  await Payment.create({
    tenantId: invoice.tenantId,
    invoiceId: invoice._id,
    customerId: invoice.customerId,
    amount: invoice.totalAmount,
    paymentMethod: 'card',
    status: 'completed',
    reference: paymentIntent.id,
    processedBy: null // Customer payment
  });

  // Send receipt
  await sendPaymentReceipt(invoice);

  // Notify shop
  await notifyShopAdmin({
    type: 'payment_received',
    invoiceId: invoice._id,
    amount: invoice.totalAmount
  });
}
```

---

### 5. Notifications System

**Types of Notifications:**
1. **Appointment Reminders** (24h before, 1h before)
2. **Estimate Ready** (new estimate available)
3. **Job Status Updates** (started, in-progress, completed)
4. **Invoice Ready** (new invoice)
5. **Payment Confirmation** (payment received)
6. **Messages** (new message from shop)

**Channels:**
- In-app (portal bell icon)
- Email
- SMS
- WhatsApp
- Push notifications (future)

**Service:**
```typescript
// /lib/services/CustomerNotificationService.ts

export async function notifyCustomer({
  customer,
  type,
  title,
  message,
  link,
  channels = ['email', 'whatsapp']
}: NotificationParams) {
  // Create notification record
  const notification = await CustomerNotification.create({
    tenantId: customer.tenantId,
    customerId: customer._id,
    type,
    title,
    message,
    link,
    read: false,
    priority: getPriority(type),
    channels
  });

  // Send via enabled channels
  if (channels.includes('email') && customer.preferences.notifications.email) {
    const sent = await sendEmail({
      to: customer.email,
      subject: title,
      template: getTemplate(type),
      data: { customer, message, link }
    });
    notification.deliveryStatus.email = sent ? 'sent' : 'failed';
  }

  if (channels.includes('whatsapp') && customer.preferences.notifications.whatsapp) {
    const sent = await sendWhatsApp(customer.phone, message);
    notification.deliveryStatus.whatsapp = sent ? 'sent' : 'failed';
  }

  if (channels.includes('sms') && customer.preferences.notifications.sms) {
    const sent = await sendSMS(customer.phone, message);
    notification.deliveryStatus.sms = sent ? 'sent' : 'failed';
  }

  await notification.save();

  // Emit Socket.io event for real-time in-app notification
  socket.to(`customer:${customer._id}`).emit('new-notification', notification);

  return notification;
}
```

---

## Dashboard Design

### Customer Dashboard Widgets:

**1. Upcoming Appointments**
```
┌─────────────────────────────────────────┐
│  Upcoming Appointments                   │
├─────────────────────────────────────────┤
│  📅  Oil Change                          │
│      Jan 20, 2026 at 10:30 AM           │
│      Mechanic: Ahmed                     │
│      [View Details]                      │
├─────────────────────────────────────────┤
│  📅  Brake Inspection                    │
│      Jan 25, 2026 at 2:00 PM            │
│      Mechanic: Mohammed                  │
│      [View Details]                      │
└─────────────────────────────────────────┘
```

**2. Active Jobs**
```
┌─────────────────────────────────────────┐
│  Active Jobs                             │
├─────────────────────────────────────────┤
│  🔧  Job #JC-1234                        │
│      Status: In Progress (75%)           │
│      Toyota Camry 2020                   │
│      Est. Completion: Today 5:00 PM      │
│      [Track Progress]                    │
└─────────────────────────────────────────┘
```

**3. Pending Estimates**
```
┌─────────────────────────────────────────┐
│  Pending Estimates                       │
├─────────────────────────────────────────┤
│  📄  Estimate #EST-5678                  │
│      Honda Accord 2019                   │
│      Total: 1,500 SAR                    │
│      [Review & Approve] [Request Changes]│
└─────────────────────────────────────────┘
```

**4. Unpaid Invoices**
```
┌─────────────────────────────────────────┐
│  Unpaid Invoices                         │
├─────────────────────────────────────────┤
│  💳  Invoice #INV-9012                   │
│      Due: Jan 18, 2026                   │
│      Amount: 850 SAR                     │
│      [Pay Now]                           │
└─────────────────────────────────────────┘
```

**5. My Vehicles**
```
┌─────────────────────────────────────────┐
│  My Vehicles (2)                         │
├─────────────────────────────────────────┤
│  🚗  Toyota Camry 2020                   │
│      Next Service: Feb 15, 2026          │
│      [View History]                      │
├─────────────────────────────────────────┤
│  🚗  Honda Accord 2019                   │
│      Next Service: Mar 10, 2026          │
│      [View History]                      │
└─────────────────────────────────────────┘
```

---

## Mobile Responsiveness

**Portal is mobile-first:**
- 70%+ of customers use mobile devices
- Bottom navigation for easy thumb access
- Swipe gestures for actions
- Touch-optimized buttons (min 44px)
- Progressive Web App (PWA) support
- Offline viewing of past invoices/appointments

---

## Timeline (6-8 weeks)

### Week 1-2: Authentication & Portal Foundation
- OTP authentication system
- Customer session management
- Portal layout and navigation
- Database schema updates
- Migration scripts

### Week 3-4: Core Features
- Appointments view
- Job card tracking (real-time)
- Vehicle management
- Notifications system

### Week 5: Estimate Approval
- Estimate viewer
- Signature pad integration
- Approval/rejection workflow
- Auto job card creation

### Week 6: Payments
- Stripe integration
- Tabby integration (BNPL)
- Payment form UI
- Webhook handling
- Receipt generation

### Week 7: Messaging & Polish
- Two-way messaging
- Customer settings
- Mobile optimization
- Arabic language
- Performance optimization

### Week 8: Testing & Launch
- End-to-end testing
- Security audit
- Mobile testing
- Pilot launch
- Monitor & iterate

---

## Success Metrics

### Week 1 (Launch):
- 50+ portal registrations
- 10+ estimate approvals via portal
- 0 authentication errors

### Month 1:
- 40% reduction in customer service calls
- 25% increase in estimate approval rate
- 20+ online payments processed
- 4.5+ customer satisfaction rating

### Month 3:
- 60% of customers using portal
- 50% of estimates approved via portal
- 30% of invoices paid online
- 50%+ reduction in phone calls

---

## Security Considerations

### Authentication:
- OTP valid for 10 minutes only
- Rate limiting on OTP requests (3 per hour per customer)
- Session tokens expire after 30 days
- httpOnly cookies (no XSS)
- IP logging for suspicious activity

### Data Privacy:
- Customers only see their own data
- Tenant isolation enforced at API level
- No cross-customer data leakage
- GDPR compliance (data export/delete)

### Payment Security:
- PCI-DSS compliant (Stripe handles cards)
- No card data stored in database
- Webhook signature verification
- SSL/TLS encryption required

---

## Integration with Feature #1 (Online Booking)

**Customers who book online automatically get portal access:**
1. After booking, customer receives OTP to verify email/phone
2. OTP verification creates portal account
3. Customer can view upcoming appointment in portal
4. Seamless experience from booking to tracking

---

## Future Enhancements (Post-Launch)

1. **Mobile App** (iOS/Android native)
2. **Push Notifications**
3. **Live Video Call** with mechanic
4. **Service Subscription Plans** (monthly packages)
5. **Referral Program** (invite friends, get discounts)
6. **Loyalty Points** system
7. **AI Chatbot** for FAQs
8. **Service Recommendations** based on vehicle history

---

**End of Feature #2 Plan**

After this, proceed to **Feature #3: QuickBooks/Xero Integration** for automated accounting sync.
