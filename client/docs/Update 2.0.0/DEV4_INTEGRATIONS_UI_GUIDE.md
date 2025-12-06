# Developer 4: Integrations & Frontend Implementation Guide

**Branch:** `tenet/dev4-integrations-ui`
**Timeline:** Weeks 2-6
**Dependencies:** Requires Dev 1 (auth) to merge first

---

## 🚀 Setup

```bash
# Create your branch
git checkout tenet
git pull origin tenet
git checkout -b tenet/dev4-integrations-ui

npm install
```

---

## Week 2: File Storage & External Services

### Task 2.1: Update Cloudinary Integration

**File:** `/lib/cloudinary.ts` (UPDATE)

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  tenantId: string; // ADD THIS - REQUIRED
  folder: string;
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
}

/**
 * Upload file to Cloudinary with tenant isolation
 */
export async function uploadToCloudinary(
  file: File | Buffer | string,
  options: UploadOptions
) {
  const { tenantId, folder, resourceType = 'auto' } = options;

  // Create tenant-specific folder path
  const tenantFolder = `teramotors/${tenantId}/${folder}`;

  const result = await cloudinary.uploader.upload(file, {
    folder: tenantFolder,
    resource_type: resourceType,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
  };
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  tenantId: string
) {
  // Validate publicId starts with tenant folder
  if (!publicId.startsWith(`teramotors/${tenantId}/`)) {
    throw new Error('Invalid file access - file does not belong to tenant');
  }

  await cloudinary.uploader.destroy(publicId);
}

/**
 * Get files for tenant
 */
export async function getFilesForTenant(
  tenantId: string,
  folder: string = ''
) {
  const tenantFolder = `teramotors/${tenantId}/${folder}`;

  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: tenantFolder,
    max_results: 500,
  });

  return result.resources;
}
```

**File:** `/app/api/upload/route.ts` (UPDATE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// POST /api/upload
export const POST = withTenantAuth(
  async (req, { tenantId }) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload with tenant context
    const result = await uploadToCloudinary(buffer, {
      tenantId, // File is isolated to this tenant
      folder,
      resourceType: 'auto',
    });

    return NextResponse.json({ file: result });
  },
  { requireTenant: true }
);
```

### Task 2.2: Update Email Service

**File:** `/lib/email-service.ts` (UPDATE)

```typescript
import nodemailer from 'nodemailer';
import { Tenant } from './models/Tenant';

interface SendEmailOptions {
  tenantId: string; // ADD THIS
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

/**
 * Get email configuration for tenant
 */
async function getTenantEmailConfig(tenantId: string) {
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Check if tenant has custom SMTP settings
  if (tenant.integrations?.smtp) {
    return {
      host: tenant.integrations.smtp.host,
      port: tenant.integrations.smtp.port,
      auth: {
        user: tenant.integrations.smtp.user,
        pass: tenant.integrations.smtp.password,
      },
      from: tenant.integrations.smtp.fromEmail || tenant.companyInfo.email,
    };
  }

  // Fall back to default SMTP
  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    from: process.env.SMTP_FROM_EMAIL,
  };
}

/**
 * Send email with tenant-specific configuration
 */
export async function sendEmail(options: SendEmailOptions) {
  const { tenantId, to, subject, html, attachments } = options;

  // Get tenant email config
  const config = await getTenantEmailConfig(tenantId);

  // Create transporter with tenant config
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.auth,
  });

  // Get tenant for branding
  const tenant = await Tenant.findById(tenantId);

  // Add tenant branding to email
  const brandedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .email-header {
            background-color: ${tenant?.branding?.primaryColor || '#3b82f6'};
            color: white;
            padding: 20px;
            text-align: center;
          }
          .email-body {
            padding: 20px;
          }
          .email-footer {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: center;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-header">
          ${tenant?.branding?.logoUrl ? `<img src="${tenant.branding.logoUrl}" alt="${tenant.companyInfo.name}" height="50">` : ''}
          <h2>${tenant?.companyInfo.name}</h2>
        </div>
        <div class="email-body">
          ${html}
        </div>
        <div class="email-footer">
          <p>${tenant?.companyInfo.name}</p>
          <p>${tenant?.companyInfo.email} | ${tenant?.companyInfo.phone}</p>
        </div>
      </body>
    </html>
  `;

  // Send email
  const info = await transporter.sendMail({
    from: config.from,
    to,
    subject,
    html: brandedHtml,
    attachments,
  });

  return info;
}
```

**Update Tenant Model for Email Config:**

Add to `/lib/models/Tenant.ts`:

```typescript
// Add to ITenant interface
integrations?: {
  smtp?: {
    host: string;
    port: number;
    user: string;
    password: string;
    fromEmail?: string;
  };
  whatsapp?: {
    sessionId: string;
    apiUrl: string;
    apiKey?: string;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
};
```

---

## Week 3: Communication Services

### Task 3.1: Update WhatsApp Integration

**File:** `/lib/whatsapp-service.ts` (UPDATE)

```typescript
import axios from 'axios';
import { Tenant } from './models/Tenant';

interface SendWhatsAppOptions {
  tenantId: string; // ADD THIS
  to: string;
  message: string;
  mediaUrl?: string;
}

/**
 * Get WhatsApp configuration for tenant
 */
async function getTenantWhatsAppConfig(tenantId: string) {
  const tenant = await Tenant.findById(tenantId);

  if (!tenant?.integrations?.whatsapp) {
    throw new Error('WhatsApp not configured for this tenant');
  }

  return tenant.integrations.whatsapp;
}

/**
 * Send WhatsApp message via WAHA
 */
export async function sendWhatsAppMessage(options: SendWhatsAppOptions) {
  const { tenantId, to, message, mediaUrl } = options;

  // Get tenant-specific WhatsApp config
  const config = await getTenantWhatsAppConfig(tenantId);

  const wahaUrl = config.apiUrl || process.env.WAHA_API_URL;
  const sessionId = config.sessionId;

  // Format phone number
  const formattedPhone = to.replace(/\D/g, '');

  // Send message
  const response = await axios.post(
    `${wahaUrl}/api/sendText`,
    {
      session: sessionId,
      chatId: `${formattedPhone}@c.us`,
      text: message,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-Api-Key': config.apiKey }),
      },
    }
  );

  return response.data;
}

