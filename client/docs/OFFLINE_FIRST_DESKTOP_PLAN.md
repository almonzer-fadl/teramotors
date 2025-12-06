# TeraMotors - Offline-First Desktop Architecture Plan

## 🎯 **Vision: Full-Featured Desktop App with Cloud Sync**

Complete offline functionality with automatic cloud synchronization when internet is available. Same multi-tenant architecture, same features, zero data loss.

---

## 📐 **Architecture Overview**

```
┌─────────────────────────────────────────────────┐
│         ELECTRON DESKTOP APP                    │
├─────────────────────────────────────────────────┤
│  UI Layer (Next.js Frontend)                    │
│  - Same React components                        │
│  - Same beautiful Apple-like design             │
│  - Sync status indicators                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Sync Manager (Bidirectional Sync)              │
│  - Detects online/offline                       │
│  - Queues changes when offline                  │
│  - Syncs when online                            │
│  - Conflict resolution                          │
│  - Retry logic                                  │
└─────────────────────────────────────────────────┘
         ↓                              ↓
┌──────────────────────┐    ┌──────────────────────┐
│  LOCAL DATABASE      │    │  CLOUD (When Online) │
│  PouchDB/RxDB        │←→  │  MongoDB Atlas       │
│  (Embedded NoSQL)    │    │  (Multi-tenant)      │
│                      │    │                      │
│  - Full CRUD offline │    │  - Full sync         │
│  - Multi-tenant      │    │  - Cloudinary        │
│  - Fast queries      │    │  - WhatsApp          │
│  - Auto-indexed      │    │  - ZATCA             │
│  - Local first       │    │  - External APIs     │
└──────────────────────┘    └──────────────────────┘
```

---

## ✅ **What Works OFFLINE (90% of Operations)**

### **Core Business Functions:**
1. ✅ **Customers** - Create, edit, view, search, delete
2. ✅ **Vehicles** - Full CRUD, service history viewing
3. ✅ **Job Cards** - Create, update status, add services/parts
4. ✅ **Inventory** - View stock, track usage, update quantities
5. ✅ **Services** - View catalog, pricing, manage services
6. ✅ **Inspections** - Conduct inspections, record conditions
7. ✅ **Estimates** - Generate, view, modify, print locally
8. ✅ **Invoices** - Create, view, print (local PDF generation)
9. ✅ **Payments** - Record cash/check payments
10. ✅ **Dashboard** - View all stats (from local data)
11. ✅ **Reports** - Generate Excel/PDF reports from local database
12. ✅ **Search** - Full-text search on local data
13. ✅ **Mechanics Management** - Full CRUD
14. ✅ **Appointment Scheduling** - View and create appointments

### **Queued Actions (Auto-sync when online):**
📤 **All changes stored locally and synced automatically:**
- New customers, vehicles, job cards
- Updated inventory quantities
- Completed inspections
- Generated invoices and estimates
- Payment records
- All CRUD operations

---

## ⚠️ **What Requires INTERNET (10% of Operations)**

### **External Services - Automatically Queued:**
1. ⚠️ **WhatsApp Messages** - Queued locally, sent when online
2. ⚠️ **Email Notifications** - Queued locally, sent when online
3. ⚠️ **File Uploads** (Cloudinary) - Cached locally, uploaded when online
4. ⚠️ **ZATCA E-Invoicing** - Queued, submitted when online
5. ⚠️ **Cloud Sync** - Bidirectional sync happens automatically
6. ⚠️ **Automatic Backups** - Cloud backup when online

**User Experience:**
```
❌ OFFLINE MODE:
"📤 WhatsApp message queued. Will send when online. (3 messages pending)"
"✅ Invoice saved locally. Will sync to cloud when online."
"💾 File cached locally. Will upload when online."

✅ ONLINE MODE:
"✅ WhatsApp message sent successfully!"
"✅ 5 changes synced to cloud."
"✅ All files uploaded to cloud storage."
```

---

## 🛠️ **Technology Stack**

### **Recommended Stack:**

