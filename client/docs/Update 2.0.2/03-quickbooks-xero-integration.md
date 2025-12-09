# TeraMotors - Feature #3: QuickBooks/Xero Integration
**Implementation Plan**
**Date:** December 6, 2025

## Executive Summary

**Goal:** Automatically sync invoices, payments, customers, and expenses to QuickBooks Online or Xero, eliminating manual accounting data entry.

**Business Impact:**
- 90% reduction in accounting errors
- Save 10-15 hours/week on manual data entry
- Real-time financial visibility
- Simplified tax preparation
- Competitive parity with 90% of industry leaders

**Timeline:** 4-6 weeks
**Complexity:** Medium-High
**Dependencies:** None (standalone feature)

---

## What Gets Synced

### QuickBooks Online & Xero Support

**1. Customers**
- Auto-sync when customer created in TeraMotors
- Map TeraMotors customer → QuickBooks/Xero customer
- Keep contact info in sync (email, phone, address)
- Two-way sync (optional)

**2. Invoices**
- Auto-create invoice in QuickBooks/Xero when marked as "completed" in TeraMotors
- Sync line items (services + parts)
- Include ZATCA compliance data (VAT, invoice number)
- Sync invoice status (draft, sent, paid)

**3. Payments**
- Record payments in QuickBooks/Xero when received
- Match payment to invoice
- Sync payment method (cash, card, bank transfer)
- Bank deposit tracking

**4. Expenses** (Optional)
- Sync parts purchases as expenses
- Track vendor invoices
- Categorize expenses

**5. Chart of Accounts Mapping**
- Map TeraMotors categories → QuickBooks/Xero accounts
- Revenue: Service revenue, Parts revenue
- Expenses: Parts costs, Labor costs
- Assets: Inventory
- Liabilities: Accounts payable

---

## Architecture Design

### OAuth 2.0 Flow

**QuickBooks/Xero use OAuth for secure connection:**

```
1. Admin clicks "Connect QuickBooks" in settings
2. Redirect to QuickBooks/Xero authorization page
3. Admin logs in and grants permissions
4. QuickBooks/Xero redirects back with authorization code
5. Exchange code for access token & refresh token
6. Store tokens securely (encrypted)
7. Use access token for API calls
8. Auto-refresh when token expires (every 60 days)
```

### Sync Strategy

**Two Modes:**

**1. Real-Time Sync (Recommended)**
- Invoice created in TeraMotors → immediately sync to QuickBooks/Xero
- Payment received → immediately sync
- Customer created → immediately sync
- **Pros:** Always up-to-date, no delays
- **Cons:** More API calls

**2. Batch Sync**
- Sync every hour/day
- Queue items to sync
- Process in batches
- **Pros:** Fewer API calls, handles rate limits better
- **Cons:** Data not real-time

**Recommendation:** Real-time for invoices/payments, batch for customers/expenses

---

## Files to Create (24 files)

### Integration Services
- `/lib/integrations/quickbooks/QuickBooksService.ts` - QuickBooks API wrapper
- `/lib/integrations/quickbooks/QuickBooksOAuth.ts` - OAuth flow
- `/lib/integrations/quickbooks/QuickBooksSync.ts` - Sync logic
- `/lib/integrations/quickbooks/QuickBooksMapper.ts` - Data mapping
- `/lib/integrations/xero/XeroService.ts` - Xero API wrapper
- `/lib/integrations/xero/XeroOAuth.ts` - OAuth flow
- `/lib/integrations/xero/XeroSync.ts` - Sync logic
- `/lib/integrations/xero/XeroMapper.ts` - Data mapping
- `/lib/integrations/AccountingSyncService.ts` - Unified interface