/**
 * Send WhatsApp media
 */
export async function sendWhatsAppMedia(options: SendWhatsAppOptions) {
  const { tenantId, to, message, mediaUrl } = options;

  const config = await getTenantWhatsAppConfig(tenantId);

  const wahaUrl = config.apiUrl || process.env.WAHA_API_URL;
  const sessionId = config.sessionId;

  const formattedPhone = to.replace(/\D/g, '');

  const response = await axios.post(
    `${wahaUrl}/api/sendImage`,
    {
      session: sessionId,
      chatId: `${formattedPhone}@c.us`,
      file: {
        url: mediaUrl,
      },
      caption: message,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-Api-Key': config.apiKey }),
      },
    }
  );

  return response.data;
}
```

### Task 3.2: Update Twilio SMS Service

**File:** `/lib/twilio-service.ts` (UPDATE)

```typescript
import twilio from 'twilio';
import { Tenant } from './models/Tenant';

interface SendSMSOptions {
  tenantId: string; // ADD THIS
  to: string;
  message: string;
}

/**
 * Get Twilio configuration for tenant
 */
async function getTenantTwilioConfig(tenantId: string) {
  const tenant = await Tenant.findById(tenantId);

  if (!tenant?.integrations?.twilio) {
    // Fall back to default Twilio config
    return {
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      fromNumber: process.env.TWILIO_PHONE_NUMBER!,
    };
  }

  return tenant.integrations.twilio;
}

/**
 * Send SMS with tenant-specific Twilio config
 */
export async function sendSMS(options: SendSMSOptions) {
  const { tenantId, to, message } = options;

  // Get tenant Twilio config
  const config = await getTenantTwilioConfig(tenantId);

  // Create Twilio client with tenant credentials
  const client = twilio(config.accountSid, config.authToken);

  // Send SMS
  const result = await client.messages.create({
    body: message,
    from: config.fromNumber,
    to,
  });

  return result;
}
```

---

## Week 4: ZATCA & Compliance

### Task 4.1: Update ZATCA Integration

**File:** `/zatca/zatca-service.ts` (UPDATE)

```typescript
import { Tenant } from '@/lib/models/Tenant';
import { IInvoice } from '@/lib/models/Invoice';

/**
 * Get ZATCA credentials for tenant
 */
async function getTenantZatcaConfig(tenantId: string) {
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Check if tenant has ZATCA config
  if (!tenant.zatcaConfig) {
    throw new Error('ZATCA not configured for this tenant');
  }

  return tenant.zatcaConfig;
}

/**
 * Generate ZATCA-compliant invoice with tenant credentials
 */