```javascript
┌─────────────────────────────────────┐
│ FRONTEND                            │
│ - Electron (Desktop wrapper)        │
│ - Next.js 15 (React framework)      │
│ - TypeScript (Type safety)          │
│ - Tailwind CSS (Styling)            │
│ - Framer Motion (Animations)        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ LOCAL DATABASE                      │
│ Option 1: PouchDB (Recommended)     │
│ - NoSQL like MongoDB                │
│ - Built-in sync protocol            │
│ - Automatic conflict resolution     │
│ - 50KB size                         │
│                                     │
│ Option 2: RxDB (Advanced)           │
│ - Built on PouchDB                  │
│ - Reactive queries (RxJS)           │
│ - Better TypeScript support         │
│ - Schema validation                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SYNC LAYER                          │
│ - PouchDB Sync Protocol             │
│ - Custom sync server OR CouchDB     │
│ - Conflict resolution strategies    │
│ - Queue manager for external APIs   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CLOUD BACKEND (When Online)         │
│ - MongoDB Atlas (Multi-tenant)      │
│ - Next.js API Routes                │
│ - Cloudinary (File storage)         │
│ - WhatsApp API                      │
│ - Email Service (Resend)            │
│ - ZATCA Integration                 │
└─────────────────────────────────────┘
```

---

## 📋 **Implementation Plan: 10-12 Weeks**

### **Phase 1: Database Abstraction Layer (Week 1-2)**

#### **Create Universal Database Interface**

```typescript
// lib/database/adapter.ts
export interface DatabaseAdapter {
  // CRUD Operations
  create<T>(collection: string, data: Partial<T>): Promise<T>;
  findById<T>(collection: string, id: string): Promise<T | null>;
  find<T>(collection: string, query: Query): Promise<T[]>;
  findOne<T>(collection: string, query: Query): Promise<T | null>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<void>;

  // Bulk Operations
  bulkCreate<T>(collection: string, docs: Partial<T>[]): Promise<T[]>;
  bulkUpdate<T>(collection: string, updates: BulkUpdate[]): Promise<void>;

  // Query Operations
  count(collection: string, query: Query): Promise<number>;
  exists(collection: string, query: Query): Promise<boolean>;

  // Sync Operations
  startSync(): Promise<void>;
  stopSync(): Promise<void>;
  getSyncStatus(): SyncStatus;
  forceSyncNow(): Promise<SyncResult>;

  // Index Operations
  createIndex(collection: string, fields: string[]): Promise<void>;

  // Transaction Support
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}

// MongoDB Implementation
export class MongoDBAdapter implements DatabaseAdapter {
  private models: Map<string, Model>;

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const Model = this.models.get(collection);
    const doc = await Model.create(data);
    return doc.toObject();
  }

  // ... implement all methods using Mongoose
}

// PouchDB Implementation (for Electron)
export class PouchDBAdapter implements DatabaseAdapter {
  private dbs: Map<string, PouchDB.Database>;
  private syncHandlers: Map<string, PouchDB.Replication.Sync<{}>>;

  constructor(private tenantId: string) {
    this.initializeDatabases();
  }

  private initializeDatabases() {
    // Create separate PouchDB instance per collection
    // Namespaced by tenant for multi-tenant support
    const collections = [
      'customers', 'vehicles', 'job-cards', 'inventory',
      'services', 'inspections', 'estimates', 'invoices',
      'payments', 'users', 'appointments'
    ];

    collections.forEach(collection => {
      const dbName = `teramotors_${this.tenantId}_${collection}`;
      this.dbs.set(collection, new PouchDB(dbName));
    });
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const db = this.dbs.get(collection);
    const doc = {
      ...data,
      _id: data._id || `${collection}_${Date.now()}_${Math.random()}`,
      tenantId: this.tenantId,
      _syncStatus: navigator.onLine ? 'synced' : 'pending',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };

    const result = await db.put(doc);
    return { ...doc, _rev: result.rev } as T;
  }

  async find<T>(collection: string, query: Query): Promise<T[]> {
    const db = this.dbs.get(collection);

    // Convert MongoDB-style query to PouchDB Mango query
    const mangoQuery = this.convertToMangoQuery(query);

    const result = await db.find({
      selector: {
        tenantId: this.tenantId,
        ...mangoQuery.selector
      },
      sort: mangoQuery.sort,
      limit: mangoQuery.limit,
      skip: mangoQuery.skip
    });

    return result.docs as T[];
  }

  async startSync(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Offline - sync paused');
      return;
    }

    this.dbs.forEach((db, collection) => {
      const remoteURL = `${process.env.SYNC_SERVER_URL}/${this.tenantId}_${collection}`;

      const syncHandler = db.sync(remoteURL, {
        live: true,
        retry: true,
        filter: (doc: any) => doc.tenantId === this.tenantId
      });

      syncHandler.on('change', (info) => {
        console.log(`✅ Synced ${collection}:`, info);
        this.updateSyncStatus(collection, 'synced');
      });

      syncHandler.on('error', (err) => {
        console.error(`❌ Sync error ${collection}:`, err);
        this.updateSyncStatus(collection, 'error');
      });

      this.syncHandlers.set(collection, syncHandler);
    });
  }

  // ... implement remaining methods
}
```

