# TeraMotors - Feature #4: Two-Way SMS Platform
**Implementation Plan**
**Date:** December 6, 2025

## Executive Summary

**Goal:** Replace WhatsApp-only messaging with professional two-way SMS platform for global customer communication.

**Business Impact:**
- 50% reduction in no-shows (automated reminders)
- 30% faster estimate approvals
- Global reach (SMS works everywhere, WhatsApp doesn't)
- Professional communication channel
- Competitive parity with 80% of industry leaders

**Timeline:** 3-4 weeks
**Complexity:** Medium
**Dependencies:** None

---

## Why Replace WhatsApp?

**Current Limitation:** WhatsApp (UltraMsg) only
- ❌ Doesn't work in USA (most shops use SMS)
- ❌ Requires customers to have WhatsApp installed
- ❌ Less professional than SMS
- ❌ Limited to personal phone numbers
- ❌ No shortcode/toll-free number support

**SMS Advantages:**
- ✅ Works globally (every phone has SMS)
- ✅ Professional toll-free/shortcode numbers
- ✅ Higher delivery rates (99%+)
- ✅ Two-way conversations
- ✅ Industry standard in USA/Europe/global markets
- ✅ Better analytics and tracking

---

## SMS Providers Comparison

### Recommended: Twilio

**Why Twilio:**
- Industry leader (most reliable)
- Global coverage (180+ countries)
- Toll-free & shortcode support
- Two-way messaging
- 99.95% uptime
- Excellent documentation
- Reasonable pricing ($0.0079/SMS in USA)

**Pricing:**
- USA: $0.0079/SMS
- Saudi Arabia: $0.048/SMS
- Toll-free number: $2/month
- Shortcode: $1,000/month (enterprise only)

**Alternatives:**
1. **Vonage (Nexmo)** - Similar to Twilio, slightly cheaper
2. **MessageBird** - Good for Europe/Middle East
3. **Plivo** - Budget option, less features

---

## Architecture Design

### Multi-Channel Strategy

**Keep WhatsApp + Add SMS:**
```typescript
// Customer preferences
customer.preferences.notifications = {
  email: true,
  sms: true,        // NEW
  whatsapp: true,   // Keep existing
  push: false
};

// Send notification via preferred channel
if (customer.preferences.notifications.sms) {
  await sendSMS(customer.phone, message);
} else if (customer.preferences.notifications.whatsapp) {
  await sendWhatsApp(customer.phone, message);
}
```

**Benefits:**
- Gradual migration (don't break existing WhatsApp users)
- Customer choice (SMS or WhatsApp)
- Fallback mechanism (try SMS if WhatsApp fails)

---

## Files to Create (18 files)

### SMS Services
- `/lib/services/sms/TwilioService.ts` - Twilio API wrapper
- `/lib/services/sms/MessageBirdService.ts` - MessageBird wrapper (alternative)
- `/lib/services/sms/SMSService.ts` - Unified SMS interface
- `/lib/services/sms/TwoWayConversationService.ts` - Conversation threading
- `/lib/services/sms/SMSTemplateService.ts` - Message templates

### API Routes
- `/app/api/sms/send/route.ts` - Send SMS
- `/app/api/sms/conversations/route.ts` - List conversations
- `/app/api/sms/conversations/[customerId]/route.ts` - Customer thread
- `/app/api/sms/webhooks/twilio/route.ts` - Receive SMS (Twilio)
- `/app/api/sms/webhooks/messagebird/route.ts` - Receive SMS (MessageBird)

### Database Models
- `/lib/models/SMSMessage.ts` - SMS message log
- `/lib/models/SMSConversation.ts` - Conversation threads
- `/lib/models/SMSTemplate.ts` - Message templates

### Settings Pages
- `/app/(dashboard)/settings/sms/page.tsx` - SMS settings UI
- `/app/(dashboard)/sms/conversations/page.tsx` - SMS inbox

### Components
- `/components/sms/ConversationList.tsx` - Inbox list
- `/components/sms/MessageThread.tsx` - Conversation thread
- `/components/sms/SendMessageForm.tsx` - Send SMS form
- `/components/sms/TemplateSelector.tsx` - Select template

---

## Files to Modify (4 files)

### 1. Tenant Model
**File:** `/lib/models/Tenant.ts`

**Add:**
```typescript
integrations: {
  // ... existing smtp, whatsapp ...

  sms?: {
    provider: 'twilio' | 'messagebird' | 'vonage';
    enabled: boolean;

    // Twilio credentials
    twilio?: {
      accountSid: string;
      authToken: string;
      fromNumber: string; // Toll-free or shortcode
      messagingServiceSid?: string;
    };

    // MessageBird credentials
    messagebird?: {
      apiKey: string;
      fromNumber: string;
    };

    // Settings
    autoRespond: boolean;
    businessHours: {
      enabled: boolean;
      start: string; // "09:00"
      end: string; // "18:00"
    };
  };
};
```

### 2. Customer Model
**File:** `/lib/models/Customer.ts`

**Update preferences:**
```typescript
preferences: {
  notifications: {
    email: boolean;
    sms: boolean;      // NEW
    whatsapp: boolean;
    push: boolean;
  };
  preferredChannel: 'email' | 'sms' | 'whatsapp'; // NEW
  language: 'ar' | 'en';
  timezone: string;
};

// Track opt-outs
communications: {
  smsOptOut: boolean;
  smsOptOutDate?: Date;
  whatsappOptOut: boolean;
};
```

### 3. Notification Service
**File:** `/lib/services/CustomerNotificationService.ts`

**Add SMS channel:**
```typescript
export async function notifyCustomer({
  customer,
  type,
  message,
  channels = ['sms', 'email', 'whatsapp']
}) {
  // Try SMS first (if preferred)
  if (channels.includes('sms') && customer.preferences.notifications.sms) {
    const sent = await sendSMS(customer.phone, message);
    if (sent) return; // Success, don't send via other channels
  }

  // Fallback to WhatsApp
  if (channels.includes('whatsapp') && customer.preferences.notifications.whatsapp) {
    await sendWhatsApp(customer.phone, message);
  }

  // Fallback to Email
  if (channels.includes('email')) {
    await sendEmail(customer.email, message);
  }
}
```

### 4. Settings Navigation
**File:** `/app/(dashboard)/settings/layout.tsx`

**Add "SMS" tab**

---

## Database Schema

### SMSMessage Model

```typescript
export interface ISMSMessage extends Document {
  tenantId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;

  direction: 'inbound' | 'outbound';
  from: string; // Phone number
  to: string; // Phone number

  message: string;
  template?: string; // Template used (if any)

  provider: 'twilio' | 'messagebird';
  externalId: string; // Twilio message SID

  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;

  segments: number; // SMS segments (1 SMS = 160 chars)
  cost?: number; // Cost in USD

  // Metadata
  relatedTo?: {
    type: 'appointment' | 'estimate' | 'job_card' | 'invoice';
    id: mongoose.Types.ObjectId;
  };

  sentBy?: mongoose.Types.ObjectId; // User who sent (if manual)

  createdAt: Date;
  deliveredAt?: Date;
}
```

### SMSConversation Model

```typescript
export interface ISMSConversation extends Document {
  tenantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerPhone: string;

  lastMessageAt: Date;
  lastMessage: string;
  lastMessageDirection: 'inbound' | 'outbound';

  unreadCount: number; // Unread by admin
  status: 'active' | 'archived';

  assignedTo?: mongoose.Types.ObjectId; // User handling conversation

  messages: mongoose.Types.ObjectId[]; // References to SMSMessage

  createdAt: Date;
  updatedAt: Date;
}
```

### SMSTemplate Model

```typescript
export interface ISMSTemplate extends Document {
  tenantId: mongoose.Types.ObjectId;

  name: string;
  category: 'appointment_reminder' | 'estimate_ready' | 'job_complete' | 'payment_reminder' | 'custom';

  message: string; // Template with variables: "Hi {{firstName}}, your appointment is on {{date}}"
  messageAr?: string; // Arabic version

  variables: string[]; // ['firstName', 'date', 'time']

  isActive: boolean;
  usageCount: number;

  createdAt: Date;
  updatedAt: Date;
}
```

---

## Twilio Integration

### Setup

**1. Create Twilio Account:**
- Sign up at https://www.twilio.com
- Verify your identity (required for production)
- Purchase phone number (toll-free recommended: +1-800-XXX-XXXX)

**2. Get Credentials:**
- Account SID: `AC...`
- Auth Token: `...`
- Phone Number: `+18001234567`

**3. Environment Variables:**
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+18001234567
```

### Twilio Service

**File:** `/lib/services/sms/TwilioService.ts`

```typescript
import twilio from 'twilio';

export class TwilioService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  async sendSMS(to: string, message: string) {
    try {
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: this.formatPhoneNumber(to),
        body: message,
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        segments: result.numSegments,
        cost: parseFloat(result.price || '0'),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  }

  async getMessageStatus(messageSid: string) {
    const message = await this.client.messages(messageSid).fetch();
    return {
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateUpdated: message.dateUpdated,
    };
  }

  private formatPhoneNumber(phone: string): string {
    // Ensure E.164 format: +[country code][number]
    if (!phone.startsWith('+')) {
      // Assume Saudi Arabia if no country code
      return `+966${phone.replace(/^0/, '')}`;
    }
    return phone;
  }
}
```

### Webhook Handler (Receive SMS)

**File:** `/app/api/sms/webhooks/twilio/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  // Verify Twilio signature (security)
  const signature = req.headers.get('x-twilio-signature');
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/sms/webhooks/twilio`;

  const params = Object.fromEntries(formData.entries());

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature!,
    url,
    params
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  // Extract message data
  const {
    MessageSid,
    From,
    To,
    Body,
    NumSegments,
  } = params;

  // Find customer by phone number
  const customer = await Customer.findOne({
    phone: From.replace('+', ''),
  });

  if (!customer) {
    // Unknown number - log and ignore
    console.log(`SMS from unknown number: ${From}`);
    return NextResponse.json({ message: 'OK' });
  }

  // Find or create conversation
  let conversation = await SMSConversation.findOne({
    tenantId: customer.tenantId,
    customerId: customer._id,
    status: 'active',
  });

  if (!conversation) {
    conversation = await SMSConversation.create({
      tenantId: customer.tenantId,
      customerId: customer._id,
      customerPhone: From,
      lastMessageAt: new Date(),
      lastMessage: Body,
      lastMessageDirection: 'inbound',
      unreadCount: 1,
      status: 'active',
    });
  } else {
    conversation.lastMessageAt = new Date();
    conversation.lastMessage = Body;
    conversation.lastMessageDirection = 'inbound';
    conversation.unreadCount += 1;
    await conversation.save();
  }

  // Create message record
  const smsMessage = await SMSMessage.create({
    tenantId: customer.tenantId,
    customerId: customer._id,
    conversationId: conversation._id,
    direction: 'inbound',
    from: From,
    to: To,
    message: Body,
    provider: 'twilio',
    externalId: MessageSid,
    status: 'delivered',
    segments: parseInt(NumSegments),
  });

  conversation.messages.push(smsMessage._id);
  await conversation.save();

  // Notify admin (Socket.io, email, or in-app notification)
  await notifyAdmin({
    type: 'new_sms',
    customerId: customer._id,
    customerName: `${customer.firstName} ${customer.lastName}`,
    message: Body,
  });

  // Auto-respond (if configured)
  const tenant = await Tenant.findById(customer.tenantId);
  if (tenant.integrations?.sms?.autoRespond) {
    await sendAutoReply(customer, conversation);
  }

  return NextResponse.json({ message: 'OK' });
}

async function sendAutoReply(customer: Customer, conversation: SMSConversation) {
  const tenant = await Tenant.findById(customer.tenantId);

  // Check business hours
  if (tenant.integrations?.sms?.businessHours?.enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const [startHour] = tenant.integrations.sms.businessHours.start.split(':').map(Number);
    const [endHour] = tenant.integrations.sms.businessHours.end.split(':').map(Number);

    if (currentHour < startHour || currentHour >= endHour) {
      // Outside business hours - send auto-reply
      const message = customer.language === 'ar'
        ? `شكراً لتواصلك معنا. ساعات العمل من ${tenant.integrations.sms.businessHours.start} إلى ${tenant.integrations.sms.businessHours.end}. سنرد عليك قريباً.`
        : `Thank you for contacting us. Our business hours are ${tenant.integrations.sms.businessHours.start} - ${tenant.integrations.sms.businessHours.end}. We'll respond shortly.`;

      await sendSMS(customer.phone, message);
    }
  }
}
```

---

## SMS Templates

### Pre-built Templates

**1. Appointment Reminder (24h before):**
```
EN: Hi {{firstName}}, reminder: your {{serviceName}} appointment is tomorrow at {{time}}. See you then!