export async function generateZatcaInvoice(
  tenantId: string,
  invoice: IInvoice
) {
  // Get tenant ZATCA config
  const zatcaConfig = await getTenantZatcaConfig(tenantId);
  const tenant = await Tenant.findById(tenantId);

  // Use tenant's company info and VAT number
  const zatcaInvoice = {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    seller: {
      name: tenant?.companyInfo.name,
      vatNumber: tenant?.companyInfo.vatNumber,
      crNumber: tenant?.companyInfo.crNumber,
      address: tenant?.companyInfo.address,
    },
    buyer: {
      name: invoice.customer?.name,
      vatNumber: invoice.customer?.vatNumber,
      address: invoice.customer?.address,
    },
    lineItems: invoice.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 0.15,
      taxAmount: item.taxAmount,
      totalAmount: item.totalAmount,
    })),
    totalAmount: invoice.totalAmount,
    taxAmount: invoice.taxAmount,
    // Use tenant-specific ZATCA credentials
    deviceId: zatcaConfig.deviceId,
    cryptographicStamp: zatcaConfig.cryptographicStamp,
  };

  // Generate QR code with tenant data
  const qrCode = await generateZatcaQRCode(zatcaInvoice);

  // Submit to ZATCA using tenant credentials
  const zatcaResponse = await submitToZatca(zatcaInvoice, zatcaConfig);

  return {
    qrCode,
    zatcaResponse,
  };
}

/**
 * Submit invoice to ZATCA
 */