#### **Environment Detection & Initialization**

```typescript
// lib/database/index.ts
import { MongoDBAdapter } from './mongodb-adapter';
import { PouchDBAdapter } from './pouchdb-adapter';
import type { DatabaseAdapter } from './adapter';

let dbInstance: DatabaseAdapter | null = null;

export async function initializeDatabase(tenantId: string): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance;

  // Detect environment
  const isElectron = typeof window !== 'undefined' && window.process?.type;

  if (isElectron) {
    console.log('🖥️  Initializing PouchDB (Electron)');
    dbInstance = new PouchDBAdapter(tenantId);
    await dbInstance.startSync();
  } else {
    console.log('☁️  Initializing MongoDB (Web)');
    dbInstance = new MongoDBAdapter(tenantId);
  }

  return dbInstance;
}

export async function getDatabase(): Promise<DatabaseAdapter> {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return dbInstance;
}
```

---

### **Phase 2: Data Models Migration (Week 3-4)**

#### **Convert Mongoose Models to Universal Schema**

```typescript
// lib/database/schemas/customer.schema.ts
export interface Customer {
  _id: string;
  _rev?: string;  // PouchDB revision
  tenantId: string;

  // Original fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;

  // Sync metadata
  _syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  _lastSynced?: string;
  _conflictVersions?: Customer[];

  // Timestamps
  _createdAt: string;
  _updatedAt: string;
}

// PouchDB/RxDB Schema (for validation)
export const customerRxSchema = {
  version: 0,
  primaryKey: '_id',
  type: 'object',
  properties: {
    _id: { type: 'string', maxLength: 100 },
    tenantId: { type: 'string', maxLength: 100 },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    address: { type: 'string' },
    city: { type: 'string' },
    _syncStatus: {
      type: 'string',
      enum: ['synced', 'pending', 'conflict', 'error']
    },
    _lastSynced: { type: 'string', format: 'date-time' },
    _createdAt: { type: 'string', format: 'date-time' },
    _updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['_id', 'tenantId', 'firstName', 'lastName'],
  indexes: ['tenantId', 'email', '_syncStatus']
};

// Helper to convert Mongoose model to universal schema
export function fromMongooseModel(mongooseDoc: any): Customer {
  return {
    _id: mongooseDoc._id.toString(),
    tenantId: mongooseDoc.tenantId.toString(),
    firstName: mongooseDoc.firstName,
    lastName: mongooseDoc.lastName,
    email: mongooseDoc.email,
    phone: mongooseDoc.phone,
    address: mongooseDoc.address,
    city: mongooseDoc.city,
    _createdAt: mongooseDoc.createdAt.toISOString(),
    _updatedAt: mongooseDoc.updatedAt.toISOString(),
  };
}
```

#### **Repeat for All Models:**
- Customer ✓
- Vehicle
- JobCard
- Part (Inventory)
- Service
- VehicleInspection
- Estimate
- Invoice
- Payment
- User
- Appointment
- InspectionTemplate
- Mechanic
- (15+ models total)

---

### **Phase 3: Sync Manager Implementation (Week 5-6)**

#### **Bidirectional Sync System**

