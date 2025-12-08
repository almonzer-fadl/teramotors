# 🤖 CLAUDE'S COMPREHENSIVE TESTING PLAN
## TeraMotors Multi-Tenant Auto Repair Shop SaaS - Automated/Code-Based Testing

**Branch:** `tenet`
**Total Pages:** 84 unique pages
**Total API Endpoints:** 140+ endpoints
**Testing Scope:** Every page, every feature, every button, every translation, every API call

---

## TESTING METHODOLOGY

I will systematically check:
1. ✅ **Code Quality** - TypeScript errors, unused imports, console logs
2. ✅ **API Functionality** - All endpoints working, proper error handling
3. ✅ **Data Models** - Schema validation, required fields, relationships
4. ✅ **Translations** - Missing translations, hardcoded text
5. ✅ **Component Issues** - Props validation, hooks usage, re-renders
6. ✅ **Route Protection** - Auth middleware, role guards, tenant isolation
7. ✅ **Business Logic** - Calculations, validations, state management
8. ✅ **Integration Points** - External services, webhooks, file uploads

---

## SECTION 1: AUTHENTICATION & AUTHORIZATION (6 Pages)

### 1.1 Auth Pages
- [ ] **Login Page** (`/(auth)/login`)
  - Check form validation (email, password required)
  - Test API call to `/api/auth/signin`
  - Verify redirect after successful login
  - Check error handling for invalid credentials
  - Verify "Remember Me" functionality
  - Check password visibility toggle
  - Test "Forgot Password" link navigation

- [ ] **Register Page** (`/(auth)/register`)
  - Check tenant registration form validation
  - Test API call to `/api/auth/register-tenant`
  - Verify unique tenant slug validation
  - Check password strength requirements
  - Verify email format validation
  - Test company info fields (name, slug, subdomain)
  - Check terms & conditions checkbox

- [ ] **Forgot Password** (`/(auth)/forgot-password`)
  - Check email validation
  - Test API call to `/api/auth/forgot-password`
  - Verify success message display
  - Check error handling for non-existent email

- [ ] **Reset Password** (`/(auth)/reset-password`)
  - Check token validation from URL params
  - Test new password validation
  - Verify password confirmation matching
  - Test API call to `/api/auth/reset-password`
  - Check redirect to login after success

- [ ] **Verify Email** (`/(auth)/verify-email`)
  - Check email verification token handling
  - Test API call to `/api/auth/verify-email`
  - Verify success/error states
  - Check redirect behavior

- [ ] **Auth Layout & Components**
  - Verify GlobalThemeHandler is working
  - Check RoleGuard component for route protection
  - Test browser detection warnings
  - Verify responsive design breakpoints

### 1.2 Auth API Endpoints
- [ ] `POST /api/auth/signin` - Login functionality
- [ ] `POST /api/auth/signout` - Logout and session cleanup
- [ ] `GET /api/auth/session` - Session retrieval
- [ ] `POST /api/auth/register-tenant` - Tenant registration
- [ ] `POST /api/auth/forgot-password` - Password reset request
- [ ] `POST /api/auth/reset-password` - Password reset confirmation
- [ ] `POST /api/auth/verify-email` - Email verification
- [ ] `POST /api/auth/request-verify` - Request verification email

**Hardcoded Text Check:**
- [ ] Search for hardcoded strings without translation keys
- [ ] Verify all button text uses i18n
- [ ] Check error messages are translated
- [ ] Verify placeholders are localized

---

## SECTION 2: MARKETING & PUBLIC PAGES (3 Pages)

### 2.1 Landing Pages
- [ ] **Main Landing Page** (`/`)
  - Check hero section animations
  - Verify CTA buttons functionality
  - Test "Get Started" flow
  - Check features section rendering
  - Verify pricing section (if exists)
  - Test footer links
  - Check mobile responsiveness
  - Verify LogoLoop animation component

- [ ] **Public Booking Page** (`/(marketing)/book/[slug]`)
  - Verify tenant slug resolution
  - Check BookingWizardModern component rendering
  - Test step navigation (inspection → datetime → customer → confirmation)
  - Verify InspectionTypeSelector displays templates
  - Check DateTimePicker calendar functionality
  - Test available slots API call
  - Verify time slot selection
  - Check CustomerForm validation
  - Test final booking submission
  - Verify RTL/LTR switching with language toggle
  - Check theme toggle functionality

- [ ] **Customer Portal Entry** (`/(marketing)/portal/[slug]`)
  - Verify tenant resolution by slug
  - Check redirect to login if not authenticated
  - Test dashboard display for logged-in customers
  - Verify stats cards (appointments, vehicles)
  - Check quick actions buttons open modals
  - Test appointments modal (AppointmentsContent)
  - Test vehicles modal (VehiclesContent)
  - Test profile modal (ProfileContent)
  - Verify "View All" links open modals
  - Check language switcher (EN/AR)
  - Test theme toggle

### 2.2 Customer Portal Login
- [ ] **Portal Login** (`/(marketing)/portal/[slug]/login`)
  - Check OTP request form
  - Test API call to `/api/portal/auth/request-otp`
  - Verify OTP input field (6 digits)
  - Test OTP verification API call `/api/portal/auth/verify-otp`
  - Check error handling (invalid OTP, expired)
  - Verify redirect to dashboard after login
  - Check resend OTP functionality

### 2.3 Public Booking APIs
- [ ] `GET /api/public/tenants/[slug]/booking-info` - Get tenant info
- [ ] `GET /api/public/tenants/[slug]/available-slots` - Time slots
- [ ] `POST /api/public/tenants/[slug]/book` - Create booking

### 2.4 Portal APIs
- [ ] `GET /api/portal/session` - Customer session
- [ ] `GET /api/portal/dashboard` - Dashboard data
- [ ] `GET /api/portal/profile` - Customer profile
- [ ] `PUT /api/portal/profile` - Update profile
- [ ] `GET /api/portal/vehicles` - Customer vehicles
- [ ] `POST /api/portal/vehicles` - Add vehicle
- [ ] `GET /api/portal/vehicles/[id]` - Vehicle details
- [ ] `PUT /api/portal/vehicles/[id]` - Update vehicle
- [ ] `DELETE /api/portal/vehicles/[id]` - Delete vehicle
- [ ] `GET /api/portal/appointments` - Customer appointments
- [ ] `POST /api/portal/appointments` - Book appointment
- [ ] `POST /api/portal/auth/request-otp` - Request OTP
- [ ] `POST /api/portal/auth/verify-otp` - Verify OTP
- [ ] `POST /api/portal/auth/logout` - Customer logout

**Translation & Hardcoded Text:**
- [ ] Check all marketing copy is in translation files
- [ ] Verify Arabic translations exist for all keys
- [ ] Check for hardcoded English text in components
- [ ] Verify button labels are translated
- [ ] Check form labels and placeholders

---

## SECTION 3: MAIN DASHBOARD (1 Page)

### 3.1 Dashboard Home
- [ ] **Main Dashboard** (`/(dashboard)/dashboard`)
  - Check stats cards rendering (revenue, appointments, active jobs, pending invoices)
  - Verify recent activity feed
  - Test quick action buttons
  - Check charts/graphs (if any - Recharts)
  - Verify API call to `/api/dashboard/stats`
  - Check role-based widget visibility
  - Test responsive layout
  - Verify loading states (SkeletonLoader)

### 3.2 Dashboard Layout Components
- [ ] **Sidebar Navigation**
  - Check all menu items render correctly
  - Verify active state highlighting
  - Test collapsed/expanded states
  - Check role-based menu visibility
  - Verify icons display correctly
  - Test mobile hamburger menu

- [ ] **Top Bar**
  - Check search functionality (global search)
  - Test notification bell
  - Verify user dropdown menu
  - Check theme toggle
  - Test language switcher
  - Verify tenant logo display

- [ ] **Mobile Navigation**
  - Check bottom nav bar on mobile
  - Verify touch interactions
  - Test navigation transitions

### 3.3 Dashboard API
- [ ] `GET /api/dashboard/stats` - Dashboard KPIs and metrics

---

## SECTION 4: CUSTOMER MANAGEMENT (4 Pages)

### 4.1 Customer Pages
- [ ] **Customers List** (`/(dashboard)/customers`)
  - Check table rendering with pagination
  - Verify search functionality (debounced)
  - Test filters (active, inactive, all)
  - Check "Add Customer" button navigation
  - Verify row actions (view, edit, delete)
  - Test sorting columns
  - Check empty state display
  - Verify export button (if exists)

