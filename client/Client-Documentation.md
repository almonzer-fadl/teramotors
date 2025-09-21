# Auto Repair Shop Management System 🚗

A comprehensive web application for managing auto repair shop operations with ZATCA compliance for Saudi Arabia.

## 🎯 Project Overview (MVP Focus)

**Goal:** Build a complete auto repair shop management system for a single workshop with ZATCA compliance.
**Timeline:** 3-4 months (MVP launch when shop opens)
**Approach:** Focus on core business functions and legal compliance
**Purpose:** Professional workshop management with ZATCA e-invoicing compliance

**Platform:** Web application only (MVP)
**Business Model:** Single workshop application with ZATCA compliance

### Core Concept (MVP)
A web-based system that handles essential auto repair shop operations:
- Customer and vehicle management
- Service estimates and ZATCA-compliant invoicing
- Appointment scheduling
- Parts inventory tracking
- Job progress monitoring
- Vehicle inspection system
- Real-time updates and notifications
- ZATCA e-invoicing compliance (Saudi Arabia legal requirement)

---

## 🏗️ Technical Architecture (MVP)

### Frontend
- **Framework:** Next.js 15 with App Router
- **UI:** React 19 + Tailwind CSS + Shadcn/ui
- **State Management:** Zustand (lightweight, TypeScript-friendly)
- **Real-time:** Socket.io client
- **Language:** TypeScript (better type safety and IDE support)

### Backend (Express.js Server)
- **Server:** Express.js with dedicated backend
- **Database:** MongoDB Atlas (cloud database)
- **Real-time:** Socket.io server
- **Authentication:** JWT tokens with bcrypt
- **File Storage:** Multer for file uploads
- **ZATCA Compliance:** Custom implementation for Saudi e-invoicing

### Additional Tools (MVP Focus)
- **PDF Generation:** React-PDF (for invoices, estimates)
- **Date/Time:** Day.js (lightweight alternative to Moment.js)
- **Form Handling:** React Hook Form + Zod validation
- **Charts:** Recharts (for analytics dashboard)
- **Email:** Nodemailer (for notifications, reminders)
- **ZATCA Libraries:** QR code generation, XML processing, digital signatures

---

## 🗄️ Domain & Data Model

### Core Entities