```typescript
// lib/sync/SyncManager.ts
export class SyncManager {
  private adapters: Map<string, DatabaseAdapter>;
  private syncStatus: Map<string, SyncStatus>;
  private syncInterval: NodeJS.Timeout | null = null;
  private onlineListener: () => void;
  private offlineListener: () => void;

  constructor(private tenantId: string) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for online/offline events
    this.onlineListener = () => {
      console.log('🌐 Connection restored - starting sync');
      this.syncNow();
    };

    this.offlineListener = () => {
      console.log('📴 Connection lost - pausing sync');
      this.pauseSync();
    };

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);
  }

  async startContinuousSync() {
    if (!navigator.onLine) {
      console.log('Offline - sync will start when online');
      return;
    }

    // Initial sync
    await this.syncNow();

    // Continuous sync every 30 seconds
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncNow();
      }
    }, 30000);
  }

  async syncNow(): Promise<SyncResult> {
    console.log('🔄 Starting sync...');
    const results: SyncResult = {
      success: [],
      failed: [],
      conflicts: [],
      totalSynced: 0
    };

    // Sync each collection
    const collections = [
      'customers', 'vehicles', 'job-cards', 'inventory',
      'services', 'inspections', 'estimates', 'invoices'
    ];

    for (const collection of collections) {
      try {
        const result = await this.syncCollection(collection);
        results.success.push({ collection, count: result.count });
        results.totalSynced += result.count;
      } catch (error) {
        results.failed.push({ collection, error: error.message });
      }
    }

    // Process queue for external services
    await this.processExternalQueue();

    console.log('✅ Sync complete:', results);
    return results;
  }

  private async syncCollection(collection: string): Promise<{ count: number }> {
    const db = await getDatabase();

    // Get all pending documents
    const pending = await db.find(collection, {
      _syncStatus: 'pending'
    });

    if (pending.length === 0) {
      return { count: 0 };
    }

    // Push to cloud
    for (const doc of pending) {
      try {
        await this.pushToCloud(collection, doc);

        // Update sync status
        await db.update(collection, doc._id, {
          _syncStatus: 'synced',
          _lastSynced: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to sync ${collection}/${doc._id}:`, error);
        await db.update(collection, doc._id, {
          _syncStatus: 'error'
        });
      }
    }

    // Pull from cloud (get updates)
    await this.pullFromCloud(collection);

    return { count: pending.length };
  }

  private async pushToCloud(collection: string, doc: any): Promise<void> {
    const response = await fetch(`${process.env.SYNC_API_URL}/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(doc)
    });

    if (!response.ok) {
      throw new Error(`Failed to push: ${response.statusText}`);
    }
  }

  private async pullFromCloud(collection: string): Promise<void> {
    const db = await getDatabase();
    const lastSync = await this.getLastSyncTime(collection);

    const response = await fetch(
      `${process.env.SYNC_API_URL}/${collection}?since=${lastSync}&tenantId=${this.tenantId}`,
      {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to pull: ${response.statusText}`);
    }

    const updates = await response.json();

    // Apply updates to local database
    for (const update of updates) {
      const existing = await db.findById(collection, update._id);

      if (!existing) {
        // New document from cloud
        await db.create(collection, update);
      } else {
        // Check for conflicts
        if (existing._syncStatus === 'pending') {
          // Local changes pending - conflict!
          await this.handleConflict(collection, existing, update);
        } else {
          // No conflict - update local
          await db.update(collection, update._id, update);
        }
      }
    }
  }

  private async handleConflict(
    collection: string,
    local: any,
    remote: any
  ): Promise<void> {
    console.warn('⚠️  Conflict detected:', collection, local._id);

    // Conflict resolution strategies:

    // Strategy 1: Server wins (default)
    await getDatabase().update(collection, local._id, {
      ...remote,
      _syncStatus: 'synced',
      _conflictVersions: [local] // Store local version for recovery
    });

    // Strategy 2: Client wins
    // Keep local, mark as pending to re-sync

    // Strategy 3: Merge fields
    // const merged = this.mergeDocuments(local, remote);
    // await db.update(collection, local._id, merged);

    // Strategy 4: Ask user (show conflict UI)
    // this.showConflictDialog(local, remote);
  }

  private async processExternalQueue(): Promise<void> {
    // Process queued WhatsApp, Email, File uploads
    const queue = await getDatabase().find('_queue', {
      status: 'pending'
    });

    for (const item of queue) {
      try {
        if (item.type === 'whatsapp') {
          await this.sendWhatsApp(item.data);
        } else if (item.type === 'email') {
          await this.sendEmail(item.data);
        } else if (item.type === 'file') {
          await this.uploadFile(item.data);
        } else if (item.type === 'zatca') {
          await this.submitZATCA(item.data);
        }

        // Mark as completed
        await getDatabase().update('_queue', item._id, {
          status: 'completed',
          completedAt: new Date().toISOString()
        });
      } catch (error) {
        // Mark as failed, will retry next sync
        await getDatabase().update('_queue', item._id, {
          status: 'failed',
          error: error.message,
          retryCount: (item.retryCount || 0) + 1
        });
      }
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('online', this.onlineListener);
    window.removeEventListener('offline', this.offlineListener);
  }
}
```

---

### **Phase 4: Queue Manager for External Services (Week 7)**

```typescript
// lib/sync/QueueManager.ts
export class QueueManager {
  private queueDB: PouchDB.Database;