- [ ] **New Customer** (`/(dashboard)/customers/new`)
  - Check CustomerForm component rendering
  - Verify all required fields marked
  - Test form validation (firstName, lastName, email, phone)
  - Check email format validation
  - Verify phone number validation
  - Test duplicate email detection
  - Check API call to `POST /api/customers`
  - Verify success message and redirect
  - Test error handling

- [ ] **Customer Details** (`/(dashboard)/customers/[id]`)
  - Check customer info display
  - Verify vehicles list for customer
  - Check appointments history
  - Verify job cards history
  - Test "Edit" button navigation
  - Check "Delete" button with confirmation
  - Verify invoice history tab

- [ ] **Edit Customer** (`/(dashboard)/customers/[id]/edit`)
  - Check form pre-populated with data
  - Verify API call to `GET /api/customers/[id]`
  - Test form validation
  - Check update API call `PUT /api/customers/[id]`
  - Verify success message
  - Test cancel button

### 4.2 Customer APIs
- [ ] `GET /api/customers` - List with pagination, search, filters
- [ ] `POST /api/customers` - Create customer with validation
- [ ] `GET /api/customers/[id]` - Get customer details
- [ ] `PUT /api/customers/[id]` - Update customer
- [ ] `DELETE /api/customers/[id]` - Delete customer (soft delete check)
- [ ] `POST /api/customers/[id]/notify` - Send notification
- [ ] `GET /api/customers/export` - Export to CSV/Excel
- [ ] `POST /api/customers/import` - Import from file

### 4.3 Customer Components
- [ ] **CustomerForm.tsx**
  - Verify react-hook-form integration
  - Check Zod validation schema
  - Test all input fields
  - Verify error messages display
  - Check floating labels animation
  - Test Arabic RTL support

- [ ] **QuickCreateCustomer.tsx**
  - Check modal opening/closing
  - Verify inline form validation
  - Test quick save functionality
  - Check integration with parent components

**Hardcoded Text Check:**
- [ ] Verify all labels use translation keys
- [ ] Check table headers are translated
- [ ] Verify buttons use i18n
- [ ] Check status badges translations

---

## SECTION 5: VEHICLE MANAGEMENT (4 Pages)

### 5.1 Vehicle Pages
- [ ] **Vehicles List** (`/(dashboard)/vehicles`)
  - Check table with vehicle details (make, model, year, plate, VIN)
  - Verify customer name/link displayed
  - Test search by plate, VIN, make/model
  - Check filters (sedan, SUV, truck, motorcycle)
  - Verify "Add Vehicle" button
  - Test row actions (view, edit, delete)
  - Check pagination
  - Verify empty state

- [ ] **New Vehicle** (`/(dashboard)/vehicles/new`)
  - Check VehicleForm rendering
  - Verify customer dropdown/selector
  - Test make/model inputs
  - Check year validation (1900 - current+1)
  - Verify license plate field
  - Check VIN field validation
  - Test vehicle type selector (sedan, SUV, truck, motorcycle)
  - Verify API call `POST /api/vehicles`
  - Check success redirect

- [ ] **Vehicle Details** (`/(dashboard)/vehicles/[id]`)
  - Check vehicle info display
  - Verify customer information
  - Check service history
  - Verify appointments for vehicle
  - Test "Edit" button
  - Check "Delete" with confirmation
  - Verify inspection history

- [ ] **Edit Vehicle** (`/(dashboard)/vehicles/[id]/edit`)
  - Check form pre-populated
  - Verify API call `GET /api/vehicles/[id]`
  - Test validation
  - Check update API `PUT /api/vehicles/[id]`
  - Verify success message

### 5.2 Vehicle APIs
- [ ] `GET /api/vehicles` - List with filters, search, pagination
- [ ] `POST /api/vehicles` - Create vehicle
- [ ] `GET /api/vehicles/[id]` - Get vehicle details
- [ ] `PUT /api/vehicles/[id]` - Update vehicle
- [ ] `DELETE /api/vehicles/[id]` - Delete vehicle
- [ ] `GET /api/vehicles/export` - Export data
- [ ] `POST /api/vehicles/import` - Import vehicles

### 5.3 Vehicle Components
- [ ] **VehicleForm.tsx**
  - Check customer autocomplete
  - Verify all input fields
  - Test validation rules
  - Check year number input constraints

- [ ] **QuickCreateVehicle.tsx**
  - Verify modal functionality
  - Test quick add from job card/appointment forms

---

## SECTION 6: APPOINTMENT SCHEDULING (6 Pages)

### 6.1 Appointment Pages
- [ ] **Appointments List** (`/(dashboard)/appointments`)
  - Check list/table view
  - Verify status badges (scheduled, confirmed, completed, cancelled)
  - Test filters by status, date range
  - Check search by customer/vehicle
  - Verify "Book Appointment" button
  - Test row actions (view, edit, cancel)
  - Check today's appointments highlighted

- [ ] **Appointment Calendar** (`/(dashboard)/appointments/calendar`)
  - Check calendar rendering
  - Verify month/week/day views
  - Test appointment slots display
  - Check drag-and-drop (if implemented)
  - Verify click to create appointment
  - Test navigation between months
  - Check color coding by status

- [ ] **New Appointment** (`/(dashboard)/appointments/new`)
  - Check AppointmentForm rendering
  - Verify customer selector
  - Check vehicle selector (filtered by customer)
  - Test service selector
  - Verify date picker
  - Check time slot availability
  - Test mechanic assignment
  - Verify notes field
  - Check API call `POST /api/appointments`
  - Test slot conflict detection

- [ ] **Appointment Details** (`/(dashboard)/appointments/[id]`)
  - Check appointment info display
  - Verify customer & vehicle details
  - Check service details
  - Verify status badge
  - Test "Edit" button
  - Check "Cancel" with confirmation
  - Verify "Convert to Job Card" button

- [ ] **Edit Appointment** (`/(dashboard)/appointments/[id]/edit` or `/edit/[id]`)
  - Check form pre-population
  - Verify can change date/time
  - Test slot availability on new date
  - Check update API `PUT /api/appointments/[id]`
  - Verify success message

- [ ] **Appointment Reminders**
  - Check reminder email/SMS/WhatsApp functionality
  - Verify scheduled reminder jobs
  - Test API `POST /api/appointments/reminders`

### 6.2 Appointment APIs
- [ ] `GET /api/appointments` - List with filters
- [ ] `POST /api/appointments` - Create appointment
- [ ] `GET /api/appointments/[id]` - Get details
- [ ] `PUT /api/appointments/[id]` - Update appointment
- [ ] `DELETE /api/appointments/[id]` - Cancel appointment
- [ ] `GET /api/appointments/available-slots` - Get available time slots
- [ ] `POST /api/appointments/reminders` - Send reminders

### 6.3 Appointment Components
- [ ] **AppointmentForm.tsx**
  - Check cascading dropdowns (customer → vehicle)
  - Verify slot calculation integration
  - Test mechanic availability check

- [ ] **SlotCalculator Service**
  - Verify slot generation logic
  - Check working hours respect
  - Test appointment duration + buffer time
  - Verify conflict detection
  - Check timezone handling

---

## SECTION 7: JOB CARD SYSTEM (5 Pages)

### 7.1 Job Card Pages
- [ ] **Job Cards List** (`/(dashboard)/job-cards`)
  - Check JobCardGrid component
  - Verify status filters (pending, in-progress, completed, invoiced)
  - Test search functionality
  - Check date range filters
  - Verify priority badges
  - Test "Create Job Card" button
  - Check row actions (view, edit, delete)

- [ ] **New Job Card** (`/(dashboard)/job-cards/new`)
  - Check JobCardForm (most complex form)
  - Verify customer selection
  - Check vehicle selection
  - Test services multi-select
  - Verify parts selection with quantity
  - Check labor hours input
  - Test mechanic assignment
  - Verify estimated cost calculation
  - Check notes and internal notes
  - Test photo upload
  - Verify API call `POST /api/job-cards`
  - Check creation from inspection
  - Check creation from estimate

- [ ] **Job Card Details** (`/(dashboard)/job-cards/[id]`)
  - Check job card header (ID, status, customer, vehicle)
  - Verify services list with prices
  - Check parts list with quantities and prices
  - Verify labor hours display
  - Check mechanic assigned
  - Test status update buttons (Start, Pause, Complete)
  - Verify time tracking display (active/inactive time)
  - Check photo gallery
  - Test "Generate Invoice" button
  - Verify notes sections
  - Check real-time updates (Socket.io)