### API Routes
- `/app/api/integrations/quickbooks/connect/route.ts` - Start OAuth
- `/app/api/integrations/quickbooks/callback/route.ts` - OAuth callback
- `/app/api/integrations/quickbooks/disconnect/route.ts` - Disconnect
- `/app/api/integrations/quickbooks/sync/route.ts` - Manual sync
- `/app/api/integrations/quickbooks/status/route.ts` - Sync status
- `/app/api/integrations/xero/connect/route.ts` - Start OAuth
- `/app/api/integrations/xero/callback/route.ts` - OAuth callback
- `/app/api/integrations/xero/disconnect/route.ts` - Disconnect
- `/app/api/integrations/xero/sync/route.ts` - Manual sync
- `/app/api/integrations/xero/status/route.ts` - Sync status
- `/app/api/integrations/webhooks/quickbooks/route.ts` - QuickBooks webhooks
- `/app/api/integrations/webhooks/xero/route.ts` - Xero webhooks

### Settings Pages
- `/app/(dashboard)/settings/integrations/page.tsx` - Integrations hub
- `/app/(dashboard)/settings/integrations/quickbooks/page.tsx` - QuickBooks settings
- `/app/(dashboard)/settings/integrations/xero/page.tsx` - Xero settings

### Components
- `/components/integrations/QuickBooksConnectButton.tsx` - Connect button
- `/components/integrations/XeroConnectButton.tsx` - Connect button
- `/components/integrations/SyncStatus.tsx` - Sync status display
- `/components/integrations/AccountMappingTable.tsx` - Map accounts
- `/components/integrations/SyncHistoryTable.tsx` - Sync log

### Database Models
- `/lib/models/IntegrationConnection.ts` - Store OAuth tokens
- `/lib/models/SyncLog.ts` - Track sync history
- `/lib/models/AccountMapping.ts` - Chart of accounts mapping

### Background Jobs
- `/lib/jobs/accounting-sync.ts` - Cron job for batch sync
- `/lib/jobs/token-refresh.ts` - Auto-refresh OAuth tokens

### Tests
- `/tests/integrations/quickbooks-sync.test.ts` - QuickBooks tests
- `/tests/integrations/xero-sync.test.ts` - Xero tests

---

## Files to Modify (5 files)

### 1. Invoice Model
**File:** `/lib/models/Invoice.ts`

**Add fields:**
```typescript
accounting: {
  synced: boolean;
  syncedAt?: Date;
  syncProvider?: 'quickbooks' | 'xero';
  externalId?: string; // QuickBooks/Xero invoice ID
  syncError?: string;
  lastSyncAttempt?: Date;
};
```

### 2. Payment Model
**File:** `/lib/models/Payment.ts`

**Add fields:**
```typescript
accounting: {
  synced: boolean;
  syncedAt?: Date;
  syncProvider?: 'quickbooks' | 'xero';
  externalId?: string;
  syncError?: string;
};
```

### 3. Customer Model
**File:** `/lib/models/Customer.ts`

**Add fields:**
```typescript
accounting: {
  quickbooksId?: string;
  xeroId?: string;
  lastSynced?: Date;
};
```

### 4. Tenant Model
**File:** `/lib/models/Tenant.ts`

**Add fields:**
```typescript
integrations: {
  // ... existing smtp, whatsapp, twilio ...

  quickbooks?: {
    connected: boolean;
    realmId: string; // Company ID
    accessToken: string; // Encrypted
    refreshToken: string; // Encrypted
    tokenExpiry: Date;
    syncEnabled: boolean;
    syncMode: 'realtime' | 'batch';
    lastSync?: Date;
  };

  xero?: {
    connected: boolean;
    tenantId: string; // Xero organization ID
    accessToken: string; // Encrypted
    refreshToken: string; // Encrypted
    tokenExpiry: Date;
    syncEnabled: boolean;
    syncMode: 'realtime' | 'batch';
    lastSync?: Date;
  };
};
```

### 5. Settings Navigation
**File:** `/app/(dashboard)/settings/layout.tsx`

**Add "Integrations" tab to settings navigation**

---

## Database Schema

### IntegrationConnection Model