  constructor(private tenantId: string) {
    this.queueDB = new PouchDB(`teramotors_${tenantId}_queue`);
  }

  async queueWhatsApp(message: WhatsAppMessage): Promise<void> {
    await this.queueDB.put({
      _id: `whatsapp_${Date.now()}_${Math.random()}`,
      type: 'whatsapp',
      status: 'pending',
      data: message,
      tenantId: this.tenantId,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });

    // Try immediate send if online
    if (navigator.onLine) {
      await this.processQueue();
    } else {
      this.showQueueNotification('WhatsApp message queued. Will send when online.');
    }
  }

  async queueEmail(email: EmailMessage): Promise<void> {
    await this.queueDB.put({
      _id: `email_${Date.now()}_${Math.random()}`,
      type: 'email',
      status: 'pending',
      data: email,
      tenantId: this.tenantId,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });

    if (navigator.onLine) {
      await this.processQueue();
    } else {
      this.showQueueNotification('Email queued. Will send when online.');
    }
  }

  async queueFileUpload(file: File, metadata: FileMetadata): Promise<string> {
    // Store file in IndexedDB (larger storage)
    const fileId = `file_${Date.now()}_${Math.random()}`;
    await this.storeFileLocally(fileId, file);

    await this.queueDB.put({
      _id: fileId,
      type: 'file',
      status: 'pending',
      data: {
        fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        metadata
      },
      tenantId: this.tenantId,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });

    if (navigator.onLine) {
      await this.processQueue();
    } else {
      this.showQueueNotification('File cached. Will upload when online.');
    }

    return fileId; // Return temp ID for immediate UI update
  }

  async queueZATCA(invoiceData: ZATCAInvoice): Promise<void> {
    await this.queueDB.put({
      _id: `zatca_${Date.now()}_${Math.random()}`,
      type: 'zatca',
      status: 'pending',
      data: invoiceData,
      tenantId: this.tenantId,
      createdAt: new Date().toISOString(),
      retryCount: 0
    });

    if (navigator.onLine) {
      await this.processQueue();
    } else {
      this.showQueueNotification('ZATCA submission queued. Will submit when online.');
    }
  }

  async processQueue(): Promise<QueueProcessResult> {
    const result = { processed: 0, failed: 0, pending: 0 };

    const pending = await this.queueDB.find({
      selector: {
        status: 'pending',
        tenantId: this.tenantId
      },
      limit: 50 // Process in batches
    });

    for (const item of pending.docs) {
      try {
        if (item.type === 'whatsapp') {
          await sendWhatsAppAPI(item.data);
        } else if (item.type === 'email') {
          await sendEmailAPI(item.data);
        } else if (item.type === 'file') {
          const file = await this.retrieveFileLocally(item.data.fileId);
          await uploadToCloudinary(file, item.data.metadata);
          await this.deleteFileLocally(item.data.fileId);
        } else if (item.type === 'zatca') {
          await submitToZATCA(item.data);
        }

        // Mark as completed
        await this.queueDB.put({
          ...item,
          status: 'completed',
          completedAt: new Date().toISOString()
        });

        result.processed++;
      } catch (error) {
        console.error(`Failed to process queue item ${item._id}:`, error);

        // Increment retry count
        const newRetryCount = (item.retryCount || 0) + 1;

        // Give up after 5 retries
        if (newRetryCount >= 5) {
          await this.queueDB.put({
            ...item,
            status: 'failed_permanent',
            error: error.message,
            retryCount: newRetryCount,
            failedAt: new Date().toISOString()
          });
        } else {
          await this.queueDB.put({
            ...item,
            status: 'failed',
            error: error.message,
            retryCount: newRetryCount
          });
        }

        result.failed++;
      }
    }

    // Count remaining pending
    const remaining = await this.queueDB.find({
      selector: { status: 'pending' },
      limit: 1
    });
    result.pending = remaining.docs.length;

    return result;
  }