- [ ] **Edit Job Card** (`/(dashboard)/job-cards/[id]/edit`)
  - Check form pre-populated with job card data
  - Verify can modify services, parts, labor
  - Test cost recalculation
  - Check update API `PUT /api/job-cards/[id]`

- [ ] **Job Card Creation Flows**
  - Test create from inspection (`/api/job-cards/from-inspection`)
  - Test create from estimate (`/api/job-cards/from-estimate`)
  - Verify data transformation and mapping

### 7.2 Job Card APIs
- [ ] `GET /api/job-cards` - List with complex filters
- [ ] `POST /api/job-cards` - Create job card
- [ ] `GET /api/job-cards/[id]` - Get job card details
- [ ] `PUT /api/job-cards/[id]` - Update job card
- [ ] `DELETE /api/job-cards/[id]` - Delete job card
- [ ] `GET /api/job-cards/recent` - Recent job cards
- [ ] `POST /api/job-cards/from-inspection` - Create from inspection
- [ ] `POST /api/job-cards/from-estimate` - Create from estimate
- [ ] `POST /api/job-cards/[id]/status` - Update status
- [ ] `POST /api/job-cards/[id]/time` - Update time tracking
- [ ] `GET /api/job-cards/[id]/work/active` - Get active work logs
- [ ] `POST /api/job-cards/[id]/work/start` - Start work timer
- [ ] `POST /api/job-cards/[id]/work/stop` - Stop work timer
- [ ] `GET /api/job-cards/[id]/photos` - Get photos
- [ ] `POST /api/job-cards/[id]/photos` - Upload photos
- [ ] `POST /api/job-cards/[id]/invoice` - Generate invoice from job card

### 7.3 Job Card Components
- [ ] **JobCardForm.tsx**
  - Verify all sections render (customer, vehicle, services, parts, labor)
  - Check dynamic parts addition/removal
  - Test services selection with price updates
  - Verify total cost calculations
  - Check validation rules

- [ ] **JobCardGrid.tsx**
  - Verify card layout
  - Check status color coding
  - Test filtering
  - Verify real-time updates

- [ ] **Time Tracking System**
  - Check start/stop work functionality
  - Verify active/inactive time calculation
  - Test WorkLog model integration

---

## SECTION 8: INVOICING SYSTEM (5 Pages)

### 8.1 Invoice Pages
- [ ] **Invoices List** (`/(dashboard)/invoices`)
  - Check table with invoice details (number, customer, amount, status)
  - Verify status filters (draft, sent, paid, overdue, cancelled)
  - Test search by invoice number, customer
  - Check date range filters
  - Verify "Create Invoice" button
  - Test row actions (view, edit, send, print, PDF)
  - Check payment status badges

- [ ] **New Invoice** (`/(dashboard)/invoices/new`)
  - Check InvoiceForm rendering
  - Verify customer selection
  - Check line items (services/parts) addition
  - Test quantity and unit price inputs
  - Verify tax calculation (VAT)
  - Check discount field
  - Test total calculation
  - Verify payment terms
  - Check due date calculation
  - Test API call `POST /api/invoices`

- [ ] **Invoice Details** (`/(dashboard)/invoices/[id]`)
  - Check invoice header (number, date, customer, status)
  - Verify line items table
  - Check subtotal, tax, discount, total display
  - Test "Edit" button
  - Verify "Send Email" button
  - Check "Download PDF" button (English)
  - Test "Download PDF (Arabic)" button
  - Verify "Print" button
  - Check "Mark as Paid" button
  - Test payment history

- [ ] **Edit Invoice** (`/(dashboard)/invoices/[id]/edit`)
  - Check form pre-population
  - Verify can modify line items
  - Test recalculation on changes
  - Check update API `PUT /api/invoices/[id]`
  - Verify can't edit if status is paid

- [ ] **Invoice PDF/Print** (`/(dashboard)/invoices/[id]/pdf`)
  - Check PDF generation (Puppeteer)
  - Verify company logo displays
  - Check all invoice details render
  - Test line items table
  - Verify tax breakdown
  - Check ZATCA QR code (if enabled)
  - Test Arabic PDF generation
  - Verify print layout

### 8.2 Invoice APIs
- [ ] `GET /api/invoices` - List invoices with filters
- [ ] `POST /api/invoices` - Create invoice
- [ ] `GET /api/invoices/[id]` - Get invoice details
- [ ] `PUT /api/invoices/[id]` - Update invoice
- [ ] `DELETE /api/invoices/[id]` - Delete invoice
- [ ] `GET /api/invoices/[id]/pdf` - Generate PDF (English)
- [ ] `GET /api/invoices/[id]/pdf-arabic` - Generate PDF (Arabic)
- [ ] `GET /api/invoices/[id]/print` - Print view
- [ ] `GET /api/invoices/[id]/view` - Web view

### 8.3 Invoice Components & Services
- [ ] **InvoiceForm.tsx**
  - Check line item management
  - Verify calculations (subtotal, tax, discount, total)
  - Test VAT rate selection

- [ ] **InvoiceService.ts**
  - Verify invoice number generation
  - Check calculation logic
  - Test ZATCA integration

- [ ] **PDF Components**
  - InvoiceDocument.tsx - React-PDF template
  - PrintInvoiceDocument.tsx - Print template
  - Verify both English and Arabic layouts

---

## SECTION 9: ESTIMATES SYSTEM (4 Pages)

### 9.1 Estimate Pages
- [ ] **Estimates List** (`/(dashboard)/estimates`)
  - Check table rendering
  - Verify status filters (draft, sent, accepted, rejected, expired)
  - Test search functionality
  - Check "Create Estimate" button
  - Verify row actions (view, edit, convert to job/invoice, PDF)
  - Test expiration date highlighting

- [ ] **New Estimate** (`/(dashboard)/estimates/new`)
  - Check EstimateForm rendering
  - Verify customer/vehicle selection
  - Check services and parts selection
  - Test cost calculations
  - Verify validity period input
  - Check notes field
  - Test API call `POST /api/estimates`
  - Verify creation from inspection

- [ ] **Estimate Details** (`/(dashboard)/estimates/[id]`)
  - Check estimate display
  - Verify line items
  - Check total cost
  - Test status update (Accept/Reject)
  - Verify "Convert to Job Card" button
  - Check "Convert to Invoice" button
  - Test "Download PDF" button
  - Check expiration status

- [ ] **Edit Estimate** (`/(dashboard)/estimates/[id]/edit`)
  - Check form pre-population
  - Verify can modify items
  - Test recalculations
  - Check update API `PUT /api/estimates/[id]`

### 9.2 Estimate APIs
- [ ] `GET /api/estimates` - List estimates
- [ ] `POST /api/estimates` - Create estimate
- [ ] `GET /api/estimates/[id]` - Get details
- [ ] `PUT /api/estimates/[id]` - Update estimate
- [ ] `DELETE /api/estimates/[id]` - Delete estimate
- [ ] `POST /api/estimates/[id]/status` - Update status
- [ ] `GET /api/estimates/[id]/pdf` - Generate PDF
- [ ] `POST /api/estimates/from-inspection` - Create from inspection

### 9.3 Estimate Components
- [ ] **EstimateForm.tsx**
  - Verify all sections
  - Test calculation logic

- [ ] **InlineEstimateCreator.tsx**
  - Check modal functionality
  - Test quick estimate creation

- [ ] **PDF Components**
  - EstimateDocument.tsx
  - PrintEstimateDocument.tsx

---

## SECTION 10: INSPECTION SYSTEM (9 Pages)

### 10.1 Inspection Pages
- [ ] **Inspections List** (`/(dashboard)/inspections`)
  - Check table/card view
  - Verify filters by status (pending, in-progress, completed)
  - Test search by customer/vehicle
  - Check "New Inspection" button
  - Verify row actions (view, edit, PDF, convert to estimate/job)

- [ ] **New Inspection** (`/(dashboard)/inspections/new`)
  - Check InspectionForm rendering
  - Verify customer/vehicle selection
  - Check template selection
  - Test inspection items checklist
  - Verify pass/fail/NA options
  - Check photo upload for each item
  - Test notes field per item
  - Verify API call `POST /api/inspections`

- [ ] **Inspection Details** (`/(dashboard)/inspections/[id]`)
  - Check inspection header
  - Verify inspection items display with status
  - Check photos gallery
  - Test "Edit" button
  - Verify "Generate PDF" button
  - Check "Create Estimate" button
  - Test "Create Job Card" button
  - Verify "Match Parts" functionality