#### **User Management**
```javascript
// User Schema
{
  _id: ObjectId,
  email: String, // unique, required
  password: String, // hashed
  firstName: String,
  lastName: String,
  role: String, // 'admin', 'mechanic', 'customer'
  phone: String,
  isActive: Boolean,
  emailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Customer Management**
```javascript
// Customer Schema
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Vehicle Management**
```javascript
// Vehicle Schema
{
  _id: ObjectId,
  customerId: ObjectId, // ref: Customer
  vin: String, // unique, required
  make: String,
  model: String,
  year: Number,
  color: String,
  licensePlate: String,
  mileage: Number,
  engineType: String,
  transmission: String,
  fuelType: String,
  photos: [String], // Cloudinary URLs
  serviceHistory: [{
    serviceId: ObjectId, // ref: Service
    date: Date,
    mileage: Number,
    cost: Number,
    notes: String
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Service Management**
```javascript
// Service Schema
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String, // 'engine', 'transmission', 'brakes', 'electrical', etc.
  laborHours: Number,
  laborRate: Number,
  partsRequired: [{
    partId: ObjectId, // ref: Part
    quantity: Number,
    cost: Number
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Appointment System**
```javascript
// Appointment Schema
{
  _id: ObjectId,
  customerId: ObjectId, // ref: Customer
  vehicleId: ObjectId, // ref: Vehicle
  mechanicId: ObjectId, // ref: User
  serviceId: ObjectId, // ref: Service
  appointmentDate: Date,
  startTime: String,
  endTime: String,
  status: String, // 'scheduled', 'in-progress', 'completed', 'cancelled'
  notes: String,
  estimatedCost: Number,
  actualCost: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Job Management**
```javascript
// Job Schema
{
  _id: ObjectId,
  appointmentId: ObjectId, // ref: Appointment
  customerId: ObjectId, // ref: Customer
  vehicleId: ObjectId, // ref: Vehicle
  mechanicId: ObjectId, // ref: User
  status: String, // 'pending', 'in-progress', 'completed', 'cancelled'
  priority: String, // 'low', 'medium', 'high', 'urgent'
  estimatedStartTime: Date,
  estimatedEndTime: Date,
  actualStartTime: Date,
  actualEndTime: Date,
  laborHours: Number,
  partsUsed: [{
    partId: ObjectId, // ref: Part
    quantity: Number,
    cost: Number
  }],
  notes: String,
  photos: [String], // Cloudinary URLs
  createdAt: Date,
  updatedAt: Date
}
```

#### **Estimate System**
```javascript
// Estimate Schema
{
  _id: ObjectId,
  customerId: ObjectId, // ref: Customer
  vehicleId: ObjectId, // ref: Vehicle
  services: [{
    serviceId: ObjectId, // ref: Service
    quantity: Number,
    laborCost: Number,
    partsCost: Number,
    totalCost: Number
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: String, // 'draft', 'sent', 'accepted', 'rejected', 'expired'
  validUntil: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Parts Inventory**
```javascript
// Part Schema
{
  _id: ObjectId,
  partNumber: String, // unique
  name: String,
  description: String,
  category: String,
  manufacturer: String,
  compatibleVehicles: [String], // VIN patterns or make/model/year
  cost: Number,
  sellingPrice: Number,
  stockQuantity: Number,
  minStockLevel: Number,
  location: String, // warehouse location
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Design

### RESTful API Endpoints

#### **Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/verify-email
```

#### **Customer Management**
```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/vehicles
GET    /api/customers/:id/history
```

#### **Vehicle Management**
```
GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
GET    /api/vehicles/:id/service-history
POST   /api/vehicles/:id/photos
```

#### **Service Management**
```
GET    /api/services
POST   /api/services
GET    /api/services/:id
PUT    /api/services/:id
DELETE /api/services/:id
GET    /api/services/categories
```

#### **Appointment System**
```
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
GET    /api/appointments/calendar
GET    /api/appointments/available-slots
```

#### **Job Management**
```
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id
DELETE /api/jobs/:id
PUT    /api/jobs/:id/status
POST   /api/jobs/:id/photos
```

#### **Estimates**
```
GET    /api/estimates
POST   /api/estimates
GET    /api/estimates/:id
PUT    /api/estimates/:id
DELETE /api/estimates/:id
POST   /api/estimates/:id/send
POST   /api/estimates/:id/accept
POST   /api/estimates/:id/reject
```

#### **Parts Inventory**
```
GET    /api/parts
POST   /api/parts
GET    /api/parts/:id
PUT    /api/parts/:id
DELETE /api/parts/:id
GET    /api/parts/low-stock
POST   /api/parts/:id/adjust-stock
```

### API Response Format
```javascript
// Success Response
{
  success: true,
  data: {
    // Response data
  },
  message: "Operation completed successfully",
  timestamp: "2025-09-03T15:30:00Z"
}

// Error Response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input data",
    details: [
      {
        field: "email",
        message: "Email is required"
      }
    ]
  },
  timestamp: "2025-09-03T15:30:00Z"
}
```

---

## 🏛️ ZATCA E-Invoicing Compliance (CRITICAL)

### ZATCA Overview
ZATCA (Zakat, Tax and Customs Authority) requires all businesses in Saudi Arabia to implement e-invoicing. This system implements both Phase 1 and Phase 2 requirements.

### Phase 1 Implementation
- **QR Code Generation** - Generate QR codes for all invoices
- **Invoice Hash Calculation** - Calculate SHA-256 hash for invoice validation
- **Basic Compliance** - Ensure invoice format meets ZATCA standards

### Phase 2 Implementation
- **XML Generation** - Generate UBL XML format invoices
- **Digital Signatures** - Sign invoices with ZATCA certificates
- **API Submission** - Submit invoices to ZATCA servers
- **Compliance Monitoring** - Track submission status and handle errors

### ZATCA Integration
```javascript
// Invoice with ZATCA compliance
{
  _id: ObjectId,
  invoiceNumber: String,
  customerId: ObjectId,
  vehicleId: ObjectId,
  services: [{
    serviceId: ObjectId,
    quantity: Number,
    laborCost: Number,
    partsCost: Number,
    totalCost: Number
  }],
  subtotal: Number,
  vatAmount: Number, // 15% VAT for Saudi Arabia
  total: Number,
  // ZATCA Compliance Fields
  zatcaUUID: String,
  zatcaLongId: String,
  zatcaQRCode: String,
  zatcaStatus: String, // 'submitted', 'failed', 'pending'
  zatcaXML: String,
  zatcaHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### ZATCA API Endpoints
```
POST   /api/invoices/zatca/generate-qr
POST   /api/invoices/zatca/generate-xml
POST   /api/invoices/zatca/submit
GET    /api/invoices/zatca/status/:uuid
POST   /api/invoices/zatca/validate
```

---

## 🔐 Security Architecture (MVP Focus)

### Authentication & Authorization
- **JWT tokens** for session management
- **Role-based access control** (RBAC) - Admin, Mechanic, Inspector
- **Password hashing** with bcrypt
- **Session timeout** and automatic logout

### Data Protection (High Priority)
- **Password hashing** with bcrypt (12 rounds)
- **HTTPS encryption** in transit
- **Environment variables** for sensitive data
- **Input validation** with Joi schemas
- **SQL injection prevention** with Mongoose

### Security Best Practices (Critical)
- **API rate limiting** to prevent abuse
- **Input sanitization** to prevent XSS
- **CSRF protection** for forms
- **Security headers** with Helmet
- **ZATCA certificate security** for digital signatures

---

## 🎨 UI/UX Design Guidelines

### Design System
- **Color Palette:** Professional automotive theme
- **Typography:** Clear, readable fonts
- **Icons:** Lucide React icon set
- **Spacing:** Consistent 8px grid system
- **Components:** Shadcn/ui component library

### User Experience
- **Mobile-first** responsive design
- **Accessibility** compliance (WCAG 2.1)
- **Loading states** and error handling
- **Intuitive navigation** with breadcrumbs
- **Search and filtering** capabilities

### Dashboard Layout
- **Sidebar navigation** with role-based menu
- **Header** with user info and notifications
- **Main content area** with responsive grid
- **Footer** with system status and links

---

## 🧪 Testing Strategy

### Unit Testing
- **Jest** for unit tests
- **React Testing Library** for component tests
- **API route testing** with supertest
- **Database testing** with test database

### Integration Testing
- **End-to-end testing** with Playwright
- **API integration tests**
- **Database integration tests**
- **Authentication flow testing**

### Test Coverage Goals
- **Frontend components:** 80% coverage
- **API routes:** 90% coverage
- **Database models:** 85% coverage
- **Critical user flows:** 100% coverage

---

## 🚀 Deployment Strategy (MVP)

### Development Environment
- **Local development** with hot reload
- **Environment variables** management
- **Database seeding** for development data
- **ZATCA sandbox testing** for development

### Production Environment (MVP Focus)
- **Vercel deployment** for web application
- **MongoDB Atlas** for production database
- **Express.js backend** deployment
- **ZATCA production configuration** for live invoicing

### MVP Deployment Checklist
- **Environment Configuration** - Production environment variables
- **ZATCA Certificates** - Production certificates for digital signatures
- **Database Optimization** - Production database indexes
- **Security Hardening** - Production security measures
- **Monitoring Setup** - Basic monitoring and logging

---

## 📊 Performance Optimization (MVP Focus)

### Frontend Optimization
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image
- **Bundle analysis** and optimization
- **Lazy loading** for non-critical components

### Backend Optimization (High Priority)
- **Database indexing** for fast queries
- **Response compression** with gzip
- **API response optimization**
- **Connection pooling** for database
- **Query optimization** for better performance

### MVP Performance Goals
- **Page load time** < 3 seconds
- **API response time** < 500ms
- **Database query time** < 100ms
- **ZATCA submission time** < 5 seconds

---

## 📚 Complete Learning Resources

### Core Technologies Documentation

#### **Next.js 15**
- **Official Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **App Router Guide:** [nextjs.org/docs/app](https://nextjs.org/docs/app)
- **API Routes:** [nextjs.org/docs/app/building-your-application/routing/route-handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

#### **React 19**
- **Official Docs:** [react.dev](https://react.dev)
- **Hooks Reference:** [react.dev/reference/react](https://react.dev/reference/react)
- **State Management:** [react.dev/learn/managing-state](https://react.dev/learn/managing-state)

#### **TypeScript**
- **Official Handbook:** [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **TypeScript Playground:** [typescriptlang.org/play](https://www.typescriptlang.org/play)

#### **Tailwind CSS**
- **Official Docs:** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Tailwind Play:** [play.tailwindcss.com](https://play.tailwindcss.com)

#### **Shadcn/ui**
- **Official Site:** [ui.shadcn.com](https://ui.shadcn.com/)
- **Installation Guide:** [ui.shadcn.com/docs/installation](https://ui.shadcn.com/docs/installation)
- **Components:** [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)

#### **Zustand (State Management)**
- **GitHub:** [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
- **Documentation:** [github.com/pmndrs/zustand#documentation](https://github.com/pmndrs/zustand#documentation)

#### **MongoDB Atlas**
- **Official Docs:** [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com/)
- **MongoDB University:** [university.mongodb.com](https://university.mongodb.com/)

#### **NextAuth.js**
- **Official Docs:** [next-auth.js.org](https://next-auth.js.org/)
- **Configuration:** [next-auth.js.org/configuration](https://next-auth.js.org/configuration)

#### **Socket.io**
- **Official Docs:** [socket.io/docs](https://socket.io/docs)
- **Client API:** [socket.io/docs/v4/client-api](https://socket.io/docs/v4/client-api)

#### **Express.js**
- **Official Docs:** [expressjs.com](https://expressjs.com/)
- **Middleware Guide:** [expressjs.com/en/guide/using-middleware.html](https://expressjs.com/en/guide/using-middleware.html)

#### **ZATCA E-Invoicing**
- **ZATCA Official Portal:** [zatca.gov.sa](https://zatca.gov.sa)
- **E-Invoicing Guidelines:** [zatca.gov.sa/en/E-Invoicing](https://zatca.gov.sa/en/E-Invoicing)
- **GitHub ZATCA Libraries:** [github.com/topics/zatca](https://github.com/topics/zatca)
- **UBL XML Standards:** [docs.oasis-open.org/ubl](https://docs.oasis-open.org/ubl/)

#### **MongoDB & Mongoose**
- **MongoDB Atlas:** [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com/)
- **Mongoose Docs:** [mongoosejs.com/docs](https://mongoosejs.com/docs/)

---

## 🎯 **Vehicle Inspection System**

### **Core Inspection Features:**

#### **Inspection Templates**
- ✅ **Pre-built Templates** - Standard inspection checklists
- ✅ **Custom Templates** - Create shop-specific inspections
- ✅ **Category-based** - Engine, transmission, brakes, electrical, etc.
- ✅ **Vehicle-specific** - Different templates for different vehicle types

#### **Inspection Process**
- ✅ **Checklist Items** - Tick off each inspection point
- ✅ **Condition Ratings** - Good/Fair/Poor/Critical
- ✅ **Notes & Comments** - Detailed observations
- ✅ **Photo Documentation** - Upload photos of issues
- ✅ **Recommendations** - Suggested repairs and maintenance

#### **Integration with Estimates**
- ✅ **Auto-estimate Generation** - Convert findings to estimates
- ✅ **Condition-based Pricing** - Adjust prices based on condition
- ✅ **Priority Levels** - Critical/Safety/Recommended/Optional
- ✅ **Labor Time Calculation** - Auto-calculate labor based on findings

---

## 📝 **Data Models**

### **Inspection Template**
```javascript
{
  _id: ObjectId,
  name: String,
  category: String, // 'engine', 'transmission', 'brakes', etc.
  vehicleType: String, // 'sedan', 'suv', 'truck', etc.
  items: [{
    id: String,
    name: String,
    description: String,
    category: String,
    isRequired: Boolean,
    defaultCondition: String
  }],
  isActive: Boolean,
  createdAt: Date
}
```

### **Vehicle Inspection**
```javascript
{
  _id: ObjectId,
  vehicleId: ObjectId,
  customerId: ObjectId,
  mechanicId: ObjectId,
  templateId: ObjectId,
  inspectionDate: Date,
  mileage: Number,
  overallCondition: String, // 'excellent', 'good', 'fair', 'poor'
  items: [{
    itemId: String,
    condition: String, // 'good', 'fair', 'poor', 'critical'
    notes: String,
    photos: [String],
    recommendations: String,
    estimatedCost: Number,
    priority: String // 'critical', 'safety', 'recommended', 'optional'
  }],
  totalEstimatedCost: Number,
  recommendations: String,
  nextInspectionDate: Date,
  status: String, // 'in-progress', 'completed', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 **Inspection Workflow:**

### **1. Create Inspection**
- Select vehicle and customer
- Choose inspection template
- Start inspection process

### **2. Conduct Inspection**
- Go through checklist items
- Rate condition of each item
- Add notes and comments
- Take photos of issues
- Add recommendations

### **3. Generate Report**
- Create professional PDF report
- Include all findings and photos
- Add recommendations
- Calculate estimated costs

### **4. Convert to Estimate**
- Select items for repair
- Auto-calculate labor and parts
- Generate professional estimate
- Send to customer

---

## 💡 **Key Features:**

### **Inspection Templates:**
- **Engine Inspection** - Oil, belts, hoses, fluids
- **Brake Inspection** - Pads, rotors, lines, fluid
- **Electrical Inspection** - Battery, alternator, lights
- **Suspension Inspection** - Shocks, struts, bushings
- **Safety Inspection** - Comprehensive safety check

### **Condition Ratings:**
- **Good** - No issues, normal wear
- **Fair** - Minor wear, monitor
- **Poor** - Needs attention soon
- **Critical** - Immediate repair required

### **Photo Features:**
- **Multiple Photos** - Upload several photos per item
- **Photo Notes** - Add notes to specific photos
- **Photo Organization** - Organize by inspection item
- **Photo Reports** - Include photos in PDF reports

### **Integration Benefits:**
- **Accurate Estimates** - Based on actual condition
- **Professional Reports** - Detailed inspection documentation
- **Customer Trust** - Show photos of actual issues
- **Work Planning** - Mechanics can see what needs repair
- **History Tracking** - Complete vehicle condition history

---

## 🎯 **Why This is Important:**

1. **Professional Service** - Standard inspection process
2. **Customer Trust** - Show actual vehicle condition
3. **Accurate Estimates** - Based on real findings
4. **Work Planning** - Mechanics know what to expect
5. **Legal Protection** - Document vehicle condition
6. **Customer Education** - Show customers what needs repair

This inspection system will make your dad's shop look very professional and help customers understand exactly what needs to be repaired. It's a key differentiator from basic auto repair software!