  async getQueueStats(): Promise<QueueStats> {
    const stats = await Promise.all([
      this.queueDB.find({ selector: { status: 'pending' } }),
      this.queueDB.find({ selector: { status: 'failed' } }),
      this.queueDB.find({ selector: { status: 'completed' } })
    ]);

    return {
      pending: stats[0].docs.length,
      failed: stats[1].docs.length,
      completed: stats[2].docs.length,
      total: stats[0].docs.length + stats[1].docs.length + stats[2].docs.length
    };
  }

  private showQueueNotification(message: string) {
    // Show toast notification
    toast.info(message, {
      icon: '📤',
      duration: 3000
    });
  }
}
```

---

### **Phase 5: API Routes Update (Week 8-9)**

#### **Modify All API Routes to Use Database Adapter**

```typescript
// app/api/customers/route.ts
import { getDatabase } from '@/lib/database';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession(request);
  const db = await getDatabase();

  const customers = await db.find('customers', {
    tenantId: session.tenantId
  });

  return Response.json({ customers });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  const db = await getDatabase();
  const data = await request.json();

  const customer = await db.create('customers', {
    ...data,
    tenantId: session.tenantId
  });

  return Response.json({ customer });
}

// app/api/customers/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);
  const db = await getDatabase();

  const customer = await db.findById('customers', params.id);

  if (!customer || customer.tenantId !== session.tenantId) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ customer });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);
  const db = await getDatabase();
  const data = await request.json();

  const customer = await db.update('customers', params.id, data);

  return Response.json({ customer });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);
  const db = await getDatabase();

  await db.delete('customers', params.id);

  return Response.json({ success: true });
}
```

**Repeat for all API routes:**
- Customers ✓
- Vehicles
- Job Cards
- Inventory
- Services
- Inspections
- Estimates
- Invoices
- Payments
- (15+ route groups)

---

### **Phase 6: UI Components Update (Week 10)**

#### **Sync Status Indicator**

```tsx
// components/SyncStatusIndicator.tsx
'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getSyncManager } from '@/lib/sync/SyncManager';
import { getQueueManager } from '@/lib/sync/QueueManager';

export function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [queueStats, setQueueStats] = useState({ pending: 0, failed: 0 });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Monitor online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update queue stats every 5 seconds
    const interval = setInterval(async () => {
      const queueManager = await getQueueManager();
      const stats = await queueManager.getQueueStats();
      setQueueStats({ pending: stats.pending, failed: stats.failed });
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      const syncManager = await getSyncManager();
      await syncManager.syncNow();
      setSyncStatus('synced');
      setLastSyncTime(new Date());

      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync failed:', error);
    }
  };

  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Online/Offline Status */}
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Offline</span>
          </>
        )}
      </div>

      {/* Sync Status */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      <div className="flex items-center space-x-2">
        {syncStatus === 'syncing' && (
          <>
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Syncing...</span>
          </>
        )}
        {syncStatus === 'synced' && (
          <>
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Synced</span>
          </>
        )}
        {syncStatus === 'error' && (
          <>
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Sync Error</span>
          </>
        )}
        {syncStatus === 'idle' && queueStats.pending > 0 && (
          <>
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {queueStats.pending} pending
            </span>
          </>
        )}
      </div>

      {/* Manual Sync Button */}
      {isOnline && (
        <>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <button
            onClick={handleManualSync}
            disabled={syncStatus === 'syncing'}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors disabled:opacity-50"
          >
            Sync Now
          </button>
        </>
      )}

      {/* Last Sync Time */}
      {lastSyncTime && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(lastSyncTime)} ago
        </span>
      )}
    </div>
  );
}
```

#### **Add to Dashboard Layout**

```tsx
// app/(dashboard)/layout.tsx
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header className="sticky top-0 z-50">
        {/* ... existing header content ... */}

        {/* Add Sync Status Indicator */}
        <div className="flex items-center justify-end px-4 py-2">
          <SyncStatusIndicator />
        </div>
      </header>

      {children}
    </div>
  );
}
```

#### **Offline Mode Banner**

```tsx
// components/OfflineModeBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { WifiOff, X } from 'lucide-react';