- [ ] **Edit Inspection** (`/(dashboard)/inspections/[id]/edit`)
  - Check form pre-population
  - Verify can update inspection items
  - Test photo upload/removal
  - Check update API `PUT /api/inspections/[id]`

- [ ] **Inspection Templates List** (`/(dashboard)/inspections/templates` or `/inspection-templates`)
  - Check templates list
  - Verify vehicle type categories
  - Test "Create Template" button
  - Check row actions (edit, delete, duplicate)

- [ ] **New Inspection Template** (`/(dashboard)/inspections/templates/new` or `/inspection-templates/new`)
  - Check template form
  - Verify template name field
  - Check vehicle type selector
  - Test inspection items builder
  - Verify add/remove items
  - Check item categories
  - Test API call `POST /api/inspection-templates`

- [ ] **Edit Inspection Template** (`/(dashboard)/inspections/templates/[id]/edit` or `/inspection-templates/[id]/edit`)
  - Check form pre-population
  - Verify can modify template items
  - Test update API `PUT /api/inspection-templates/[id]`

- [ ] **Inspection PDF** (`/(dashboard)/inspections/[id]/pdf`)
  - Check PDF generation
  - Verify inspection details
  - Check items checklist display
  - Test photo embedding
  - Verify company branding

- [ ] **Part Matching**
  - Test auto-match parts API `POST /api/inspections/[id]/match-parts`
  - Verify PartMatchingService logic
  - Check intelligent part suggestions

### 10.2 Inspection APIs
- [ ] `GET /api/inspections` - List inspections
- [ ] `POST /api/inspections` - Create inspection
- [ ] `GET /api/inspections/[id]` - Get inspection details
- [ ] `PUT /api/inspections/[id]` - Update inspection
- [ ] `DELETE /api/inspections/[id]` - Delete inspection
- [ ] `GET /api/inspections/[id]/pdf` - Generate PDF
- [ ] `POST /api/inspections/[id]/match-parts` - Auto-match parts

### 10.3 Inspection Template APIs
- [ ] `GET /api/inspection-templates` - List templates
- [ ] `POST /api/inspection-templates` - Create template
- [ ] `GET /api/inspection-templates/[id]` - Get template
- [ ] `PUT /api/inspection-templates/[id]` - Update template
- [ ] `DELETE /api/inspection-templates/[id]` - Delete template

### 10.4 Inspection Components & Services
- [ ] **InspectionForm.tsx**
  - Verify template loading
  - Check dynamic item rendering
  - Test photo upload per item

- [ ] **InlineInspectionCreator.tsx**
  - Check modal functionality

- [ ] **PartMatchingService.ts**
  - Verify matching algorithm
  - Test fuzzy search logic
  - Check part compatibility

---

## SECTION 11: PARTS INVENTORY (6 Pages)

### 11.1 Inventory Pages
- [ ] **Parts List** (`/(dashboard)/inventory`)
  - Check table with parts (name, SKU, quantity, price)
  - Verify search by name, SKU, category
  - Test filters by category, low stock
  - Check "Add Part" button
  - Verify row actions (view, edit, adjust stock, delete)
  - Test sorting by quantity, price
  - Check low stock highlighting

- [ ] **Low Stock Alerts** (`/(dashboard)/inventory/alerts`)
  - Check alerts table
  - Verify parts below reorder level
  - Test alert dismissal
  - Check email notification settings

- [ ] **New Part** (`/(dashboard)/inventory/new`)
  - Check PartForm rendering
  - Verify all fields (name, SKU, category, quantity, price, cost, reorder level)
  - Test barcode scanning integration (if exists)
  - Check supplier field
  - Verify API call `POST /api/parts`

- [ ] **Part Details** (`/(dashboard)/inventory/[id]`)
  - Check part information display
  - Verify stock level
  - Check usage history
  - Test "Edit" button
  - Verify "Adjust Stock" button
  - Check "Delete" with confirmation

- [ ] **Edit Part** (`/(dashboard)/inventory/[id]/edit` or `/edit/[id]`)
  - Check form pre-population
  - Verify can update all fields
  - Test price/cost validation
  - Check update API `PUT /api/parts/[id]`

- [ ] **Part Import**
  - Test bulk import functionality
  - Verify CSV/Excel template
  - Check validation on import
  - Test API `POST /api/parts/import`

### 11.2 Parts APIs
- [ ] `GET /api/parts` - List parts with filters
- [ ] `POST /api/parts` - Add new part
- [ ] `GET /api/parts/[id]` - Get part details
- [ ] `PUT /api/parts/[id]` - Update part
- [ ] `DELETE /api/parts/[id]` - Delete part
- [ ] `GET /api/parts/low-stock` - Low stock alerts
- [ ] `GET /api/parts/compatible` - Compatible parts
- [ ] `GET /api/parts/[id]/usage` - Usage history
- [ ] `POST /api/parts/import` - Bulk import

### 11.3 Inventory Components & Hooks
- [ ] **PartForm.tsx**
  - Verify all input fields
  - Check validation rules

- [ ] **QuickCreatePart.tsx**
  - Test modal functionality

- [ ] **useInventoryAlerts.tsx**
  - Verify alert fetching
  - Check real-time updates

---

## SECTION 12: SERVICES CATALOG (4 Pages)

### 12.1 Service Pages
- [ ] **Services List** (`/(dashboard)/services`)
  - Check table rendering
  - Verify search by name
  - Test filters by category, active status
  - Check "Add Service" button
  - Verify row actions (edit, delete, toggle active)

- [ ] **New Service** (`/(dashboard)/services/new`)
  - Check ServiceForm rendering
  - Verify name, description fields
  - Test category selection
  - Check price input validation
  - Verify duration field
  - Test API call `POST /api/services`

- [ ] **Service Details** (`/(dashboard)/services/[id]`)
  - Check service information
  - Verify usage statistics
  - Test "Edit" button
  - Check "Delete" confirmation

- [ ] **Edit Service** (`/(dashboard)/services/[id]/edit`)
  - Check form pre-population
  - Test update API `PUT /api/services/[id]`

### 12.2 Service APIs
- [ ] `GET /api/services` - List services
- [ ] `POST /api/services` - Create service
- [ ] `GET /api/services/[id]` - Get service details
- [ ] `PUT /api/services/[id]` - Update service
- [ ] `DELETE /api/services/[id]` - Delete service
- [ ] `GET /api/services/[id]/usage` - Usage stats
- [ ] `GET /api/services/categories` - Categories list
- [ ] `POST /api/services/import` - Bulk import

### 12.3 Service Components
- [ ] **ServiceForm.tsx**
  - Verify all fields
  - Test validation

- [ ] **QuickCreateService.tsx**
  - Check modal functionality

---

## SECTION 13: PAYMENT MANAGEMENT (4 Pages)

### 13.1 Payment Pages
- [ ] **Payments List** (`/(dashboard)/payments`)
  - Check table with payment details
  - Verify filters by method, status, date
  - Test search by invoice number, customer
  - Check "Record Payment" button
  - Verify row actions (view, edit, refund)

- [ ] **New Payment** (`/(dashboard)/payments/new`)
  - Check payment form
  - Verify invoice selection
  - Test amount validation
  - Check payment method selector
  - Verify date picker
  - Test reference number field
  - Check API call `POST /api/payments`

- [ ] **Payment Details** (`/(dashboard)/payments/[id]`)
  - Check payment information
  - Verify linked invoice
  - Test "Edit" button (if not finalized)
  - Check "Refund" button with confirmation

- [ ] **Edit Payment** (`/(dashboard)/payments/[id]/edit`)
  - Check form pre-population
  - Verify update restrictions
  - Test update API `PUT /api/payments/[id]`

### 13.2 Payment APIs
- [ ] `GET /api/payments` - List payments
- [ ] `POST /api/payments` - Record payment
- [ ] `GET /api/payments/[id]` - Get payment details
- [ ] `PUT /api/payments/[id]` - Update payment
- [ ] `DELETE /api/payments/[id]` - Delete payment

### 13.3 Payment Components
- [ ] **PaymentForm.tsx**
  - Verify invoice lookup
  - Check amount validation against invoice
  - Test payment method options

---

## SECTION 14: REPORTS & ANALYTICS (11+ Pages)

### 14.1 Report Pages
- [ ] **Reports Hub** (`/(dashboard)/reports`)
  - Check list of available reports
  - Verify report cards/tiles
  - Test report descriptions
  - Check navigation to specific reports