AR: مرحباً {{firstName}}، تذكير: موعدك لـ {{serviceName}} غداً الساعة {{time}}. نراك قريباً!
```

**2. Appointment Reminder (1h before):**
```
EN: Hi {{firstName}}, your appointment is in 1 hour at {{shopName}}. Address: {{address}}

AR: مرحباً {{firstName}}، موعدك بعد ساعة واحدة في {{shopName}}. العنوان: {{address}}
```

**3. Estimate Ready:**
```
EN: Hi {{firstName}}, your estimate for {{vehicleName}} is ready. View it here: {{link}}

AR: مرحباً {{firstName}}، تقديرك لـ {{vehicleName}} جاهز. شاهده هنا: {{link}}
```

**4. Job Completed:**
```
EN: Good news! Your {{vehicleName}} is ready for pickup. Total: {{total}} SAR. {{shopName}}

AR: أخبار جيدة! سيارتك {{vehicleName}} جاهزة للاستلام. الإجمالي: {{total}} ريال. {{shopName}}
```

**5. Payment Reminder:**
```
EN: Reminder: Invoice #{{invoiceNumber}} ({{total}} SAR) is due {{dueDate}}. Pay online: {{paymentLink}}

AR: تذكير: فاتورة #{{invoiceNumber}} ({{total}} ريال) مستحقة في {{dueDate}}. ادفع أونلاين: {{paymentLink}}
```

**6. Payment Received:**
```
EN: Payment received! Thank you for your business. Receipt: {{receiptLink}}