export function OfflineModeBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false); // Show banner when going offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 dark:bg-orange-500 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <WifiOff className="w-5 h-5" />
          <div>
            <p className="font-semibold">You're currently offline</p>
            <p className="text-sm text-orange-100">
              You can continue working. Changes will sync automatically when you're back online.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

---

### **Phase 7: Testing & Optimization (Week 11-12)**

#### **Test Scenarios:**

1. **Offline CRUD Operations**
   - Create customer while offline
   - Edit vehicle while offline
   - Delete service while offline
   - Verify local database updates

2. **Sync After Coming Online**
   - Go offline, make 10 changes
   - Come back online
   - Verify all changes sync to cloud
   - Check cloud database has all changes

3. **Conflict Resolution**
   - Edit same customer on two devices
   - Force conflict scenario
   - Verify conflict resolution strategy works

4. **Queue Processing**
   - Send WhatsApp while offline (queued)
   - Upload file while offline (cached)
   - Come online and verify queue processes

5. **Multi-tenant Isolation**
   - Create data for Tenant A
   - Switch to Tenant B
   - Verify Tenant B can't see Tenant A's data
   - Verify separate local databases per tenant

6. **Performance Testing**
   - Load 1000+ customers in local DB
   - Test query performance
   - Test sync performance
   - Measure app startup time

7. **Error Handling**
   - Network interruption during sync
   - Invalid data scenarios
   - Storage quota exceeded
   - Sync server unavailable

---

## 📊 **Complexity & Effort Assessment**

| Phase | Difficulty | Time (Solo) | Dependencies |
|-------|-----------|-------------|--------------|
| Database Abstraction Layer | 6/10 | 2 weeks | None |
| Data Models Migration | 7/10 | 2 weeks | Phase 1 |
| Sync Manager Implementation | 8/10 | 2 weeks | Phases 1-2 |
| Queue Manager | 6/10 | 1 week | Phases 1-3 |
| API Routes Update | 5/10 | 2 weeks | Phases 1-4 |
| UI Components Update | 4/10 | 1 week | Phases 1-5 |
| Testing & Optimization | 7/10 | 2 weeks | All phases |
| **TOTAL** | **7.5/10** | **12 weeks** | Sequential |

---

## 🎯 **Success Criteria**

### **Functionality:**
- ✅ All CRUD operations work offline
- ✅ Automatic sync when online
- ✅ Queue system works for external services
- ✅ Conflict resolution handles edge cases
- ✅ Multi-tenant isolation maintained
- ✅ No data loss in any scenario

### **Performance:**
- ✅ Local queries < 100ms
- ✅ App startup < 3 seconds
- ✅ Sync completes in < 30 seconds for typical changes
- ✅ UI remains responsive during sync

### **User Experience:**
- ✅ Clear online/offline indicators
- ✅ Queue status visible to users
- ✅ Smooth transitions between online/offline
- ✅ No errors when offline
- ✅ Helpful messages about queued actions

---

## 💡 **Incremental Implementation Strategy (RECOMMENDED)**

### **Instead of 12 weeks all-at-once, do it module by module:**

#### **Phase 1: Proof of Concept (Weeks 1-2)**
- ✅ Implement for **Customers only**
- ✅ Test offline CRUD
- ✅ Test sync when coming online
- ✅ Validate entire approach
- ✅ Get user feedback

**Decision Point:** If PoC succeeds, continue. If issues, pivot approach.