- [ ] **Sales Report** (`/(dashboard)/reports/sales` or `/[reportName]`)
  - Check date range selector
  - Verify data table rendering
  - Test export to Excel
  - Check charts (if any - Recharts)
  - Verify summary metrics

- [ ] **Accounts Receivable Report** (`/(dashboard)/reports/accounts-receivable`)
  - Check aging buckets (current, 30, 60, 90+ days)
  - Verify customer breakdown
  - Test total outstanding calculation

- [ ] **Inventory Report** (`/(dashboard)/reports/inventory`)
  - Check parts listing with quantities
  - Verify valuation calculation
  - Test low stock highlighting

- [ ] **Inventory Valuation Report** (`/(dashboard)/reports/inventory-valuation`)
  - Check total inventory value
  - Verify cost calculations
  - Test category breakdown

- [ ] **Payments Received Report** (`/(dashboard)/reports/payments-received`)
  - Check payment transactions list
  - Verify payment method breakdown
  - Test date filtering

- [ ] **Profit & Loss Report** (`/(dashboard)/reports/profit-and-loss`)
  - Check revenue section
  - Verify expenses section
  - Test net profit calculation
  - Check period comparison

- [ ] **Technician Performance Report** (`/(dashboard)/reports/technician-performance`)
  - Check technician list
  - Verify KPIs (jobs completed, average time, revenue generated)
  - Test performance ranking

- [ ] **VAT Report** (`/(dashboard)/reports/vat`)
  - Check VAT collected
  - Verify VAT breakdown by rate
  - Test total calculations
  - Check ZATCA compliance

- [ ] **Work Logs Report** (`/(dashboard)/reports/work-logs`)
  - Check time tracking data
  - Verify mechanic hours
  - Test job card linking

- [ ] **Dynamic Report Pages** (`/(dashboard)/reports/[reportName]`)
  - Test any additional custom reports

### 14.2 Report APIs
- [ ] `GET /api/reports` - List available reports
- [ ] `POST /api/reports/export` - Export to Excel
- [ ] `GET /api/reports/sales` - Sales report data
- [ ] `GET /api/reports/sales/summary` - Sales summary
- [ ] `GET /api/reports/accounts-receivable` - AR aging
- [ ] `GET /api/reports/accounts-receivable/summary` - AR summary
- [ ] `GET /api/reports/inventory` - Inventory report
- [ ] `GET /api/reports/inventory-valuation` - Valuation
- [ ] `GET /api/reports/inventory-valuation/summary` - Valuation summary
- [ ] `GET /api/reports/payments-received` - Payments report
- [ ] `GET /api/reports/payments-received/summary` - Payments summary
- [ ] `GET /api/reports/profit-and-loss` - P&L statement
- [ ] `GET /api/reports/profit-and-loss/summary` - P&L summary
- [ ] `GET /api/reports/technician-performance` - Tech KPIs
- [ ] `GET /api/reports/technician-performance/summary` - Tech summary
- [ ] `GET /api/reports/vat` - VAT report
- [ ] `GET /api/reports/vat/summary` - VAT summary
- [ ] `GET /api/reports/work-logs` - Work logs

### 14.3 Report Components
- [ ] **SalesReport.tsx**
- [ ] **ArAgingReport.tsx**
- [ ] **ProfitAndLossReport.tsx**
- [ ] **InventoryValuationReport.tsx**
- [ ] **PaymentsReceivedReport.tsx**
- [ ] **TechnicianPerformanceReport.tsx**
- [ ] **VatReport.tsx**
- [ ] Verify all use consistent table/export patterns

---

## SECTION 15: SETTINGS (11 Pages)

### 15.1 Settings Pages
- [ ] **Settings Hub** (`/(dashboard)/settings`)
  - Check settings navigation cards
  - Verify all setting categories listed

- [ ] **Organization Settings** (`/(dashboard)/settings/organization`)
  - Check CompanyProfileSettings component
  - Verify company name, address fields
  - Test logo upload (Cloudinary)
  - Check contact info fields
  - Verify API call `PUT /api/settings/company-profile`

- [ ] **Appearance Settings** (`/(dashboard)/settings/appearance`)
  - Check theme selector (light/dark)
  - Verify primary color picker
  - Test logo upload
  - Check preview
  - Verify API call `PUT /api/settings/appearance`

- [ ] **Booking Settings** (`/(dashboard)/settings/booking`)
  - Check enable/disable toggle
  - Verify working hours editor (per day)
  - Test appointment duration input
  - Check buffer time field
  - Verify advance booking days
  - Test API call `PUT /api/settings/booking`

- [ ] **Inspection Settings** (`/(dashboard)/settings/inspection`)
  - Check default template selection
  - Verify inspection numbering format
  - Test API call `PUT /api/settings/inspection`

- [ ] **Invoicing Settings** (`/(dashboard)/settings/invoicing`)
  - Check invoice prefix field
  - Verify next invoice number
  - Test VAT rate input
  - Check payment terms
  - Verify default due days
  - Test API call `PUT /api/settings/invoicing`

- [ ] **Localization Settings** (`/(dashboard)/settings/localization`)
  - Check language selector (en/ar)
  - Verify timezone dropdown
  - Test currency selector
  - Check date format options
  - Verify API call `PUT /api/settings/localization`

- [ ] **Integrations Settings** (`/(dashboard)/settings/integrations`)
  - Check WhatsApp integration toggle
  - Verify WAHA session setup
  - Test QR code display for WhatsApp
  - Check email settings (SMTP)
  - Verify API keys fields
  - Test API call `PUT /api/settings/integrations`

- [ ] **ZATCA Settings** (`/(dashboard)/settings/zatca`)
  - Check ZATCA enabled toggle
  - Verify seller info fields
  - Test tax registration number
  - Check API call `PUT /api/settings/zatca`

- [ ] **Subscription Settings** (`/(dashboard)/settings/subscription`)
  - Check current plan display
  - Verify usage metrics
  - Test upgrade/downgrade buttons
  - Check billing history

- [ ] **User Management Settings** (`/(dashboard)/settings/users`)
  - Check user list
  - Verify "Add User" button
  - Test role assignment
  - Check user status toggle
  - Verify password reset

### 15.2 Settings APIs
- [ ] `GET /api/settings/company-profile` - Get settings
- [ ] `PUT /api/settings/company-profile` - Update profile
- [ ] `GET /api/settings/booking` - Get booking settings
- [ ] `PUT /api/settings/booking` - Update booking
- [ ] `GET /api/settings/appearance` - Get appearance
- [ ] `PUT /api/settings/appearance` - Update appearance
- [ ] `GET /api/settings/inspection` - Get inspection settings
- [ ] `PUT /api/settings/inspection` - Update inspection
- [ ] `GET /api/settings/invoicing` - Get invoice settings
- [ ] `PUT /api/settings/invoicing` - Update invoicing
- [ ] `GET /api/settings/localization` - Get locale settings
- [ ] `PUT /api/settings/localization` - Update locale
- [ ] `GET /api/settings/integrations` - Get integrations
- [ ] `PUT /api/settings/integrations` - Update integrations
- [ ] `GET /api/settings/zatca` - Get ZATCA settings
- [ ] `PUT /api/settings/zatca` - Update ZATCA

### 15.3 Settings Components
- [ ] **CompanyProfileSettings.tsx**
- [ ] **AppearanceSettings.tsx**
- [ ] **BookingSettings.tsx**
- [ ] **InspectionSettings.tsx**
- [ ] **InvoicingSettings.tsx**
- [ ] **LocalizationSettings.tsx**
- [ ] **IntegrationsSettings.tsx**
- [ ] **ZatcaSettings.tsx**
- [ ] **UserManagementSettings.tsx**

---

## SECTION 16: USER MANAGEMENT (2 Pages)

### 16.1 User Pages
- [ ] **Users List** (`/(dashboard)/users`)
  - Check users table
  - Verify role badges (admin, mechanic, inspector)
  - Test "Add User" button
  - Check row actions (edit, toggle status, reset password)
  - Verify search functionality

- [ ] **User Profile** (`/(dashboard)/profile`)
  - Check profile form
  - Verify name, email display
  - Test password change
  - Check profile photo upload
  - Verify API call `PUT /api/profile`