```typescript
export interface IIntegrationConnection extends Document {
  tenantId: mongoose.Types.ObjectId;
  provider: 'quickbooks' | 'xero';
  connected: boolean;

  // OAuth credentials (encrypted)
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;

  // Provider-specific IDs
  realmId?: string; // QuickBooks company ID
  xeroTenantId?: string; // Xero organization ID

  // Sync settings
  syncEnabled: boolean;
  syncMode: 'realtime' | 'batch';
  autoSync: {
    customers: boolean;
    invoices: boolean;
    payments: boolean;
    expenses: boolean;
  };

  // Account mapping
  accountMapping: {
    serviceRevenue: string; // QuickBooks/Xero account ID
    partsRevenue: string;
    partsCost: string;
    laborCost: string;
    inventory: string;
  };

  // Status
  lastSync: Date;
  lastSyncStatus: 'success' | 'failed' | 'partial';
  syncErrors: string[];

  createdAt: Date;
  updatedAt: Date;
}
```

### SyncLog Model

```typescript
export interface ISyncLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  provider: 'quickbooks' | 'xero';

  entityType: 'customer' | 'invoice' | 'payment' | 'expense';
  entityId: mongoose.Types.ObjectId; // TeraMotors ID
  externalId?: string; // QuickBooks/Xero ID

  action: 'create' | 'update' | 'delete';
  status: 'pending' | 'success' | 'failed';

  request?: any; // API request payload
  response?: any; // API response
  error?: string;

  syncedAt?: Date;
  retryCount: number;

  createdAt: Date;
}
```

---

## QuickBooks Integration

### OAuth Setup

**QuickBooks App Configuration:**
1. Create app at https://developer.intuit.com
2. Get Client ID and Client Secret
3. Set Redirect URI: `https://teramotors.com/api/integrations/quickbooks/callback`
4. Request scopes: `com.intuit.quickbooks.accounting`

**Environment Variables:**
```env
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=https://teramotors.com/api/integrations/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=production # or sandbox
```

### QuickBooks API Service

**File:** `/lib/integrations/quickbooks/QuickBooksService.ts`