AR: تم استلام الدفع! شكراً لك. الإيصال: {{receiptLink}}
```

### Template Variables

**Available variables:**
- `{{firstName}}`, `{{lastName}}` - Customer name
- `{{vehicleName}}` - e.g., "Toyota Camry 2020"
- `{{serviceName}}` - e.g., "Oil Change"
- `{{date}}`, `{{time}}` - Appointment date/time
- `{{shopName}}` - Tenant business name
- `{{address}}` - Shop address
- `{{total}}` - Invoice total
- `{{invoiceNumber}}` - Invoice #
- `{{dueDate}}` - Payment due date
- `{{link}}`, `{{paymentLink}}`, `{{receiptLink}}` - URLs

---

## SMS Inbox UI

### Conversations Page

**File:** `/app/(dashboard)/sms/conversations/page.tsx`

```tsx
export default function SMSConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="flex h-screen">
      {/* Conversation List (Left Sidebar) */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">SMS Inbox</h2>
          <input
            type="text"
            placeholder="Search conversations..."
            className="mt-2 w-full px-3 py-2 border rounded"
          />
        </div>

        {conversations.map(conversation => (
          <div
            key={conversation._id}
            onClick={() => setSelectedConversation(conversation)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
              selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {conversation.customer.firstName} {conversation.customer.lastName}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessage}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatRelativeTime(conversation.lastMessageAt)}
            </p>
          </div>
        ))}
      </div>

      {/* Message Thread (Right Panel) */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.customer.firstName} {selectedConversation.customer.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedConversation.customerPhone}
                </p>
              </div>
              <button className="btn-secondary">
                View Customer Profile
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map(message => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {formatTime(message.createdAt)}
                      {message.status === 'delivered' && ' ✓✓'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Send Message Form */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <button
                  type="button"
                  onClick={openTemplateSelector}
                  className="btn-secondary"
                >
                  Templates
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button type="submit" className="btn-primary">
                  Send
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                {calculateSMSSegments(newMessage)} SMS segment(s)
                {newMessage.length > 160 && ` - ${Math.ceil(newMessage.length / 160)} messages`}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Settings UI

**File:** `/app/(dashboard)/settings/sms/page.tsx`

```tsx
export default function SMSSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">SMS Settings</h1>
        <p className="text-gray-600">Configure SMS notifications and two-way messaging</p>
      </div>

      {/* Provider Configuration */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">SMS Provider</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select className="w-full px-3 py-2 border rounded">
              <option value="twilio">Twilio (Recommended)</option>
              <option value="messagebird">MessageBird</option>
              <option value="vonage">Vonage (Nexmo)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Account SID</label>
            <input
              type="text"
              placeholder="AC..."
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Auth Token</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Number</label>
            <input
              type="tel"
              placeholder="+1-800-123-4567"
              className="w-full px-3 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Toll-free or shortcode recommended for professional communication
            </p>
          </div>

          <button className="btn-primary">Save Configuration</button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Automated Notifications</h3>

        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="me-2" defaultChecked />
            <span>Appointment reminders (24h before)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="me-2" defaultChecked />
            <span>Appointment reminders (1h before)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="me-2" defaultChecked />
            <span>Estimate ready notifications</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="me-2" defaultChecked />
            <span>Job completed notifications</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="me-2" defaultChecked />
            <span>Payment reminders</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="me-2" />
            <span>Payment confirmation</span>
          </label>
        </div>
      </div>

      {/* Business Hours & Auto-Reply */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Auto-Reply Settings</h3>

        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="me-2" />
            <span>Enable auto-reply outside business hours</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input type="time" value="09:00" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input type="time" value="18:00" className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Auto-Reply Message (English)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border rounded"
              defaultValue="Thank you for contacting us. Our business hours are 9 AM - 6 PM. We'll respond shortly."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Auto-Reply Message (Arabic)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border rounded"
              defaultValue="شكراً لتواصلك معنا. ساعات العمل من 9 صباحاً - 6 مساءً. سنرد عليك قريباً."
            />
          </div>
        </div>
      </div>

      {/* Message Templates */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Message Templates</h3>
          <button className="btn-primary">+ New Template</button>
        </div>

        <div className="space-y-3">
          {templates.map(template => (
            <div key={template._id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-gray-600 truncate">{template.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-blue-600 hover:text-blue-700">Edit</button>
                <button className="text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Automated Notifications

### Appointment Reminders

**Cron Job:** `/lib/jobs/sms-appointment-reminders.ts`

```typescript
export async function sendAppointmentReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // Get appointments for tomorrow
  const appointments = await Appointment.find({
    appointmentDate: {
      $gte: tomorrow,
      $lte: tomorrowEnd,
    },
    status: 'scheduled',
  }).populate('customerId serviceId');

  for (const appointment of appointments) {
    const customer = appointment.customerId;

    // Skip if customer opted out of SMS
    if (customer.communications?.smsOptOut) continue;

    // Use template
    const template = await SMSTemplate.findOne({
      tenantId: appointment.tenantId,
      category: 'appointment_reminder',
      isActive: true,
    });

    const message = template
      ? interpolateTemplate(template.message, {
          firstName: customer.firstName,
          serviceName: appointment.serviceId.name,
          date: formatDate(appointment.appointmentDate),
          time: appointment.startTime,
        })
      : `Hi ${customer.firstName}, reminder: your ${appointment.serviceId.name} appointment is tomorrow at ${appointment.startTime}.`;

    await sendSMS(customer.phone, message);

    // Log notification
    await CustomerNotification.create({
      tenantId: appointment.tenantId,
      customerId: customer._id,
      type: 'appointment',
      title: 'Appointment Reminder',
      message,
      channels: ['sms'],
      deliveryStatus: { sms: 'sent' },
    });
  }
}

// Run daily at 6 PM (24h before appointments)
```

---

## SMS Analytics

### Track Key Metrics

**Dashboard Widget:**
```tsx
<div className="sms-analytics">
  <h3>SMS Statistics (This Month)</h3>

  <div className="grid grid-cols-4 gap-4">
    <div className="stat-card">
      <p className="text-3xl font-bold">{totalSent}</p>
      <p className="text-gray-600">Messages Sent</p>
    </div>

    <div className="stat-card">
      <p className="text-3xl font-bold">{deliveryRate}%</p>
      <p className="text-gray-600">Delivery Rate</p>
    </div>

    <div className="stat-card">
      <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
      <p className="text-gray-600">Total Cost</p>
    </div>

    <div className="stat-card">
      <p className="text-3xl font-bold">{responseRate}%</p>
      <p className="text-gray-600">Response Rate</p>
    </div>
  </div>

  <div className="mt-6">
    <h4 className="font-semibold mb-2">Messages by Type</h4>
    <BarChart data={messagesByType} />
  </div>
</div>
```

---

## Cost Estimation

### SMS Pricing Calculator

**Example Costs (Twilio):**
- **USA:** $0.0079/SMS
- **Saudi Arabia:** $0.048/SMS
- **UK:** $0.04/SMS

**Monthly Cost for 100 customers:**
- 2 appointment reminders/month = 200 SMS
- 1 job complete notification = 100 SMS
- 1 payment reminder = 100 SMS
- **Total:** 400 SMS/month

**Cost:**
- USA: 400 × $0.0079 = **$3.16/month**
- Saudi: 400 × $0.048 = **$19.20/month**

**Very affordable!**

---

## Timeline (3-4 weeks)

### Week 1: Twilio Integration
- Twilio account setup
- TwilioService implementation
- Webhook handler for incoming SMS
- Database models (SMSMessage, SMSConversation)

### Week 2: SMS Inbox & Templates
- SMS inbox UI (conversations list)
- Message thread UI
- Send message form
- Template management

### Week 3: Automated Notifications
- Appointment reminders (24h, 1h before)
- Estimate ready notifications
- Job complete notifications
- Payment reminders

### Week 4: Testing & Launch
- End-to-end testing
- Analytics dashboard
- Admin documentation
- Pilot launch

---

## Success Metrics

### Month 1:
- 50% reduction in no-shows
- 90%+ SMS delivery rate
- 30% customer response rate
- $20-50/month SMS costs

### Month 3:
- 70% of customers prefer SMS over WhatsApp
- 40% faster estimate approvals
- 95%+ delivery rate
- High customer satisfaction

---

## Security & Compliance

### TCPA Compliance (USA):
- ✅ Obtain customer consent before sending SMS
- ✅ Include opt-out instructions ("Reply STOP to unsubscribe")
- ✅ Honor opt-outs immediately
- ✅ Only send during business hours (8 AM - 9 PM)

### GDPR Compliance:
- ✅ Store SMS history securely
- ✅ Allow customers to export/delete data
- ✅ Log consent timestamps

---

**End of Feature #4 Plan**

Next: **Feature #5: BNPL + Local Payments** for 3x higher repair orders!