### 16.2 User APIs
- [ ] `GET /api/users` - List users
- [ ] `POST /api/users` - Create user
- [ ] `GET /api/users/[id]` - Get user details
- [ ] `PUT /api/users/[id]` - Update user
- [ ] `DELETE /api/users/[id]` - Delete user
- [ ] `POST /api/users/[id]/role` - Update role
- [ ] `POST /api/users/[id]/status` - Toggle status
- [ ] `POST /api/users/[id]/reset-password` - Admin password reset
- [ ] `GET /api/profile` - Get current user profile
- [ ] `PUT /api/profile` - Update profile

---

## SECTION 17: WHATSAPP INTEGRATION (1 Page)

### 17.1 WhatsApp Page
- [ ] **WhatsApp Interface** (`/(dashboard)/whatsapp`)
  - Check conversation list
  - Verify message thread display
  - Test send message functionality
  - Check message templates
  - Verify customer linking
  - Test file/image sending

### 17.2 WhatsApp APIs
- [ ] `POST /api/whatsapp/send` - Send message
- [ ] `GET /api/whatsapp/messages` - Get all messages
- [ ] `GET /api/whatsapp/messages/[customerId]` - Get customer messages
- [ ] `GET /api/whatsapp/history` - Message history
- [ ] `POST /api/whatsapp/webhook` - WhatsApp webhook
- [ ] `POST /api/whatsapp/inspection-completed` - Send inspection notification
- [ ] `GET /api/waha/session` - Get WAHA session status
- [ ] `GET /api/waha/qr` - Get QR code for linking

### 17.3 WhatsApp Services
- [ ] **WhatsAppService.ts**
  - Verify message sending
  - Check template formatting

- [ ] **WahaService.ts**
  - Test session management
  - Verify QR code generation

- [ ] **WahaSessionService.ts**
  - Check session persistence

- [ ] **WhatsAppEventListeners.ts**
  - Verify Socket.io listeners
  - Test message reception

---

## SECTION 18: ADMIN PANEL (6+ Pages)

### 18.1 Admin Pages
- [ ] **Admin Dashboard** (`/(dashboard)/admin`)
  - Check platform-wide metrics
  - Verify tenant count
  - Test revenue summary
  - Check active users count
  - Verify system health status

- [ ] **Tenants Management** (`/(dashboard)/admin/tenants`)
  - Check all tenants table
  - Verify search by name, slug
  - Test filters by status, plan
  - Check "Add Tenant" button (if exists)
  - Verify row actions (view, edit, suspend, delete)

- [ ] **Tenant Details Editor** (`/(dashboard)/admin/system/tenants/[id]`)
  - Check TenantDetailsForm
  - Verify all tenant settings editable
  - Test subscription management
  - Check usage limits
  - Verify API call `PUT /api/admin/tenants/[id]`

- [ ] **System Overview** (`/(dashboard)/admin/system`)
  - Check system health dashboard
  - Verify database status
  - Test Redis connection status
  - Check API response times
  - Verify error rates

- [ ] **Admin Settings** (`/(dashboard)/admin/settings`)
  - Check global platform settings
  - Verify default limits
  - Test feature flags

- [ ] **Data Migration** (`/(dashboard)/admin/migrate`)
  - Check migration tools
  - Verify data transformation scripts
  - Test rollback functionality

- [ ] **Admin Analytics** (`/(dashboard)/admin/analytics`)
  - Check tenant analytics
  - Verify subscription metrics
  - Test revenue charts
  - Check MRR calculations

### 18.2 Admin APIs
- [ ] `GET /api/admin/health` - System health
- [ ] `GET /api/admin/stats` - Admin statistics
- [ ] `GET /api/admin/usage` - Platform usage
- [ ] `GET /api/admin/logs` - System logs
- [ ] `GET /api/admin/users` - All platform users
- [ ] `GET /api/admin/tenants` - All tenants
- [ ] `GET /api/admin/tenants/[id]` - Tenant details
- [ ] `PUT /api/admin/tenants/[id]` - Update tenant
- [ ] `DELETE /api/admin/tenants/[id]` - Delete tenant
- [ ] `GET /api/admin/tenants/[id]/edit` - Edit form data
- [ ] `GET /api/admin/tenants/[id]/details` - Tenant details
- [ ] `GET /api/admin/backup` - Backup list
- [ ] `POST /api/admin/backup` - Create backup
- [ ] `GET /api/admin/backup/[id]/download` - Download backup
- [ ] `POST /api/admin/backup/[id]/restore` - Restore backup
- [ ] `GET /api/admin/analytics/tenants` - Tenant analytics
- [ ] `GET /api/admin/analytics/subscriptions` - Subscription analytics
- [ ] `GET /api/admin/analytics/revenue` - Revenue analytics
- [ ] `GET /api/admin/analytics/mrr` - MRR analytics

### 18.3 Admin Components
- [ ] **BackupManager.tsx**
  - Test backup creation
  - Verify download functionality
  - Check restore with confirmation

- [ ] **TenantManagementTable.tsx**
- [ ] **TenantDetailsForm.tsx**
- [ ] **GlobalUsersTable.tsx**
- [ ] **SystemLogsViewer.tsx**
- [ ] **SystemStatusBoard.tsx**
- [ ] **UsageMonitoringDashboard.tsx**
- [ ] **PlatformMetricsBoard.tsx**

---

## SECTION 19: ONBOARDING & MECHANICS (2 Pages)

### 19.1 Onboarding
- [ ] **Onboarding Flow** (`/(dashboard)/onboarding`)
  - Check multi-step wizard
  - Verify company setup
  - Test service catalog setup
  - Check parts inventory import
  - Verify completion redirect
  - Test API call `POST /api/onboarding/status`

### 19.2 Mechanics
- [ ] **Mechanics Management**
  - Check mechanics list
  - Verify "Add Mechanic" functionality
  - Test mechanic assignment
  - Check performance tracking

### 19.3 APIs
- [ ] `GET /api/mechanics` - List mechanics
- [ ] `POST /api/mechanics` - Create mechanic
- [ ] `GET /api/mechanics/[id]` - Get mechanic details
- [ ] `GET /api/onboarding/status` - Onboarding status

---

## SECTION 20: UTILITY & SYSTEM APIS

### 20.1 Utility APIs
- [ ] `GET /api/health` - App health check
- [ ] `POST /api/test-connection` - Test DB connection
- [ ] `GET /api/test-db` - Test database
- [ ] `POST /api/test/unique-codes` - Test unique code generation
- [ ] `GET /api/test/check-template` - Test template
- [ ] `POST /api/tenants` - Get/manage tenants
- [ ] `GET /api/tenants/[id]` - Get tenant info
- [ ] `GET /api/search` - Global search
- [ ] `GET /api/search/suggestions` - Search suggestions
- [ ] `POST /api/upload` - File upload
- [ ] `POST /api/upload/logo` - Logo upload
- [ ] `POST /api/maintenance/migrate-tenant-ids` - Data migration
- [ ] `POST /api/maintenance/update-low-stock` - Update alerts
- [ ] `POST /api/create-admin` - Create admin user

---

## SECTION 21: DATA MODELS & SCHEMA VALIDATION

### 21.1 All Models (19 Total)
- [ ] **User.ts**
  - Check schema validation (email, password, role)
  - Verify password hashing (bcrypt)
  - Test role enum (admin, mechanic, inspector, customer)
  - Check tenantId reference

- [ ] **Tenant.ts**
  - Verify unique slug validation
  - Check subdomain uniqueness
  - Test company info fields
  - Verify settings object structure
  - Check status enum (active, suspended, cancelled)

- [ ] **TenantConfig.ts**
  - Check configuration schema
  - Verify default values

- [ ] **Customer.ts**
  - Check email uniqueness per tenant
  - Verify phone validation
  - Test language field (en/ar)
  - Check tenantId isolation

- [ ] **Vehicle.ts**
  - Verify VIN uniqueness
  - Check license plate validation
  - Test year constraints (1900 - current+1)
  - Verify customerId reference
  - Check tenantId isolation

- [ ] **Appointment.ts**
  - Check date/time validation
  - Verify status enum
  - Test mechanic assignment
  - Check overlapping appointment prevention
  - Verify tenantId isolation

- [ ] **JobCard.ts**
  - Check status workflow validation
  - Verify line items (services, parts) schema
  - Test cost calculations
  - Check tenantId isolation
  - Verify references (customer, vehicle, appointment)

- [ ] **Invoice.ts**
  - Check invoice number uniqueness
  - Verify line items schema
  - Test tax calculations
  - Check status enum
  - Verify tenantId isolation

- [ ] **Estimate.ts**
  - Check validity period
  - Verify expiration logic
  - Test conversion to job/invoice
  - Check tenantId isolation