```typescript
import OAuthClient from 'intuit-oauth';

export class QuickBooksService {
  private oauthClient: OAuthClient;
  private realmId: string;

  constructor(accessToken: string, refreshToken: string, realmId: string) {
    this.oauthClient = new OAuthClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
      environment: process.env.QUICKBOOKS_ENVIRONMENT,
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
    });

    this.oauthClient.setToken({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.realmId = realmId;
  }

  // Create customer in QuickBooks
  async createCustomer(customer: Customer) {
    const response = await this.oauthClient.makeApiCall({
      url: `https://quickbooks.api.intuit.com/v3/company/${this.realmId}/customer`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        DisplayName: `${customer.firstName} ${customer.lastName}`,
        PrimaryEmailAddr: { Address: customer.email },
        PrimaryPhone: { FreeFormNumber: customer.phone },
        BillAddr: {
          Line1: customer.address?.street,
          City: customer.address?.city,
          CountrySubDivisionCode: customer.address?.state,
          PostalCode: customer.address?.zipCode,
          Country: customer.address?.country,
        },
      }),
    });

    return response.json();
  }

  // Create invoice in QuickBooks
  async createInvoice(invoice: Invoice, customer: Customer, lineItems: any[]) {
    const response = await this.oauthClient.makeApiCall({
      url: `https://quickbooks.api.intuit.com/v3/company/${this.realmId}/invoice`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CustomerRef: { value: customer.accounting.quickbooksId },
        DocNumber: invoice.invoiceNumber,
        TxnDate: invoice.createdAt.toISOString().split('T')[0],
        DueDate: invoice.dueDate.toISOString().split('T')[0],
        Line: lineItems.map(item => ({
          DetailType: 'SalesItemLineDetail',
          Amount: item.amount,
          Description: item.description,
          SalesItemLineDetail: {
            ItemRef: { value: item.itemId }, // QuickBooks item ID
            Qty: item.quantity,
            UnitPrice: item.unitPrice,
            TaxCodeRef: { value: 'TAX' }, // VAT
          },
        })),
        TxnTaxDetail: {
          TotalTax: invoice.zatca?.vatAmount || 0,
        },
        CustomField: [
          {
            DefinitionId: '1',
            Name: 'ZATCA Invoice Number',
            Type: 'StringType',
            StringValue: invoice.zatca?.invoiceNumber,
          },
        ],
      }),
    });

    return response.json();
  }

  // Record payment in QuickBooks
  async createPayment(payment: Payment, invoice: Invoice) {
    const response = await this.oauthClient.makeApiCall({
      url: `https://quickbooks.api.intuit.com/v3/company/${this.realmId}/payment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CustomerRef: { value: invoice.accounting.externalId },
        TotalAmt: payment.amount,
        TxnDate: payment.paymentDate.toISOString().split('T')[0],
        PaymentMethodRef: { value: this.mapPaymentMethod(payment.paymentMethod) },
        Line: [
          {
            Amount: payment.amount,
            LinkedTxn: [
              {
                TxnId: invoice.accounting.externalId,
                TxnType: 'Invoice',
              },
            ],
          },
        ],
      }),
    });

    return response.json();
  }

  // Refresh access token
  async refreshToken() {
    const authResponse = await this.oauthClient.refresh();
    return {
      accessToken: authResponse.token.access_token,
      refreshToken: authResponse.token.refresh_token,
      expiresAt: new Date(Date.now() + authResponse.token.expires_in * 1000),
    };
  }

  private mapPaymentMethod(method: string): string {
    const mapping = {
      cash: '1', // QuickBooks Cash account
      card: '2', // Credit Card
      bank_transfer: '3', // Bank Transfer
      check: '4', // Check
    };
    return mapping[method] || '1';
  }
}
```

---

## Xero Integration

### OAuth Setup

**Xero App Configuration:**
1. Create app at https://developer.xero.com/myapps
2. Get Client ID and Client Secret
3. Set Redirect URI: `https://teramotors.com/api/integrations/xero/callback`
4. Request scopes: `accounting.transactions`, `accounting.contacts`

**Environment Variables:**
```env
XERO_CLIENT_ID=your_client_id
XERO_CLIENT_SECRET=your_client_secret
XERO_REDIRECT_URI=https://teramotors.com/api/integrations/xero/callback
```

### Xero API Service

**File:** `/lib/integrations/xero/XeroService.ts`

```typescript
import { XeroClient } from 'xero-node';

export class XeroService {
  private xeroClient: XeroClient;
  private tenantId: string;

  constructor(accessToken: string, tenantId: string) {
    this.xeroClient = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID,
      clientSecret: process.env.XERO_CLIENT_SECRET,
      redirectUris: [process.env.XERO_REDIRECT_URI],
      scopes: ['accounting.transactions', 'accounting.contacts'].join(' '),
    });

    this.xeroClient.setTokenSet({ access_token: accessToken });
    this.tenantId = tenantId;
  }

  // Create contact (customer) in Xero
  async createContact(customer: Customer) {
    const response = await this.xeroClient.accountingApi.createContacts(this.tenantId, {
      contacts: [
        {
          name: `${customer.firstName} ${customer.lastName}`,
          emailAddress: customer.email,
          phones: [
            {
              phoneType: 'DEFAULT',
              phoneNumber: customer.phone,
            },
          ],
          addresses: [
            {
              addressType: 'STREET',
              addressLine1: customer.address?.street,
              city: customer.address?.city,
              region: customer.address?.state,
              postalCode: customer.address?.zipCode,
              country: customer.address?.country,
            },
          ],
        },
      ],
    });

    return response.body.contacts[0];
  }

  // Create invoice in Xero
  async createInvoice(invoice: Invoice, customer: Customer, lineItems: any[]) {
    const response = await this.xeroClient.accountingApi.createInvoices(this.tenantId, {
      invoices: [
        {
          type: 'ACCREC', // Accounts Receivable
          contact: { contactID: customer.accounting.xeroId },
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.createdAt.toISOString().split('T')[0],
          dueDate: invoice.dueDate.toISOString().split('T')[0],
          lineItems: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitAmount: item.unitPrice,
            accountCode: item.accountCode, // Xero account code
            taxType: 'OUTPUT2', // 15% VAT
          })),
          status: 'AUTHORISED',
          reference: invoice.zatca?.invoiceNumber,
        },
      ],
    });

    return response.body.invoices[0];
  }

  // Create payment in Xero
  async createPayment(payment: Payment, invoice: Invoice) {
    const response = await this.xeroClient.accountingApi.createPayments(this.tenantId, {
      payments: [
        {
          invoice: { invoiceID: invoice.accounting.externalId },
          account: { code: this.mapPaymentAccount(payment.paymentMethod) },
          amount: payment.amount,
          date: payment.paymentDate.toISOString().split('T')[0],
          reference: payment.reference,
        },
      ],
    });

    return response.body.payments[0];
  }

  private mapPaymentAccount(method: string): string {
    const mapping = {
      cash: '090', // Cash account
      card: '091', // Card account
      bank_transfer: '092', // Bank
      check: '093', // Check
    };
    return mapping[method] || '090';
  }
}
```

---

## Sync Logic

### Invoice Sync Flow

**File:** `/lib/integrations/AccountingSyncService.ts`

```typescript
export class AccountingSyncService {
  private provider: 'quickbooks' | 'xero';
  private connection: IntegrationConnection;

  constructor(tenantId: string) {
    this.connection = await IntegrationConnection.findOne({ tenantId });
    this.provider = this.connection.provider;
  }

  async syncInvoice(invoice: Invoice) {
    // Skip if already synced
    if (invoice.accounting.synced) {
      return;
    }

    // Create sync log
    const syncLog = await SyncLog.create({
      tenantId: invoice.tenantId,
      provider: this.provider,
      entityType: 'invoice',
      entityId: invoice._id,
      action: 'create',
      status: 'pending',
    });

    try {
      // Ensure customer is synced first
      const customer = await Customer.findById(invoice.customerId);
      await this.syncCustomer(customer);

      // Prepare line items
      const lineItems = await this.prepareInvoiceLineItems(invoice);

      // Sync to provider
      let externalInvoice;
      if (this.provider === 'quickbooks') {
        const qb = new QuickBooksService(
          this.connection.accessToken,
          this.connection.refreshToken,
          this.connection.realmId
        );
        externalInvoice = await qb.createInvoice(invoice, customer, lineItems);
      } else {
        const xero = new XeroService(
          this.connection.accessToken,
          this.connection.xeroTenantId
        );
        externalInvoice = await xero.createInvoice(invoice, customer, lineItems);
      }

      // Update invoice
      invoice.accounting.synced = true;
      invoice.accounting.syncedAt = new Date();
      invoice.accounting.syncProvider = this.provider;
      invoice.accounting.externalId = externalInvoice.Id || externalInvoice.invoiceID;
      await invoice.save();

      // Update sync log
      syncLog.status = 'success';
      syncLog.externalId = invoice.accounting.externalId;
      syncLog.syncedAt = new Date();
      syncLog.response = externalInvoice;
      await syncLog.save();

      return { success: true, externalId: invoice.accounting.externalId };
    } catch (error) {
      // Handle error
      syncLog.status = 'failed';
      syncLog.error = error.message;
      syncLog.retryCount++;
      await syncLog.save();

      invoice.accounting.syncError = error.message;
      invoice.accounting.lastSyncAttempt = new Date();
      await invoice.save();

      throw error;
    }
  }

  async syncPayment(payment: Payment) {
    // Similar logic for payments
  }

  async syncCustomer(customer: Customer) {
    // Check if already synced
    const existingId = this.provider === 'quickbooks'
      ? customer.accounting.quickbooksId
      : customer.accounting.xeroId;

    if (existingId) {
      return;
    }

    // Sync customer...
  }

  private async prepareInvoiceLineItems(invoice: Invoice) {
    // Map TeraMotors line items to QuickBooks/Xero format
    const jobCard = await JobCard.findById(invoice.jobCardId);

    const items = [];

    // Services
    for (const service of jobCard.services) {
      const serviceData = await Service.findById(service.serviceId);
      items.push({
        description: serviceData.name,
        quantity: service.quantity,
        unitPrice: service.laborRate,
        amount: service.quantity * service.laborRate * service.laborHours,
        accountCode: this.connection.accountMapping.serviceRevenue,
        itemId: await this.getOrCreateItem(serviceData.name, 'service'),
      });
    }

    // Parts
    for (const part of jobCard.partsUsed) {
      const partData = await Part.findById(part.partId);
      items.push({
        description: partData.name,
        quantity: part.quantity,
        unitPrice: part.cost,
        amount: part.quantity * part.cost,
        accountCode: this.connection.accountMapping.partsRevenue,
        itemId: await this.getOrCreateItem(partData.name, 'part'),
      });
    }

    return items;
  }

  private async getOrCreateItem(name: string, type: 'service' | 'part') {
    // Check if item exists in QuickBooks/Xero, create if not
    // Cache item IDs to avoid repeated API calls
  }
}
```

---

## Settings UI

### Integrations Page

**File:** `/app/(dashboard)/settings/integrations/page.tsx`

```tsx
export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-gray-600">
          Connect your accounting software to automatically sync invoices, payments, and customers.
        </p>
      </div>

      {/* QuickBooks */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logos/quickbooks.png" alt="QuickBooks" className="w-12 h-12" />
            <div>
              <h3 className="font-semibold">QuickBooks Online</h3>
              <p className="text-sm text-gray-600">
                Sync invoices, payments, and customers to QuickBooks
              </p>
            </div>
          </div>

          {quickbooksConnected ? (
            <div className="flex items-center gap-3">
              <StatusBadge status="connected" />
              <button onClick={handleQuickBooksDisconnect} className="btn-secondary">
                Disconnect
              </button>
              <button onClick={handleQuickBooksSettings} className="btn-primary">
                Settings
              </button>
            </div>
          ) : (
            <QuickBooksConnectButton />
          )}
        </div>

        {quickbooksConnected && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Last Sync</p>
              <p className="font-semibold">{formatDate(lastSync)}</p>
            </div>
            <div>
              <p className="text-gray-600">Synced Invoices</p>
              <p className="font-semibold">{syncedInvoicesCount}</p>
            </div>
            <div>
              <p className="text-gray-600">Sync Status</p>
              <p className="font-semibold text-green-600">Active</p>
            </div>
          </div>
        )}
      </div>

      {/* Xero */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logos/xero.png" alt="Xero" className="w-12 h-12" />
            <div>
              <h3 className="font-semibold">Xero</h3>
              <p className="text-sm text-gray-600">
                Sync invoices, payments, and customers to Xero
              </p>
            </div>
          </div>

          {xeroConnected ? (
            <div className="flex items-center gap-3">
              <StatusBadge status="connected" />
              <button onClick={handleXeroDisconnect} className="btn-secondary">
                Disconnect
              </button>
              <button onClick={handleXeroSettings} className="btn-primary">
                Settings
              </button>
            </div>
          ) : (
            <XeroConnectButton />
          )}
        </div>
      </div>

      {/* Future Integrations */}
      <div className="bg-gray-50 rounded-lg border border-dashed p-6">
        <h3 className="font-semibold mb-2">Coming Soon</h3>
        <div className="grid grid-cols-3 gap-4 opacity-50">
          <div className="flex items-center gap-2">
            <img src="/logos/stripe.png" className="w-8 h-8" />
            <span>Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/logos/partstech.png" className="w-8 h-8" />
            <span>PartsTech</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/logos/twilio.png" className="w-8 h-8" />
            <span>Twilio SMS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Account Mapping UI

**Allows admin to map TeraMotors categories to QuickBooks/Xero accounts:**

```tsx
<div className="account-mapping">
  <h3>Chart of Accounts Mapping</h3>

  <div className="mapping-table">
    <div className="row">
      <span>Service Revenue</span>
      <select value={mapping.serviceRevenue} onChange={...}>
        <option value="">Select Account</option>
        {accounts.map(account => (
          <option key={account.id} value={account.id}>
            {account.name} ({account.code})
          </option>
        ))}
      </select>
    </div>

    <div className="row">
      <span>Parts Revenue</span>
      <select value={mapping.partsRevenue} onChange={...}>
        {/* ... */}
      </select>
    </div>

    <div className="row">
      <span>Parts Cost (COGS)</span>
      <select value={mapping.partsCost} onChange={...}>
        {/* ... */}
      </select>
    </div>

    <div className="row">
      <span>Labor Cost</span>
      <select value={mapping.laborCost} onChange={...}>
        {/* ... */}
      </select>
    </div>

    <div className="row">
      <span>Inventory</span>
      <select value={mapping.inventory} onChange={...}>
        {/* ... */}
      </select>
    </div>
  </div>

  <button onClick={saveMapping} className="btn-primary">
    Save Mapping
  </button>
</div>
```

---

## Background Jobs

### Auto Token Refresh

**Runs daily to refresh expiring tokens:**

```typescript
// /lib/jobs/token-refresh.ts

export async function refreshExpiredTokens() {
  const connections = await IntegrationConnection.find({
    connected: true,
    tokenExpiry: { $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Expiring in 7 days
  });

  for (const connection of connections) {
    try {
      if (connection.provider === 'quickbooks') {
        const qb = new QuickBooksService(
          connection.accessToken,
          connection.refreshToken,
          connection.realmId
        );
        const newTokens = await qb.refreshToken();

        connection.accessToken = encrypt(newTokens.accessToken);
        connection.refreshToken = encrypt(newTokens.refreshToken);
        connection.tokenExpiry = newTokens.expiresAt;
        await connection.save();
      } else {
        // Xero refresh logic
      }
    } catch (error) {
      console.error(`Failed to refresh token for ${connection.provider}:`, error);
      // Notify admin
    }
  }
}
```

**Cron schedule:** Daily at 2 AM

---

## Error Handling & Retry Logic

### Sync Errors:

**Common Errors:**
1. **Customer not found** → Auto-create customer in QuickBooks/Xero
2. **Item not found** → Auto-create item
3. **Rate limit exceeded** → Retry with exponential backoff
4. **Invalid token** → Auto-refresh token, retry
5. **Duplicate invoice** → Skip, mark as synced

**Retry Strategy:**
```typescript
async function syncWithRetry(syncFunction, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await syncFunction();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Timeline (4-6 weeks)

### Week 1-2: QuickBooks Integration
- OAuth flow
- QuickBooks API wrapper
- Sync service (customers, invoices, payments)
- Database schema updates
- Settings UI

### Week 3-4: Xero Integration
- OAuth flow
- Xero API wrapper
- Sync service (customers, invoices, payments)
- Account mapping UI
- Sync history/logs

### Week 5: Testing & Polish
- End-to-end testing
- Error handling
- Token refresh automation
- Retry logic
- Admin documentation

### Week 6: Launch & Monitor
- Pilot with 3-5 tenants
- Monitor sync errors
- Gather feedback
- Fix bugs
- Rollout to all tenants

---

## Success Metrics

### Week 1 (Launch):
- 3+ tenants connected
- 50+ invoices synced
- 0 sync errors

### Month 1:
- 90% reduction in manual data entry
- 95%+ sync success rate
- 20+ hours saved per month
- 4.5+ admin satisfaction

### Month 3:
- 50% of tenants using integration
- 1,000+ invoices synced
- 99%+ uptime
- Accounting teams love it

---

## Security & Compliance

### Token Security:
- Access/refresh tokens encrypted at rest (AES-256)
- Stored in secure database (not in code)
- Auto-expire and refresh
- Never logged or exposed

### Data Privacy:
- Only sync data tenant authorized
- GDPR compliance (data export/delete)
- Audit logs for all sync operations

### API Rate Limits:
- QuickBooks: 500 requests/minute
- Xero: 60 requests/minute
- Implement exponential backoff
- Queue system for batch sync

---

**End of Feature #3 Plan**

After this, proceed to **Feature #4: Two-Way SMS Platform** for global customer communication.