async function submitToZatca(invoice: any, config: any) {
  // Use tenant-specific API credentials
  const response = await fetch(config.apiUrl || process.env.ZATCA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiToken}`,
      'X-Device-ID': config.deviceId,
    },
    body: JSON.stringify(invoice),
  });

  return response.json();
}
```

**Update Tenant Model for ZATCA:**

Add to `/lib/models/Tenant.ts`:

```typescript
// Add to ITenant interface
zatcaConfig?: {
  deviceId: string;
  cryptographicStamp: string;
  apiToken: string;
  apiUrl?: string;
  certifiate?: string;
  privateKey?: string;
};
```

---

## Week 5: Real-time & Frontend

### Task 5.1: Update Socket.io Server

**File:** `/server/server.js` (UPDATE)

```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware to validate tenant on socket connection
io.use(async (socket, next) => {
  const { tenantId, userId, token } = socket.handshake.auth;

  if (!tenantId || !userId || !token) {
    return next(new Error('Authentication error'));
  }

  // Validate token and tenant
  // ... validation logic ...

  socket.tenantId = tenantId;
  socket.userId = userId;

  next();
});

io.on('connection', (socket) => {
  const { tenantId, userId } = socket;

  console.log(`User ${userId} connected to tenant ${tenantId}`);

  // Join tenant-specific room
  socket.join(`tenant-${tenantId}`);

  // Also join user-specific room
  socket.join(`user-${userId}`);

  // Listen for tenant-scoped events
  socket.on('jobCard:update', async (data) => {
    // Validate data belongs to socket's tenant
    if (data.tenantId !== tenantId) {
      return socket.emit('error', { message: 'Invalid tenant' });
    }

    // Broadcast only to same tenant
    io.to(`tenant-${tenantId}`).emit('jobCard:updated', data);
  });

  socket.on('appointment:create', async (data) => {
    if (data.tenantId !== tenantId) {
      return socket.emit('error', { message: 'Invalid tenant' });
    }

    io.to(`tenant-${tenantId}`).emit('appointment:created', data);
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected from tenant ${tenantId}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
```

### Task 5.2: Create Tenant Selector Component

**File:** `/components/admin/TenantSelector.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantStore } from '@/lib/stores/tenant-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TenantSelector() {
  const router = useRouter();
  const { currentTenant, setCurrentTenant } = useTenantStore();
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    // Fetch user's tenants
    fetch('/api/user/tenants')
      .then(res => res.json())
      .then(data => setTenants(data.tenants));
  }, []);

  const handleTenantChange = async (tenantId: string) => {
    // Switch tenant context
    await fetch('/api/auth/switch-tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    });

    setCurrentTenant(tenantId);
    router.refresh();
  };

  if (tenants.length <= 1) {
    return null; // Don't show selector if user only has one tenant
  }

  return (
    <Select value={currentTenant} onValueChange={handleTenantChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant: any) => (
          <SelectItem key={tenant._id} value={tenant._id}>
            {tenant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Task 5.3: Create Tenant Store

**File:** `/lib/stores/tenant-store.ts` (NEW)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TenantState {
  currentTenant: string | null;
  tenantInfo: any | null;
  setCurrentTenant: (tenantId: string) => void;
  setTenantInfo: (info: any) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentTenant: null,
      tenantInfo: null,
      setCurrentTenant: (tenantId) => set({ currentTenant: tenantId }),
      setTenantInfo: (info) => set({ tenantInfo: info }),
      clearTenant: () => set({ currentTenant: null, tenantInfo: null }),
    }),
    {
      name: 'tenant-storage',
    }
  )
);
```

### Task 5.4: Update PDF Generation

**File:** `/lib/pdf-generator.ts` (UPDATE)

```typescript
import { Tenant } from './models/Tenant';
import PDFDocument from 'pdfkit';

interface GeneratePDFOptions {
  tenantId: string; // ADD THIS
  type: 'invoice' | 'estimate' | 'jobCard';
  data: any;
}

/**
 * Generate PDF with tenant branding
 */
export async function generatePDF(options: GeneratePDFOptions) {
  const { tenantId, type, data } = options;

  // Get tenant for branding
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const doc = new PDFDocument();

  // Add tenant logo if available
  if (tenant.branding?.logoUrl) {
    // Fetch and add logo
    // doc.image(logoBuffer, 50, 50, { width: 100 });
  }

  // Add company header with tenant info
  doc.fontSize(20)
     .fillColor(tenant.branding?.primaryColor || '#000000')
     .text(tenant.companyInfo.name, 50, 50);

  doc.fontSize(10)
     .fillColor('#000000')
     .text(tenant.companyInfo.address?.street || '', 50, 80)
     .text(`${tenant.companyInfo.address?.city}, ${tenant.companyInfo.address?.country}`, 50, 95)
     .text(`VAT: ${tenant.companyInfo.vatNumber}`, 50, 110)
     .text(`CR: ${tenant.companyInfo.crNumber}`, 50, 125);

  // Add content based on type
  if (type === 'invoice') {
    addInvoiceContent(doc, data, tenant);
  } else if (type === 'estimate') {
    addEstimateContent(doc, data, tenant);
  } else if (type === 'jobCard') {
    addJobCardContent(doc, data, tenant);
  }

  // Add footer with tenant contact
  doc.fontSize(8)
     .text(
       `${tenant.companyInfo.phone} | ${tenant.companyInfo.email} | ${tenant.companyInfo.website}`,
       50,
       doc.page.height - 50,
       { align: 'center' }
     );

  doc.end();

  return doc;
}
```

---

## Week 6: Admin UI & Polish

### Task 6.1: Create Super Admin Dashboard

**File:** `/app/admin/tenants/page.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    const res = await fetch('/api/tenants');
    const data = await res.json();
    setTenants(data.tenants);
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Link href="/admin/tenants/new">
          <Button>Create Tenant</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((tenant: any) => (
          <Card key={tenant._id} className="p-4">
            <h3 className="text-xl font-semibold">{tenant.name}</h3>
            <p className="text-sm text-gray-600">{tenant.companyInfo.name}</p>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs ${
                tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {tenant.status}
              </span>
            </div>
            <div className="mt-4">
              <Link href={`/admin/tenants/${tenant._id}`}>
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Task 6.2: Create Tenant Settings Page

**File:** `/app/settings/tenant/page.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function TenantSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch('/api/tenant/settings');
    const data = await res.json();
    setSettings(data.settings);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/tenant/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Organization Settings</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>

        <div className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input
              value={settings.companyInfo.name}
              onChange={(e) => setSettings({
                ...settings,
                companyInfo: { ...settings.companyInfo, name: e.target.value }
              })}
            />
          </div>

          <div>
            <Label>VAT Number</Label>
            <Input
              value={settings.companyInfo.vatNumber}
              onChange={(e) => setSettings({
                ...settings,
                companyInfo: { ...settings.companyInfo, vatNumber: e.target.value }
              })}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={settings.companyInfo.email}
              onChange={(e) => setSettings({
                ...settings,
                companyInfo: { ...settings.companyInfo, email: e.target.value }
              })}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={settings.companyInfo.phone}
              onChange={(e) => setSettings({
                ...settings,
                companyInfo: { ...settings.companyInfo, phone: e.target.value }
              })}
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] File uploads isolated to tenant folders
- [ ] File access validates tenant ownership
- [ ] Email service uses tenant branding
- [ ] WhatsApp sends from tenant number
- [ ] SMS uses tenant Twilio config
- [ ] ZATCA uses tenant credentials
- [ ] Socket.io rooms are tenant-isolated
- [ ] PDF generation uses tenant branding
- [ ] Tenant selector works
- [ ] Admin UI functional

---

## 📝 Merge Checklist

- [ ] All integrations updated
- [ ] UI components working
- [ ] Tests passing
- [ ] No hardcoded tenant values
- [ ] Documentation updated

---

**Questions? Contact Tech Lead or post in #tenet-migration**