- [ ] **Payment.ts**
  - Verify amount validation
  - Check payment method enum
  - Test invoice reference
  - Check tenantId isolation

- [ ] **Part.ts**
  - Check SKU uniqueness per tenant
  - Verify stock quantity validation
  - Test price/cost fields
  - Check reorder level logic
  - Verify tenantId isolation

- [ ] **Service.ts**
  - Check name uniqueness per tenant
  - Verify price validation
  - Test duration field
  - Check isActive boolean

- [ ] **VehicleInspection.ts**
  - Verify inspection items array
  - Check photo URLs array
  - Test status enum
  - Verify tenantId isolation

- [ ] **InspectionTemplate.ts**
  - Check template items structure
  - Verify vehicle type enum
  - Test tenantId isolation

- [ ] **Mechanic.ts**
  - Check user reference
  - Verify specializations array
  - Test tenantId isolation

- [ ] **WorkLog.ts**
  - Check start/end time validation
  - Verify duration calculation
  - Test job card reference
  - Check tenantId isolation

- [ ] **Log.ts**
  - Check action logging
  - Verify user reference
  - Test tenantId isolation

- [ ] **Backup.ts**
  - Check file path validation
  - Verify size field
  - Test restoration status

- [ ] **WhatsAppMessage.ts**
  - Check message content
  - Verify customer reference
  - Test timestamp

---

## SECTION 22: SERVICES & BUSINESS LOGIC

### 22.1 Service Classes (11 Total)
- [ ] **BookingNotificationService.ts**
  - Test email notifications
  - Verify SMS sending
  - Check WhatsApp messages
  - Test reminder scheduling

- [ ] **CustomerPortalAuth.ts**
  - Verify OTP generation
  - Check OTP validation (6 digits, expiry)
  - Test session management

- [ ] **InvoiceService.ts**
  - Test invoice number generation
  - Verify calculations (subtotal, tax, discount, total)
  - Check PDF generation
  - Test ZATCA integration

- [ ] **PartMatchingService.ts**
  - Test fuzzy matching algorithm
  - Verify part compatibility logic
  - Check intelligent suggestions

- [ ] **SlotCalculator.ts**
  - Test slot generation algorithm
  - Verify working hours respect
  - Check appointment duration + buffer
  - Test conflict detection
  - Verify advance booking days logic

- [ ] **WhatsAppService.ts**
  - Test message sending
  - Verify template rendering
  - Check error handling

- [ ] **WahaService.ts**
  - Test session creation
  - Verify QR code generation
  - Check message sending via WAHA

- [ ] **WahaSessionService.ts**
  - Test session persistence
  - Verify reconnection logic

- [ ] **WhatsAppEventListeners.ts**
  - Test Socket.io event listeners
  - Verify message reception
  - Check event handling

- [ ] **loggingService.ts**
  - Test activity logging
  - Verify log creation
  - Check log retrieval

- [ ] **socket.ts**
  - Test Socket.io client setup
  - Verify real-time job card updates

---

## SECTION 23: CUSTOM HOOKS

### 23.1 Hooks (6 Total)
- [ ] **useCustomerSession.ts**
  - Test session fetching
  - Verify update function
  - Check loading states

- [ ] **useDebounce.ts**
  - Test debounce functionality
  - Verify delay timing
  - Check cleanup on unmount

- [ ] **useInventoryAlerts.tsx**
  - Test alert fetching
  - Verify low stock detection
  - Check alert dismissal

- [ ] **useNotifications.ts**
  - Test notification display
  - Verify toast integration
  - Check notification dismissal

- [ ] **useSession.ts**
  - Test user session management
  - Verify logout functionality
  - Check session refresh

- [ ] **useToast.ts**
  - Test toast notifications
  - Verify success/error/info/warning types
  - Check auto-dismiss timing

---

## SECTION 24: MIDDLEWARE & UTILITIES

### 24.1 Middleware
- [ ] **withTenantAuth.ts**
  - Test tenant context injection
  - Verify JWT validation
  - Check role-based access
  - Test tenant isolation

- [ ] **validation.ts**
  - Test request body validation
  - Verify Zod schemas
  - Check error formatting

- [ ] **security.ts**
  - Test security headers
  - Verify CORS configuration
  - Check XSS protection

- [ ] **rate-limit.ts**
  - Test rate limiting
  - Verify Redis integration
  - Check limit enforcement

- [ ] **cache.ts**
  - Test response caching
  - Verify cache invalidation
  - Check Redis usage

- [ ] **error-handling.ts**
  - Test error standardization
  - Verify error logging
  - Check error responses

- [ ] **pagination.ts**
  - Test pagination helpers
  - Verify limit/offset calculation
  - Check total count

- [ ] **tenant-context.ts**
  - Test tenant context injection
  - Verify tenant resolution

- [ ] **usage-enforcement.ts**
  - Test quota enforcement
  - Verify usage tracking
  - Check limit notifications

- [ ] **performance.ts**
  - Test performance monitoring
  - Verify slow query detection

### 24.2 Utilities
- [ ] **api-client.ts**
  - Test request wrapper
  - Verify error handling
  - Check retry logic

- [ ] **email.ts**
  - Test email sending via Resend
  - Verify templates
  - Check error handling

- [ ] **notifications.ts**
  - Test notification creation
  - Verify delivery

- [ ] **search.ts**
  - Test global search logic
  - Verify fuzzy matching
  - Check multi-model search

- [ ] **security.ts**
  - Test password hashing
  - Verify JWT generation/validation
  - Check CSRF protection

- [ ] **export.ts**
  - Test CSV export
  - Verify Excel export
  - Check data formatting

- [ ] **cache.ts**
  - Test caching layer
  - Verify TTL handling

- [ ] **pdf-generator-html.ts**
  - Test Puppeteer integration
  - Verify PDF generation
  - Check Arabic rendering

- [ ] **performance.ts**
  - Test optimization utilities

- [ ] **language-handler.ts**
  - Test i18n integration
  - Verify language switching
  - Check RTL/LTR handling

- [ ] **role.ts**
  - Test permission checking
  - Verify role validation

- [ ] **tenant-utils.ts**
  - Test tenant utilities
  - Verify slug generation

- [ ] **simple-auth.ts**
  - Test auth helpers
  - Verify session management

- [ ] **simple-auth-client.ts**
  - Test client auth utilities

### 24.3 Backup & Analytics
- [ ] **backup-manager.ts**
  - Test backup creation
  - Verify file compression
  - Check S3 upload (if used)

- [ ] **restore-manager.ts**
  - Test restore functionality
  - Verify data validation
  - Check rollback on error

- [ ] **usage-tracker.ts**
  - Test usage tracking
  - Verify metric collection

- [ ] **analytics-calculator.ts**
  - Test analytics computation
  - Verify MRR calculations
  - Check churn rate

---

## SECTION 25: INTERNATIONALIZATION (i18n)

### 25.1 Translation Files
- [ ] **Check Translation Coverage**
  - Verify all English translations in `public/locales/en/`
  - Check all Arabic translations in `public/locales/ar/`
  - Compare keys between en/ar for missing translations

### 25.2 Namespaces to Check
- [ ] `common.json` - Common UI text
- [ ] `auth.json` - Authentication pages
- [ ] `dashboard.json` - Dashboard pages
- [ ] `customers.json` - Customer module
- [ ] `vehicles.json` - Vehicle module
- [ ] `appointments.json` - Appointments module
- [ ] `job-cards.json` - Job card module
- [ ] `invoices.json` - Invoicing module
- [ ] `estimates.json` - Estimates module
- [ ] `inspections.json` - Inspection module
- [ ] `inventory.json` - Parts inventory
- [ ] `services.json` - Services catalog
- [ ] `payments.json` - Payment module
- [ ] `reports.json` - Reports module
- [ ] `settings.json` - Settings pages
- [ ] `admin.json` - Admin panel
- [ ] `portal.json` - Customer portal
- [ ] `booking.json` - Public booking
- [ ] `errors.json` - Error messages
- [ ] `notifications.json` - Notification text

### 25.3 Hardcoded Text Hunt
- [ ] Search entire codebase for hardcoded English strings
- [ ] Check for strings without `t()` function
- [ ] Verify button labels use translation keys
- [ ] Check placeholders are translated
- [ ] Verify error messages use i18n
- [ ] Check success messages
- [ ] Verify form labels

**Search Patterns to Check:**
```typescript
// Bad examples (hardcoded):
<button>Submit</button>
placeholder="Enter your email"
"Error: Invalid input"

// Good examples (translated):
<button>{t('common:submit')}</button>
placeholder={t('auth:email_placeholder')}
{t('errors:invalid_input')}
```