#### **Phase 2: Core Business Modules (Weeks 3-6)**
- ✅ Vehicles
- ✅ Job Cards
- ✅ Inventory
- ✅ Services
- ✅ Inspections

**Result:** 80% of daily operations work offline

#### **Phase 3: Financial Modules (Weeks 7-9)**
- ✅ Estimates
- ✅ Invoices
- ✅ Payments

**Result:** Complete business workflow available offline

#### **Phase 4: External Services Queue (Weeks 10-11)**
- ✅ WhatsApp queue
- ✅ Email queue
- ✅ File upload queue
- ✅ ZATCA queue

**Result:** All external services queued and processed

#### **Phase 5: Polish & Testing (Week 12)**
- ✅ Comprehensive testing
- ✅ UI polish
- ✅ Documentation
- ✅ Performance optimization

---

## 🚀 **Business Value & Market Impact**

### **Target Markets This Opens:**

1. **🎯 Remote/Rural Workshops**
   - Unreliable internet connectivity
   - Need full offline functionality
   - Large untapped market
   - Higher willingness to pay for offline capability

2. **🎯 Developing Countries**
   - Poor internet infrastructure
   - Expensive/limited data plans
   - Growing automotive market
   - First-mover advantage

3. **🎯 Mobile Mechanics**
   - Field service operations
   - Work at customer locations
   - No reliable connectivity
   - Premium feature for mobile workforce

4. **🎯 Enterprise/Corporate**
   - Data sovereignty requirements
   - Want data on-premises
   - Regulatory compliance needs
   - Security-conscious organizations

### **Competitive Advantages:**

- ✅ **First-to-market** with true offline capability
- ✅ **99.9% uptime** (works without internet)
- ✅ **Better performance** (local-first queries)
- ✅ **Data ownership** (customer controls their data)
- ✅ **Disaster recovery** (local backup always available)

---

## 📦 **Recommended Tech Stack Summary**

```
FRONTEND:
✅ Electron (Desktop wrapper)
✅ Next.js 15 (Same codebase as web)
✅ TypeScript (Type safety)
✅ Tailwind CSS (Modern styling)
✅ Framer Motion (Animations)

LOCAL DATABASE:
✅ PouchDB (Primary recommendation)
   - NoSQL like MongoDB
   - Built-in sync
   - 50KB size
   - Battle-tested

OR

✅ RxDB (Advanced option)
   - Built on PouchDB
   - Reactive queries
   - Better TypeScript support

SYNC LAYER:
✅ PouchDB Sync Protocol
✅ Custom sync server
✅ Conflict resolution strategies
✅ Queue manager

CLOUD BACKEND:
✅ MongoDB Atlas (When online)
✅ Next.js API Routes
✅ Cloudinary (Files)
✅ WhatsApp API
✅ ZATCA Integration
```

---

## 📋 **Next Steps**

### **Immediate Actions:**

1. **Review this plan** - Understand scope and effort
2. **Decide on approach:**
   - Full 12-week implementation?
   - Incremental 2-week PoC first?
   - Which modules are highest priority?

3. **Get stakeholder buy-in:**
   - Business team approval
   - Timeline expectations
   - Resource allocation

4. **Technical preparation:**
   - Set up development environment
   - Install PouchDB dependencies
   - Create test databases
   - Design database schemas

### **Week 1 Tasks:**
- [ ] Set up PouchDB in development environment
- [ ] Create database adapter interface
- [ ] Implement PouchDB adapter for Customers
- [ ] Create sync manager skeleton
- [ ] Build Customers PoC

---

## 🎯 **Final Recommendation**

**Difficulty:** 7.5/10 (Challenging but achievable)
**Timeline:** 12 weeks full implementation OR 2 weeks PoC
**Business Value:** **EXTREMELY HIGH** - Game-changing feature

**This is worth doing** because:
1. ✅ Massive competitive advantage
2. ✅ Opens new markets (rural, international)
3. ✅ Better user experience (fast, reliable)
4. ✅ Data sovereignty (customers own their data)
5. ✅ Future-proofs the application

**Start with 2-week PoC on Customers module** to validate approach, then roll out incrementally.

---

**Status:** Ready for approval and implementation
**Priority:** High (strategic feature)
**Risk Level:** Medium (well-defined approach, proven tech stack)