---

## SECTION 26: RESPONSIVE DESIGN & UI/UX

### 26.1 Responsive Breakpoints
- [ ] Test mobile (< 640px)
- [ ] Test tablet (640px - 1024px)
- [ ] Test desktop (> 1024px)
- [ ] Check all pages render correctly at each breakpoint
- [ ] Verify mobile navigation (hamburger menu)
- [ ] Test touch interactions on mobile
- [ ] Check tablet sidebar behavior

### 26.2 Component Consistency
- [ ] Verify all buttons use consistent styling
- [ ] Check form inputs have consistent design
- [ ] Test modals/dialogs across pages
- [ ] Verify loading states (SkeletonLoader)
- [ ] Check empty states consistency
- [ ] Test error states display

### 26.3 Animations
- [ ] Verify Framer Motion animations don't cause lag
- [ ] Check page transitions are smooth
- [ ] Test hover states
- [ ] Verify loading animations

---

## SECTION 27: PERFORMANCE & OPTIMIZATION

### 27.1 Performance Checks
- [ ] Run Lighthouse audit on all major pages
- [ ] Check for unused imports (TypeScript)
- [ ] Verify no console.log statements in production
- [ ] Test API response times (< 500ms goal)
- [ ] Check bundle size
- [ ] Verify code splitting
- [ ] Test lazy loading of components

### 27.2 Database Optimization
- [ ] Check for missing indexes
- [ ] Verify query performance (use `.explain()`)
- [ ] Test pagination efficiency
- [ ] Check for N+1 query problems

### 27.3 Caching
- [ ] Verify Redis caching is working
- [ ] Check cache invalidation logic
- [ ] Test stale data scenarios

---

## SECTION 28: SECURITY AUDIT

### 28.1 Authentication & Authorization
- [ ] Verify JWT expiration
- [ ] Check password hashing (bcrypt)
- [ ] Test role-based access control (RBAC)
- [ ] Verify tenant isolation (no cross-tenant data access)
- [ ] Check API endpoint protection
- [ ] Test unauthorized access attempts

### 28.2 Input Validation
- [ ] Verify all user inputs are validated (Zod)
- [ ] Check for SQL injection vulnerabilities (Mongoose protects)
- [ ] Test XSS prevention
- [ ] Verify CSRF protection
- [ ] Check file upload validation (size, type)

### 28.3 Data Protection
- [ ] Verify sensitive data is not logged
- [ ] Check for exposed API keys in code
- [ ] Test environment variable usage
- [ ] Verify HTTPS enforcement (production)

---

## SECTION 29: INTEGRATION TESTING

### 29.1 External Integrations
- [ ] **Stripe** - Test payment processing
- [ ] **ZATCA** - Test e-invoicing submission
- [ ] **WhatsApp (WAHA)** - Test message sending
- [ ] **Cloudinary** - Test image uploads
- [ ] **Resend** - Test email sending
- [ ] **Redis** - Test caching and rate limiting

### 29.2 Webhooks
- [ ] Test WhatsApp webhook reception
- [ ] Verify webhook signature validation
- [ ] Check webhook error handling

---

## SECTION 30: ERROR HANDLING & EDGE CASES

### 30.1 Error Scenarios
- [ ] Test database connection failure
- [ ] Verify external API failures are handled
- [ ] Check network timeout handling
- [ ] Test invalid data scenarios
- [ ] Verify 404 pages
- [ ] Test 500 error pages
- [ ] Check error logging

### 30.2 Edge Cases
- [ ] Test with empty database (fresh tenant)
- [ ] Verify behavior with maximum data (1000+ records)
- [ ] Test concurrent user actions
- [ ] Check race conditions (e.g., simultaneous bookings)
- [ ] Test duplicate submissions
- [ ] Verify browser back button behavior

---

## SECTION 31: SOCKET.IO & REAL-TIME FEATURES

### 31.1 Real-Time Job Card Updates
- [ ] Test Socket.io connection
- [ ] Verify job card status updates in real-time
- [ ] Check disconnection/reconnection handling
- [ ] Test multi-user updates

### 31.2 WhatsApp Event Listeners
- [ ] Test message reception events
- [ ] Verify event broadcasting
- [ ] Check event payload structure

---

## SECTION 32: PDF GENERATION & PRINTING

### 32.1 PDF Components
- [ ] Test InvoiceDocument PDF generation
- [ ] Verify EstimateDocument PDF
- [ ] Check InspectionDocument PDF
- [ ] Test Arabic PDF rendering (RTL)
- [ ] Verify company logo in PDFs
- [ ] Check ZATCA QR code in invoices
- [ ] Test PDF download functionality

### 32.2 Print Views
- [ ] Test PrintInvoiceDocument
- [ ] Verify PrintEstimateDocument
- [ ] Check PrintInspectionDocument
- [ ] Test browser print dialog
- [ ] Verify print page breaks

---

## SECTION 33: FILE UPLOADS

### 33.1 Cloudinary Integration
- [ ] Test logo upload in organization settings
- [ ] Verify image upload in inspection photos
- [ ] Check file size limits
- [ ] Test file type validation (images only)
- [ ] Verify upload progress indicator
- [ ] Check error handling on failed uploads

---

## SECTION 34: SEARCH FUNCTIONALITY

### 34.1 Global Search
- [ ] Test global search bar in dashboard
- [ ] Verify search across customers
- [ ] Check search across vehicles
- [ ] Test search across job cards
- [ ] Verify search across invoices
- [ ] Check search suggestions
- [ ] Test search debouncing

---

## SECTION 35: NOTIFICATIONS

### 35.1 Notification System
- [ ] Test notification bell
- [ ] Verify notification list
- [ ] Check mark as read functionality
- [ ] Test notification creation
- [ ] Verify email notifications
- [ ] Check WhatsApp notifications
- [ ] Test SMS notifications (if enabled)

---

## FINAL CHECKLIST

### Code Quality
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings
- [ ] No unused imports
- [ ] No console.log statements
- [ ] Proper error handling everywhere
- [ ] All async functions have try/catch

### Translation Completeness
- [ ] All pages have translations
- [ ] No hardcoded English text
- [ ] Arabic translations exist for all keys
- [ ] RTL layout works correctly
- [ ] Date/time formats respect locale

### API Functionality
- [ ] All 140+ endpoints tested
- [ ] Proper error responses
- [ ] Correct status codes (200, 201, 400, 401, 404, 500)
- [ ] Response times < 500ms
- [ ] Pagination works correctly

### Security
- [ ] All routes protected with auth
- [ ] Tenant isolation working
- [ ] No sensitive data exposed
- [ ] Input validation on all endpoints
- [ ] RBAC enforced

### Performance
- [ ] Page load times < 3s
- [ ] No memory leaks
- [ ] Efficient database queries
- [ ] Proper caching
- [ ] Optimized images

### User Experience
- [ ] All buttons work
- [ ] Forms validate correctly
- [ ] Loading states display
- [ ] Error messages are clear
- [ ] Success confirmations show
- [ ] Mobile responsive
- [ ] Animations smooth

---

## TESTING EXECUTION PLAN

**Phase 1: Static Analysis (Days 1-2)**
- Run TypeScript compiler
- Run ESLint
- Search for hardcoded strings
- Check for console.log statements
- Review all translation files

**Phase 2: API Testing (Days 3-5)**
- Test all 140+ API endpoints systematically
- Verify request/response formats
- Check error handling
- Test authentication/authorization

**Phase 3: Component Testing (Days 6-8)**
- Test all forms and validation
- Verify component rendering
- Check state management
- Test custom hooks

**Phase 4: Integration Testing (Days 9-11)**
- Test external integrations
- Verify webhooks
- Check real-time features
- Test file uploads

**Phase 5: End-to-End Flows (Days 12-14)**
- Test complete user journeys
- Verify booking flow
- Test inspection → estimate → job card → invoice flow
- Check customer portal experience

**Phase 6: Performance & Security (Days 15-16)**
- Run performance audits
- Security vulnerability scan
- Load testing
- Stress testing

**Phase 7: Final Review (Day 17)**
- Review all test results
- Document bugs found
- Prioritize fixes
- Create fix roadmap

---

**ESTIMATED TESTING TIME: 17 DAYS**

**BUGS FOUND: [To be filled during testing]**

**PRIORITY FIXES: [To be listed after testing]**

---

END OF CLAUDE'S TESTING PLAN
