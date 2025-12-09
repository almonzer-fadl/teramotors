# 👤 MANUAL TESTING PLAN FOR USER
## TeraMotors Multi-Tenant Auto Repair Shop SaaS - Complete UI/UX Testing

**Branch:** `tenet`
**Total Pages:** 84 unique pages
**Testing Scope:** Click every button, read every text, test every feature from a user perspective

---

## HOW TO USE THIS DOCUMENT

1. **Go through each section systematically** - Don't skip ahead
2. **Check each checkbox [ ]** as you complete testing
3. **Write bugs in the "BUGS FOUND" section** at the bottom of each section
4. **Test in both English AND Arabic** for every page
5. **Test on Desktop AND Mobile** for every page
6. **Take screenshots of bugs** and reference them in the bugs section

---

## TESTING SETUP

### Browsers to Test
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile Safari (iPhone)
- [ ] Mobile Chrome (Android)

### Screen Sizes to Test
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Test Accounts Needed
- [ ] Admin User
- [ ] Mechanic User
- [ ] Inspector User
- [ ] Customer Account (for portal)

---

## SECTION 1: AUTHENTICATION & REGISTRATION

### 1.1 Login Page (`/login`)
**English Testing:**
- [ ] Page loads without errors
- [ ] Logo displays correctly
- [ ] "Welcome Back" heading visible
- [ ] Email input field works
- [ ] Password input field works
- [ ] "Show/Hide Password" icon works
- [ ] "Remember Me" checkbox toggles
- [ ] "Forgot Password?" link is visible
- [ ] "Sign In" button works
- [ ] Form validation shows errors for empty fields
- [ ] Form validation shows error for invalid email
- [ ] Error message displays for wrong password
- [ ] Successful login redirects to dashboard
- [ ] "Don't have an account? Register" link works

**Arabic Testing:**
- [ ] Switch to Arabic language
- [ ] All text is in Arabic
- [ ] Text aligns to the right (RTL)
- [ ] Form inputs show Arabic placeholders
- [ ] Error messages display in Arabic
- [ ] All buttons show Arabic text

**Mobile Testing:**
- [ ] Page is responsive on mobile
- [ ] All elements are touchable
- [ ] Keyboard appears when tapping inputs
- [ ] No horizontal scrolling

**BUGS FOUND:**
```
[Leave empty - fill in as you find bugs]

Example:
1. Login button is cut off on iPhone SE (375px width)
2. Arabic error message missing for "Invalid email"
3. Remember me checkbox too small on mobile
```

---

### 1.2 Registration Page (`/register`)
**English Testing:**
- [ ] Page loads correctly
- [ ] Company name field works
- [ ] Company slug field works
- [ ] Slug shows availability check
- [ ] Email field validates format
- [ ] Password field validates strength
- [ ] Password confirmation validates matching
- [ ] First name field works
- [ ] Last name field works
- [ ] Phone number field works
- [ ] Terms & Conditions checkbox works
- [ ] "Create Account" button works
- [ ] Success message appears
- [ ] Redirects to onboarding or dashboard
- [ ] "Already have an account? Login" link works

**Arabic Testing:**
- [ ] Switch to Arabic
- [ ] All labels in Arabic
- [ ] RTL layout working
- [ ] Validation messages in Arabic

**Mobile Testing:**
- [ ] Form is scrollable
- [ ] All fields accessible
- [ ] No overlapping elements

**BUGS FOUND:**
```

```

---

### 1.3 Forgot Password (`/forgot-password`)
**English Testing:**
- [ ] Page loads
- [ ] Email input field works
- [ ] "Send Reset Link" button works
- [ ] Success message shows
- [ ] Error for non-existent email shows
- [ ] "Back to Login" link works

**Arabic Testing:**
- [ ] All text in Arabic
- [ ] RTL working

**BUGS FOUND:**
```

```

---

### 1.4 Reset Password (`/reset-password`)
**English Testing:**
- [ ] Page loads with valid token
- [ ] New password field works
- [ ] Confirm password field works
- [ ] Password strength indicator shows
- [ ] "Reset Password" button works
- [ ] Success message appears
- [ ] Redirects to login
- [ ] Shows error for expired/invalid token

**Arabic Testing:**
- [ ] Arabic text working

**BUGS FOUND:**
```

```

---

## SECTION 2: MAIN DASHBOARD

### 2.1 Dashboard Home (`/dashboard`)
**English Testing:**
- [ ] Page loads with statistics
- [ ] Revenue card displays correct number
- [ ] Appointments card shows count
- [ ] Active jobs card displays
- [ ] Pending invoices card shows
- [ ] Recent activity feed works
- [ ] Quick action buttons work
- [ ] Charts render (if any)
- [ ] Sidebar navigation visible
- [ ] User dropdown in top-right works
- [ ] Theme toggle (light/dark) works
- [ ] Language switcher (EN/AR) works
- [ ] Search bar works
- [ ] Notification bell shows count
- [ ] Logo displays correctly

**Arabic Testing:**
- [ ] Switch to Arabic
- [ ] All cards in Arabic
- [ ] Numbers display correctly (Arabic numerals)
- [ ] Sidebar in Arabic
- [ ] RTL layout working

**Mobile Testing:**
- [ ] Hamburger menu works
- [ ] Bottom navigation appears
- [ ] Cards stack vertically
- [ ] All elements accessible

**BUGS FOUND:**
```

```

---

## SECTION 3: CUSTOMER MANAGEMENT

### 3.1 Customers List (`/dashboard/customers`)
**English Testing:**
- [ ] Page loads with customer table
- [ ] Table shows: Name, Email, Phone, Status
- [ ] Search bar filters customers
- [ ] "Add Customer" button visible
- [ ] Click on customer row opens details
- [ ] Edit icon in row works
- [ ] Delete icon shows confirmation
- [ ] Pagination works (Next/Previous)
- [ ] Filter by status (Active/Inactive) works
- [ ] Export button works (if exists)
- [ ] Empty state shows when no customers

**Arabic Testing:**
- [ ] Table headers in Arabic
- [ ] Search placeholder in Arabic
- [ ] All buttons in Arabic

**Mobile Testing:**
- [ ] Table is horizontally scrollable OR cards view
- [ ] Actions accessible on mobile

**BUGS FOUND:**
```

```

---

### 3.2 Add Customer (`/dashboard/customers/new`)
**English Testing:**
- [ ] Page loads with form
- [ ] First Name field works
- [ ] Last Name field works
- [ ] Email field validates format
- [ ] Phone field works
- [ ] Language dropdown (EN/AR) works
- [ ] All fields marked required show *
- [ ] Validation errors show on submit
- [ ] "Save" button works
- [ ] Success message appears
- [ ] Redirects to customer list
- [ ] "Cancel" button goes back

**Arabic Testing:**
- [ ] Form labels in Arabic
- [ ] Placeholders in Arabic
- [ ] Validation messages in Arabic

**BUGS FOUND:**
```

```

---

### 3.3 Customer Details (`/dashboard/customers/[id]`)
**English Testing:**
- [ ] Page loads with customer info
- [ ] Name displayed correctly
- [ ] Email displayed
- [ ] Phone displayed
- [ ] Vehicles list shows (if any)
- [ ] Appointments history shows
- [ ] Job cards history shows
- [ ] "Edit" button works
- [ ] "Delete" button shows confirmation
- [ ] Tabs work (if multiple tabs)

**Arabic Testing:**
- [ ] Customer details in Arabic

**BUGS FOUND:**
```

```

---

### 3.4 Edit Customer (`/dashboard/customers/[id]/edit`)
**English Testing:**
- [ ] Form pre-filled with data
- [ ] Can update First Name
- [ ] Can update Last Name
- [ ] Can update Phone
- [ ] Can update Language
- [ ] Email cannot be changed (or shows warning)
- [ ] "Save Changes" works
- [ ] Success message shows
- [ ] "Cancel" returns to details

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 4: VEHICLE MANAGEMENT

### 4.1 Vehicles List (`/dashboard/vehicles`)
**English Testing:**
- [ ] Page loads with vehicle table
- [ ] Columns: Make, Model, Year, Plate, Customer
- [ ] Search bar works
- [ ] Filter by type (Sedan, SUV, Truck, Motorcycle) works
- [ ] "Add Vehicle" button works
- [ ] Row actions (View, Edit, Delete) work
- [ ] Pagination works

**Arabic Testing:**
- [ ] Table in Arabic

**Mobile Testing:**
- [ ] Table scrollable/cards view

**BUGS FOUND:**
```

```

---

### 4.2 Add Vehicle (`/dashboard/vehicles/new`)
**English Testing:**
- [ ] Form loads
- [ ] Customer dropdown/search works
- [ ] Make field works
- [ ] Model field works
- [ ] Year field validates (1900 - current+1)
- [ ] License Plate field works
- [ ] VIN field works
- [ ] Vehicle Type selector works
- [ ] "Save" button works
- [ ] Validation shows for required fields

**Arabic Testing:**
- [ ] Form labels in Arabic

**BUGS FOUND:**
```

```

---

### 4.3 Vehicle Details (`/dashboard/vehicles/[id]`)
**English Testing:**
- [ ] Vehicle info displays
- [ ] Customer name links to customer page
- [ ] Service history shows
- [ ] Appointments for vehicle show
- [ ] Inspections show
- [ ] "Edit" button works
- [ ] "Delete" button confirms

**Arabic Testing:**
- [ ] Details in Arabic

**BUGS FOUND:**
```

```

---

### 4.4 Edit Vehicle (`/dashboard/vehicles/[id]/edit`)
**English Testing:**
- [ ] Form pre-filled
- [ ] Can update all fields
- [ ] Year validation works
- [ ] "Save Changes" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 5: APPOINTMENTS

### 5.1 Appointments List (`/dashboard/appointments`)
**English Testing:**
- [ ] List/table loads
- [ ] Status badges show (Scheduled, Confirmed, Completed, Cancelled)
- [ ] Correct colors for each status
- [ ] Filter by status works
- [ ] Filter by date range works
- [ ] Search by customer/vehicle works
- [ ] "Book Appointment" button works
- [ ] Today's appointments highlighted

**Arabic Testing:**
- [ ] List in Arabic
- [ ] Status badges in Arabic

**BUGS FOUND:**
```

```

---

### 5.2 Appointment Calendar (`/dashboard/appointments/calendar`)
**English Testing:**
- [ ] Calendar renders
- [ ] Month view works
- [ ] Week view works (if exists)
- [ ] Day view works (if exists)
- [ ] Appointments show on calendar
- [ ] Click on date opens booking
- [ ] Navigate between months works
- [ ] Today is highlighted

**Arabic Testing:**
- [ ] Calendar in Arabic (month names, day names)

**BUGS FOUND:**
```

```

---

### 5.3 New Appointment (`/dashboard/appointments/new`)
**English Testing:**
- [ ] Form loads
- [ ] Customer selector works
- [ ] Vehicle selector (filtered by customer) works
- [ ] Service multi-select works
- [ ] Date picker works
- [ ] Time slot selection shows available slots
- [ ] Mechanic assignment works
- [ ] Notes field works
- [ ] "Book" button works
- [ ] Shows error if slot is taken

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 5.4 Appointment Details (`/dashboard/appointments/[id]`)
**English Testing:**
- [ ] Details display
- [ ] Customer & vehicle info shows
- [ ] Date & time shows
- [ ] Services listed
- [ ] Mechanic assigned shown
- [ ] Status badge displays
- [ ] "Edit" button works
- [ ] "Cancel" button confirms
- [ ] "Convert to Job Card" button works

**Arabic Testing:**
- [ ] Details in Arabic

**BUGS FOUND:**
```

```

---

### 5.5 Edit Appointment
**English Testing:**
- [ ] Form pre-filled
- [ ] Can change date/time
- [ ] Slot availability updates
- [ ] Can reassign mechanic
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 6: JOB CARDS

### 6.1 Job Cards List (`/dashboard/job-cards`)
**English Testing:**
- [ ] Grid/list view loads
- [ ] Status filters work
- [ ] Search works
- [ ] Date range filter works
- [ ] Priority badges show
- [ ] "Create Job Card" button works
- [ ] Click on card opens details

**Arabic Testing:**
- [ ] List in Arabic

**BUGS FOUND:**
```

```

---

### 6.2 New Job Card (`/dashboard/job-cards/new`)
**English Testing:**
- [ ] Complex form loads
- [ ] Customer selector works
- [ ] Vehicle selector works
- [ ] Services multi-select works
- [ ] Parts selector works
- [ ] Can add multiple parts with quantities
- [ ] Labor hours input works
- [ ] Mechanic assignment works
- [ ] Cost calculations update automatically
- [ ] Notes field works
- [ ] Internal notes field works
- [ ] Photo upload works
- [ ] "Create" button works
- [ ] Can create from inspection
- [ ] Can create from estimate

**Arabic Testing:**
- [ ] Form in Arabic
- [ ] Calculations display correctly

**BUGS FOUND:**
```

```

---

### 6.3 Job Card Details (`/dashboard/job-cards/[id]`)
**English Testing:**
- [ ] Header shows job card ID, status, customer, vehicle
- [ ] Services list with prices displays
- [ ] Parts list with quantities displays
- [ ] Labor hours shows
- [ ] Mechanic assigned shows
- [ ] "Start Work" button works
- [ ] Timer displays when work started
- [ ] "Pause Work" button works
- [ ] "Complete" button works
- [ ] Status updates in real-time (Socket.io)
- [ ] Photo gallery shows
- [ ] Can add more photos
- [ ] "Generate Invoice" button works
- [ ] Notes display

**Arabic Testing:**
- [ ] Details in Arabic
- [ ] Real-time updates work in Arabic

**BUGS FOUND:**
```

```

---

### 6.4 Edit Job Card
**English Testing:**
- [ ] Form pre-filled
- [ ] Can add/remove services
- [ ] Can add/remove parts
- [ ] Costs recalculate
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 7: INVOICES

### 7.1 Invoices List (`/dashboard/invoices`)
**English Testing:**
- [ ] Table loads
- [ ] Columns: Invoice #, Customer, Amount, Status, Date
- [ ] Status filters work (Draft, Sent, Paid, Overdue)
- [ ] Search works
- [ ] Date range filter works
- [ ] "Create Invoice" button works
- [ ] Row actions: View, Edit, Send, Print, PDF

**Arabic Testing:**
- [ ] Table in Arabic

**BUGS FOUND:**
```

```

---

### 7.2 New Invoice (`/dashboard/invoices/new`)
**English Testing:**
- [ ] Form loads
- [ ] Customer selector works
- [ ] Can add line items (services/parts)
- [ ] Quantity input works
- [ ] Unit price input works
- [ ] Line total calculates automatically
- [ ] Subtotal updates
- [ ] Tax (VAT) calculates
- [ ] Discount field works
- [ ] Total calculates correctly
- [ ] Payment terms dropdown works
- [ ] Due date calculates based on terms
- [ ] "Create" button works

**Arabic Testing:**
- [ ] Form in Arabic
- [ ] Numbers display correctly

**BUGS FOUND:**
```

```

---

### 7.3 Invoice Details (`/dashboard/invoices/[id]`)
**English Testing:**
- [ ] Invoice header shows: Invoice #, Date, Customer, Status
- [ ] Line items table displays
- [ ] Subtotal, Tax, Discount, Total display
- [ ] "Edit" button works (if not paid)
- [ ] "Send Email" button works
- [ ] "Download PDF" button works
- [ ] "Download PDF (Arabic)" button works
- [ ] "Print" button works
- [ ] "Mark as Paid" button works
- [ ] Payment history shows

**Arabic Testing:**
- [ ] Details in Arabic
- [ ] Arabic PDF generates correctly

**BUGS FOUND:**
```

```

---

### 7.4 Edit Invoice
**English Testing:**
- [ ] Form pre-filled
- [ ] Can modify line items
- [ ] Calculations update
- [ ] "Save" works
- [ ] Cannot edit if paid (shows message)

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 7.5 Invoice PDF
**English Testing:**
- [ ] PDF opens in new tab
- [ ] Company logo shows
- [ ] Invoice details correct
- [ ] Line items table formatted
- [ ] Tax breakdown shows
- [ ] ZATCA QR code shows (if enabled)
- [ ] Footer shows

**Arabic Testing:**
- [ ] Arabic PDF in RTL layout
- [ ] Arabic text renders correctly
- [ ] Numbers in Arabic format

**BUGS FOUND:**
```

```

---

## SECTION 8: ESTIMATES

### 8.1 Estimates List (`/dashboard/estimates`)
**English Testing:**
- [ ] Table loads
- [ ] Status filters work
- [ ] Search works
- [ ] "Create Estimate" button works
- [ ] Row actions: View, Edit, Convert, PDF
- [ ] Expiration date highlighted

**Arabic Testing:**
- [ ] Table in Arabic

**BUGS FOUND:**
```

```

---

### 8.2 New Estimate (`/dashboard/estimates/new`)
**English Testing:**
- [ ] Form loads
- [ ] Customer/vehicle selectors work
- [ ] Can add services and parts
- [ ] Cost calculations work
- [ ] Validity period input works
- [ ] Notes field works
- [ ] "Create" button works
- [ ] Can create from inspection

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 8.3 Estimate Details (`/dashboard/estimates/[id]`)
**English Testing:**
- [ ] Details display
- [ ] Line items show
- [ ] Total cost displays
- [ ] "Accept" button works
- [ ] "Reject" button works
- [ ] "Convert to Job Card" button works
- [ ] "Convert to Invoice" button works
- [ ] "Download PDF" button works
- [ ] Expiration status shows

**Arabic Testing:**
- [ ] Details in Arabic

**BUGS FOUND:**
```

```

---

### 8.4 Edit Estimate
**English Testing:**
- [ ] Form pre-filled
- [ ] Can modify items
- [ ] Recalculations work
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 9: INSPECTIONS

### 9.1 Inspections List (`/dashboard/inspections`)
**English Testing:**
- [ ] List loads
- [ ] Filters work
- [ ] Search works
- [ ] "New Inspection" button works
- [ ] Row actions work

**Arabic Testing:**
- [ ] List in Arabic

**BUGS FOUND:**
```

```

---

### 9.2 New Inspection (`/dashboard/inspections/new`)
**English Testing:**
- [ ] Form loads
- [ ] Customer/vehicle selectors work
- [ ] Template selector works
- [ ] Inspection items checklist loads
- [ ] Can mark items as Pass/Fail/NA
- [ ] Can upload photo for each item
- [ ] Notes field per item works
- [ ] "Create" button works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 9.3 Inspection Details (`/dashboard/inspections/[id]`)
**English Testing:**
- [ ] Details display
- [ ] Inspection items with status show
- [ ] Photos gallery displays
- [ ] "Edit" button works
- [ ] "Generate PDF" button works
- [ ] "Create Estimate" button works
- [ ] "Create Job Card" button works
- [ ] "Match Parts" button works

**Arabic Testing:**
- [ ] Details in Arabic

**BUGS FOUND:**
```

```

---

### 9.4 Edit Inspection
**English Testing:**
- [ ] Form pre-filled
- [ ] Can update items
- [ ] Can upload/remove photos
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 9.5 Inspection Templates List (`/dashboard/inspections/templates`)
**English Testing:**
- [ ] Templates list loads
- [ ] Vehicle type categories show
- [ ] "Create Template" button works
- [ ] Row actions: Edit, Delete, Duplicate

**Arabic Testing:**
- [ ] List in Arabic

**BUGS FOUND:**
```

```

---

### 9.6 New Inspection Template
**English Testing:**
- [ ] Form loads
- [ ] Template name field works
- [ ] Vehicle type selector works
- [ ] Can add inspection items
- [ ] Can categorize items
- [ ] Can reorder items (drag/drop)
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 9.7 Edit Inspection Template
**English Testing:**
- [ ] Form pre-filled
- [ ] Can modify items
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 9.8 Inspection PDF
**English Testing:**
- [ ] PDF opens
- [ ] Inspection details show
- [ ] Items checklist displays
- [ ] Photos embedded
- [ ] Company branding shows

**Arabic Testing:**
- [ ] Arabic PDF correct

**BUGS FOUND:**
```

```

---

## SECTION 10: PARTS INVENTORY

### 10.1 Parts List (`/dashboard/inventory`)
**English Testing:**
- [ ] Table loads
- [ ] Columns: Name, SKU, Quantity, Price
- [ ] Search works
- [ ] Filter by category works
- [ ] Filter by low stock works
- [ ] "Add Part" button works
- [ ] Row actions work
- [ ] Low stock items highlighted

**Arabic Testing:**
- [ ] Table in Arabic

**BUGS FOUND:**
```

```

---

### 10.2 Low Stock Alerts (`/dashboard/inventory/alerts`)
**English Testing:**
- [ ] Alerts table loads
- [ ] Parts below reorder level show
- [ ] Can dismiss alert
- [ ] Email notification settings work

**Arabic Testing:**
- [ ] Alerts in Arabic

**BUGS FOUND:**
```

```

---

### 10.3 Add Part (`/dashboard/inventory/new`)
**English Testing:**
- [ ] Form loads
- [ ] Name field works
- [ ] SKU field works
- [ ] Category dropdown works
- [ ] Quantity input works
- [ ] Price field works
- [ ] Cost field works
- [ ] Reorder level field works
- [ ] Supplier field works
- [ ] Barcode field works (if exists)
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 10.4 Part Details (`/dashboard/inventory/[id]`)
**English Testing:**
- [ ] Part info displays
- [ ] Stock level shows
- [ ] Usage history displays
- [ ] "Edit" button works
- [ ] "Adjust Stock" button works
- [ ] "Delete" confirms

**Arabic Testing:**
- [ ] Details in Arabic

**BUGS FOUND:**
```

```

---

### 10.5 Edit Part
**English Testing:**
- [ ] Form pre-filled
- [ ] Can update fields
- [ ] Price/cost validation works
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 11: SERVICES CATALOG

### 11.1 Services List (`/dashboard/services`)
**English Testing:**
- [ ] Table loads
- [ ] Search works
- [ ] Filter by category works
- [ ] Filter by active status works
- [ ] "Add Service" button works
- [ ] Row actions work

**Arabic Testing:**
- [ ] Table in Arabic

**BUGS FOUND:**
```

```

---

### 11.2 Add Service (`/dashboard/services/new`)
**English Testing:**
- [ ] Form loads
- [ ] Name field works
- [ ] Description field works
- [ ] Category selector works
- [ ] Price field works
- [ ] Duration field works
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 11.3 Service Details (`/dashboard/services/[id]`)
**English Testing:**
- [ ] Service info displays
- [ ] Usage statistics show
- [ ] "Edit" button works
- [ ] "Delete" confirms

**Arabic Testing:**
- [ ] Details in Arabic

**BUGS FOUND:**
```

```

---

### 11.4 Edit Service
**English Testing:**
- [ ] Form pre-filled
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 12: PAYMENTS

### 12.1 Payments List (`/dashboard/payments`)
**English Testing:**
- [ ] Table loads
- [ ] Filter by method works
- [ ] Filter by status works
- [ ] Date filter works
- [ ] Search works
- [ ] "Record Payment" button works
- [ ] Row actions work

**Arabic Testing:**
- [ ] Table in Arabic

**BUGS FOUND:**
```

```

---

### 12.2 New Payment (`/dashboard/payments/new`)
**English Testing:**
- [ ] Form loads
- [ ] Invoice selector works
- [ ] Amount field validates
- [ ] Payment method selector works
- [ ] Date picker works
- [ ] Reference number field works
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 12.3 Payment Details
**English Testing:**
- [ ] Payment info displays
- [ ] Linked invoice shows
- [ ] "Edit" button works (if allowed)
- [ ] "Refund" button confirms

**Arabic Testing:**
- [ ] Details in Arabic

**BUGS FOUND:**
```

```

---

### 12.4 Edit Payment
**English Testing:**
- [ ] Form pre-filled
- [ ] "Save" works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 13: REPORTS

### 13.1 Reports Hub (`/dashboard/reports`)
**English Testing:**
- [ ] Reports list displays
- [ ] Report cards/tiles show
- [ ] Descriptions show
- [ ] Click on report navigates

**Arabic Testing:**
- [ ] Reports in Arabic

**BUGS FOUND:**
```

```

---

### 13.2 Sales Report (`/dashboard/reports/sales`)
**English Testing:**
- [ ] Report loads
- [ ] Date range selector works
- [ ] Data table displays
- [ ] "Export to Excel" button works
- [ ] Charts display (if any)
- [ ] Summary metrics show

**Arabic Testing:**
- [ ] Report in Arabic
- [ ] Excel export in Arabic

**BUGS FOUND:**
```

```

---

### 13.3 Accounts Receivable Report
**English Testing:**
- [ ] Report loads
- [ ] Aging buckets show (Current, 30, 60, 90+ days)
- [ ] Customer breakdown shows
- [ ] Total outstanding correct
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

### 13.4 Inventory Report
**English Testing:**
- [ ] Parts listing shows
- [ ] Quantities correct
- [ ] Valuation calculated
- [ ] Low stock highlighted
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

### 13.5 Inventory Valuation Report
**English Testing:**
- [ ] Total inventory value shows
- [ ] Cost calculations correct
- [ ] Category breakdown shows
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

### 13.6 Payments Received Report
**English Testing:**
- [ ] Payment transactions list
- [ ] Payment method breakdown
- [ ] Date filtering works
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

### 13.7 Profit & Loss Report
**English Testing:**
- [ ] Revenue section shows
- [ ] Expenses section shows
- [ ] Net profit calculates
- [ ] Period comparison works
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

### 13.8 Technician Performance Report
**English Testing:**
- [ ] Technician list shows
- [ ] KPIs display (jobs completed, avg time, revenue)
- [ ] Performance ranking shows
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

### 13.9 VAT Report
**English Testing:**
- [ ] VAT collected shows
- [ ] VAT breakdown by rate
- [ ] Total calculations correct
- [ ] ZATCA compliance info shows
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

### 13.10 Work Logs Report
**English Testing:**
- [ ] Time tracking data shows
- [ ] Mechanic hours display
- [ ] Job card linking works
- [ ] Export works

**Arabic Testing:**
- [ ] Report in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 14: SETTINGS

### 14.1 Settings Hub (`/dashboard/settings`)
**English Testing:**
- [ ] Settings categories display
- [ ] Navigation cards work

**Arabic Testing:**
- [ ] Hub in Arabic

**BUGS FOUND:**
```

```

---

### 14.2 Organization Settings
**English Testing:**
- [ ] Form loads
- [ ] Company name field works
- [ ] Address fields work
- [ ] Logo upload works
- [ ] Contact info fields work
- [ ] "Save" button works
- [ ] Success message shows

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 14.3 Appearance Settings
**English Testing:**
- [ ] Theme selector (light/dark) works
- [ ] Primary color picker works
- [ ] Logo upload works
- [ ] Preview shows changes
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 14.4 Booking Settings
**English Testing:**
- [ ] Enable/disable toggle works
- [ ] Working hours editor works (per day)
- [ ] Appointment duration input works
- [ ] Buffer time field works
- [ ] Advance booking days works
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 14.5 Inspection Settings
**English Testing:**
- [ ] Default template selector works
- [ ] Inspection numbering format works
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 14.6 Invoicing Settings
**English Testing:**
- [ ] Invoice prefix field works
- [ ] Next invoice number works
- [ ] VAT rate input works
- [ ] Payment terms works
- [ ] Default due days works
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 14.7 Localization Settings
**English Testing:**
- [ ] Language selector works
- [ ] Timezone dropdown works
- [ ] Currency selector works
- [ ] Date format options work
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 14.8 Integrations Settings
**English Testing:**
- [ ] WhatsApp integration toggle works
- [ ] WAHA session setup works
- [ ] QR code displays for WhatsApp
- [ ] Email settings (SMTP) work
- [ ] API keys fields work
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 14.9 ZATCA Settings
**English Testing:**
- [ ] ZATCA enabled toggle works
- [ ] Seller info fields work
- [ ] Tax registration number works
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 14.10 Subscription Settings
**English Testing:**
- [ ] Current plan displays
- [ ] Usage metrics show
- [ ] Upgrade/downgrade buttons work
- [ ] Billing history shows

**Arabic Testing:**
- [ ] Page in Arabic

**BUGS FOUND:**
```

```

---

### 14.11 User Management Settings
**English Testing:**
- [ ] User list shows
- [ ] "Add User" button works
- [ ] Role assignment works
- [ ] User status toggle works
- [ ] Password reset button works

**Arabic Testing:**
- [ ] Page in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 15: USER MANAGEMENT

### 15.1 Users List (`/dashboard/users`)
**English Testing:**
- [ ] Table loads
- [ ] Role badges show
- [ ] "Add User" button works
- [ ] Row actions work
- [ ] Search works

**Arabic Testing:**
- [ ] Table in Arabic

**BUGS FOUND:**
```

```

---

### 15.2 User Profile (`/dashboard/profile`)
**English Testing:**
- [ ] Profile form loads
- [ ] Name, email display
- [ ] Password change works
- [ ] Profile photo upload works
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Profile in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 16: WHATSAPP INTEGRATION

### 16.1 WhatsApp Interface (`/dashboard/whatsapp`)
**English Testing:**
- [ ] Conversation list loads
- [ ] Message thread displays
- [ ] Send message works
- [ ] Message templates work
- [ ] Customer linking works
- [ ] File/image sending works

**Arabic Testing:**
- [ ] Interface in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 17: ADMIN PANEL

### 17.1 Admin Dashboard (`/dashboard/admin`)
**English Testing:**
- [ ] Platform-wide metrics display
- [ ] Tenant count shows
- [ ] Revenue summary shows
- [ ] Active users count shows
- [ ] System health status shows

**Arabic Testing:**
- [ ] Dashboard in Arabic

**BUGS FOUND:**
```

```

---

### 17.2 Tenants Management
**English Testing:**
- [ ] All tenants table loads
- [ ] Search works
- [ ] Filters work
- [ ] "Add Tenant" button works (if exists)
- [ ] Row actions work

**Arabic Testing:**
- [ ] Table in Arabic

**BUGS FOUND:**
```

```

---

### 17.3 Tenant Details Editor
**English Testing:**
- [ ] Form loads
- [ ] All tenant settings editable
- [ ] Subscription management works
- [ ] Usage limits editable
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Form in Arabic

**BUGS FOUND:**
```

```

---

### 17.4 System Overview
**English Testing:**
- [ ] System health dashboard loads
- [ ] Database status shows
- [ ] Redis connection status shows
- [ ] API response times display
- [ ] Error rates show

**Arabic Testing:**
- [ ] Overview in Arabic

**BUGS FOUND:**
```

```

---

### 17.5 Admin Settings
**English Testing:**
- [ ] Global platform settings load
- [ ] Default limits editable
- [ ] Feature flags work
- [ ] "Save" button works

**Arabic Testing:**
- [ ] Settings in Arabic

**BUGS FOUND:**
```

```

---

### 17.6 Data Migration
**English Testing:**
- [ ] Migration tools load
- [ ] Data transformation scripts work
- [ ] Rollback functionality works

**Arabic Testing:**
- [ ] Page in Arabic

**BUGS FOUND:**
```

```

---

### 17.7 Admin Analytics
**English Testing:**
- [ ] Tenant analytics load
- [ ] Subscription metrics show
- [ ] Revenue charts display
- [ ] MRR calculations show

**Arabic Testing:**
- [ ] Analytics in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 18: ONBOARDING

### 18.1 Onboarding Flow (`/dashboard/onboarding`)
**English Testing:**
- [ ] Multi-step wizard loads
- [ ] Company setup step works
- [ ] Service catalog setup works
- [ ] Parts inventory import works
- [ ] Completion redirects correctly

**Arabic Testing:**
- [ ] Onboarding in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 19: PUBLIC BOOKING SYSTEM

### 19.1 Public Booking Page (`/book/[slug]`)
**English Testing:**
- [ ] Page loads with tenant branding
- [ ] BookingWizardModern displays
- [ ] Step 1: Inspection type selection works
- [ ] InspectionTypeSelector shows templates
- [ ] Can select inspection type
- [ ] Step 2: Date & Time selection works
- [ ] Calendar displays correctly
- [ ] Month/year navigation works
- [ ] Available dates highlighted
- [ ] Can select date
- [ ] Time slots display
- [ ] Can select time slot
- [ ] Step 3: Customer form works
- [ ] All fields validate
- [ ] Vehicle fields work
- [ ] Step 4: Confirmation shows
- [ ] Booking submission works
- [ ] Success message displays
- [ ] Theme toggle works
- [ ] Language switcher works (EN/AR)

**Arabic Testing:**
- [ ] Switch to Arabic
- [ ] All steps in Arabic
- [ ] Calendar in Arabic (month names, day names)
- [ ] Time slots in Arabic
- [ ] Form labels in Arabic
- [ ] RTL layout working

**Mobile Testing:**
- [ ] Booking wizard responsive
- [ ] All steps accessible
- [ ] Calendar touchable
- [ ] Time slots selectable

**BUGS FOUND:**
```

```

---

## SECTION 20: CUSTOMER PORTAL

### 20.1 Portal Login (`/portal/[slug]/login`)
**English Testing:**
- [ ] Login page loads
- [ ] Email/phone input works
- [ ] "Request OTP" button works
- [ ] OTP input field appears
- [ ] 6-digit OTP validation
- [ ] "Verify OTP" button works
- [ ] Success redirects to dashboard
- [ ] Error messages show
- [ ] "Resend OTP" works

**Arabic Testing:**
- [ ] Login in Arabic

**BUGS FOUND:**
```

```

---

### 20.2 Portal Dashboard (`/portal/[slug]`)
**English Testing:**
- [ ] Dashboard loads with customer name in header
- [ ] Welcome message shows customer first name
- [ ] Customer email displays
- [ ] Logo displays correctly
- [ ] Theme toggle works
- [ ] Language switcher works
- [ ] Logout button works
- [ ] Stats cards show (Total Appointments, Completed, My Vehicles)
- [ ] Upcoming Appointments section displays
- [ ] "View All" button opens appointments modal
- [ ] My Vehicles section displays
- [ ] "View All" button opens vehicles modal
- [ ] Quick Actions buttons work:
  - [ ] "Book Appointment" navigates to public booking
  - [ ] "My Appointments" opens modal
  - [ ] "My Vehicles" opens modal
  - [ ] "My Profile" opens modal

**Modal Testing:**
- [ ] Appointments Modal (AppointmentsContent):
  - [ ] Modal opens with correct title
  - [ ] Upcoming appointments section shows
  - [ ] Past appointments section shows
  - [ ] Empty states display correctly
  - [ ] Close button works
- [ ] Vehicles Modal (VehiclesContent):
  - [ ] Modal opens
  - [ ] Vehicles list displays
  - [ ] "Add Vehicle" button visible
  - [ ] Empty state shows if no vehicles
  - [ ] Close button works
- [ ] Profile Modal (ProfileContent):
  - [ ] Modal opens
  - [ ] Profile form displays
  - [ ] Can edit first name, last name, phone
  - [ ] Email is read-only
  - [ ] Edit button toggles edit mode
  - [ ] Save button works
  - [ ] Success message shows
  - [ ] Close button works

**Arabic Testing:**
- [ ] Switch to Arabic
- [ ] Dashboard in Arabic
- [ ] All modals in Arabic
- [ ] RTL layout working

**Mobile Testing:**
- [ ] Portal responsive
- [ ] Modals full-screen on mobile
- [ ] All elements accessible

**BUGS FOUND:**
```

```

---

## SECTION 21: LANDING PAGE

### 21.1 Main Landing Page (`/`)
**English Testing:**
- [ ] Page loads
- [ ] Hero section displays
- [ ] Animations work
- [ ] CTA buttons work
- [ ] "Get Started" navigates correctly
- [ ] Features section shows
- [ ] Pricing section shows (if exists)
- [ ] Footer links work
- [ ] Logo loop animation works

**Arabic Testing:**
- [ ] Landing page in Arabic
- [ ] RTL layout working

**Mobile Testing:**
- [ ] Fully responsive
- [ ] All sections stack properly

**BUGS FOUND:**
```

```

---

## SECTION 22: NAVIGATION & LAYOUT

### 22.1 Sidebar Navigation
**English Testing:**
- [ ] All menu items visible
- [ ] Icons display correctly
- [ ] Active page highlighted
- [ ] Hover effects work
- [ ] Collapsed/expanded states work
- [ ] Role-based menu items show/hide correctly

**Arabic Testing:**
- [ ] Sidebar in Arabic
- [ ] Icons position correct in RTL

**Mobile Testing:**
- [ ] Hamburger menu works
- [ ] Sidebar slides in/out

**BUGS FOUND:**
```

```

---

### 22.2 Top Bar
**English Testing:**
- [ ] Search bar works
- [ ] Search suggestions show
- [ ] Notification bell works
- [ ] Notification dropdown shows
- [ ] User dropdown works
- [ ] Theme toggle works
- [ ] Language switcher works
- [ ] Tenant logo displays

**Arabic Testing:**
- [ ] Top bar in Arabic

**BUGS FOUND:**
```

```

---

### 22.3 Mobile Navigation
**English Testing:**
- [ ] Bottom nav bar shows on mobile
- [ ] All nav items work
- [ ] Active item highlighted

**Arabic Testing:**
- [ ] Mobile nav in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 23: THEME & APPEARANCE

### 23.1 Light/Dark Mode
**English Testing:**
- [ ] Toggle switches between light and dark
- [ ] All pages adapt to theme
- [ ] Colors appropriate in both modes
- [ ] Text readable in both modes
- [ ] Icons visible in both modes
- [ ] Modals/dropdowns styled correctly
- [ ] Forms readable in both modes

**Arabic Testing:**
- [ ] Theme works in Arabic mode

**BUGS FOUND:**
```

```

---

### 23.2 Responsive Design
**Desktop (1920x1080):**
- [ ] All pages look good
- [ ] No wasted space
- [ ] Elements properly aligned

**Laptop (1366x768):**
- [ ] All pages fit without scrolling (vertical scroll ok)
- [ ] No horizontal scrolling
- [ ] Elements not cramped

**Tablet (768x1024):**
- [ ] Sidebar collapses or adapts
- [ ] Tables scrollable/stack
- [ ] Forms readable

**Mobile (375x667):**
- [ ] All pages fully responsive
- [ ] No horizontal scrolling
- [ ] Touch targets large enough (44x44px minimum)
- [ ] Text readable (minimum 16px)
- [ ] Forms usable

**BUGS FOUND:**
```

```

---

## SECTION 24: ANIMATIONS & PERFORMANCE

### 24.1 Animations
**English Testing:**
- [ ] Page transitions smooth
- [ ] Hover animations work
- [ ] Modal open/close animations smooth
- [ ] Loading animations show
- [ ] Skeleton loaders display
- [ ] No janky animations
- [ ] Animations don't block interaction

**BUGS FOUND:**
```

```

---

### 24.2 Performance
**English Testing:**
- [ ] Pages load quickly (< 3 seconds)
- [ ] No lag when scrolling
- [ ] Forms responsive to input
- [ ] Tables load efficiently
- [ ] Images load quickly
- [ ] No memory leaks (test by using app for 30+ minutes)

**BUGS FOUND:**
```

```

---

## SECTION 25: ERROR HANDLING

### 25.1 Error Messages
**English Testing:**
- [ ] Form validation errors show
- [ ] API errors display user-friendly messages
- [ ] 404 page shows for invalid routes
- [ ] 500 error page shows for server errors
- [ ] Network errors handled gracefully

**Arabic Testing:**
- [ ] Error messages in Arabic

**BUGS FOUND:**
```

```

---

### 25.2 Empty States
**English Testing:**
- [ ] Empty customer list shows message
- [ ] Empty vehicle list shows message
- [ ] Empty appointments shows message
- [ ] Empty search results show message
- [ ] All empty states have helpful text

**Arabic Testing:**
- [ ] Empty states in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 26: LOADING STATES

### 26.1 Loading Indicators
**English Testing:**
- [ ] Loading spinners show during API calls
- [ ] Skeleton loaders show during page load
- [ ] Button spinners show during form submission
- [ ] "Loading..." text appropriate

**Arabic Testing:**
- [ ] Loading text in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 27: NOTIFICATIONS & ALERTS

### 27.1 Toast Notifications
**English Testing:**
- [ ] Success toasts show (green)
- [ ] Error toasts show (red)
- [ ] Warning toasts show (yellow)
- [ ] Info toasts show (blue)
- [ ] Toasts auto-dismiss after 3-5 seconds
- [ ] Can manually dismiss toasts

**Arabic Testing:**
- [ ] Toasts in Arabic

**BUGS FOUND:**
```

```

---

### 27.2 Confirmation Dialogs
**English Testing:**
- [ ] Delete confirmations show
- [ ] Cancel confirmations show (if needed)
- [ ] "Are you sure?" messages clear
- [ ] Yes/No buttons work

**Arabic Testing:**
- [ ] Confirmations in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 28: SEARCH FUNCTIONALITY

### 28.1 Global Search
**English Testing:**
- [ ] Search bar in top nav works
- [ ] Type to search
- [ ] Suggestions show
- [ ] Can search customers
- [ ] Can search vehicles
- [ ] Can search job cards
- [ ] Can search invoices
- [ ] Click result navigates

**Arabic Testing:**
- [ ] Search in Arabic
- [ ] Arabic search results

**BUGS FOUND:**
```

```

---

## SECTION 29: FILE UPLOADS

### 29.1 Image Uploads
**English Testing:**
- [ ] Logo upload in settings works
- [ ] Inspection photo upload works
- [ ] Profile photo upload works
- [ ] File size limit enforced
- [ ] File type validation (images only)
- [ ] Upload progress shows
- [ ] Success message after upload
- [ ] Error handling on failed upload
- [ ] Uploaded images display correctly

**Arabic Testing:**
- [ ] Upload messages in Arabic

**BUGS FOUND:**
```

```

---

## SECTION 30: EXPORT FUNCTIONALITY

### 30.1 Excel Export
**English Testing:**
- [ ] Reports export to Excel
- [ ] Customer list export works
- [ ] Vehicle list export works
- [ ] Excel file downloads
- [ ] Excel contains correct data
- [ ] Excel formatted properly

**Arabic Testing:**
- [ ] Excel export in Arabic
- [ ] Arabic text renders in Excel

**BUGS FOUND:**
```

```

---

## SECTION 31: REAL-TIME FEATURES

### 31.1 Job Card Updates
**English Testing:**
- [ ] Job card status updates in real-time
- [ ] Timer updates every second
- [ ] Multiple users see updates
- [ ] Socket connection stable

**BUGS FOUND:**
```

```

---

## SECTION 32: BROWSER COMPATIBILITY

### 32.1 Chrome/Chromium
**English Testing:**
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

**Arabic Testing:**
- [ ] Works in Arabic mode

**BUGS FOUND:**
```

```

---

### 32.2 Firefox
**English Testing:**
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

**Arabic Testing:**
- [ ] Works in Arabic mode

**BUGS FOUND:**
```

```

---

### 32.3 Safari (Mac)
**English Testing:**
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

**Arabic Testing:**
- [ ] Works in Arabic mode

**BUGS FOUND:**
```

```

---

### 32.4 Mobile Safari (iPhone)
**English Testing:**
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] Styling correct

**Arabic Testing:**
- [ ] Works in Arabic mode

**BUGS FOUND:**
```

```

---

### 32.5 Mobile Chrome (Android)
**English Testing:**
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] Styling correct

**Arabic Testing:**
- [ ] Works in Arabic mode

**BUGS FOUND:**
```

```

---

## SECTION 33: ACCESSIBILITY

### 33.1 Keyboard Navigation
**English Testing:**
- [ ] Can tab through forms
- [ ] Enter submits forms
- [ ] Escape closes modals
- [ ] Focus indicators visible

**BUGS FOUND:**
```

```

---

### 33.2 Screen Reader (Optional)
**English Testing:**
- [ ] Alt text on images
- [ ] Labels on inputs
- [ ] ARIA labels present

**BUGS FOUND:**
```

```

---

## MASTER BUGS LIST

### CRITICAL BUGS (App-breaking)
```
[Fill in critical bugs that prevent core functionality]

Example:
1. [Page/Feature]: Description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshot/Video link
```

---

### HIGH PRIORITY BUGS (Major features broken)
```
[Fill in high priority bugs]
```

---

### MEDIUM PRIORITY BUGS (Minor features broken)
```
[Fill in medium priority bugs]
```

---

### LOW PRIORITY BUGS (UI/UX issues)
```
[Fill in low priority bugs]
```

---

### HARDCODED TEXT FOUND
```
[List all hardcoded English text that needs translation]

Example:
1. File: CustomerForm.tsx, Line: 45
   Text: "Submit"
   Should be: {t('common:submit')}
```

---

### MISSING TRANSLATIONS
```
[List all missing Arabic translations]

Example:
1. Key: customers.add_customer
   File: ar/customers.json
   Status: Missing
```

---

### RESPONSIVE DESIGN ISSUES
```
[List all responsive design problems]

Example:
1. Page: /dashboard/customers
   Issue: Table not scrollable on mobile (iPhone SE)
   Viewport: 375x667
```

---

### PERFORMANCE ISSUES
```
[List any performance problems]

Example:
1. Page: /dashboard/reports/sales
   Issue: Takes 5+ seconds to load
   Expected: < 3 seconds
```

---

### ACCESSIBILITY ISSUES
```
[List accessibility problems]

Example:
1. Page: /dashboard/invoices/new
   Issue: No focus indicator on buttons
   Impact: Keyboard users can't see where they are
```

---

## TESTING SUMMARY

**Total Pages Tested:** _____ / 84

**Total Bugs Found:** _____
- Critical: _____
- High: _____
- Medium: _____
- Low: _____

**Total Hardcoded Text:** _____

**Total Missing Translations:** _____

**Testing Completed:** _____%

**Estimated Fix Time:** _____ days

---

## TESTING CHECKLIST

**Before Starting:**
- [ ] Created test user accounts (Admin, Mechanic, Inspector, Customer)
- [ ] Set up test data (customers, vehicles, services, parts)
- [ ] Prepared screenshot tool
- [ ] Opened browser dev tools

**During Testing:**
- [ ] Testing systematically (one section at a time)
- [ ] Checking checkboxes as completed
- [ ] Writing bugs immediately when found
- [ ] Taking screenshots of bugs
- [ ] Testing both English and Arabic
- [ ] Testing both desktop and mobile

**After Each Section:**
- [ ] Review bugs found
- [ ] Prioritize bugs
- [ ] Mark section as complete

**Final Steps:**
- [ ] Complete all sections
- [ ] Count total bugs
- [ ] Categorize bugs by priority
- [ ] Estimate fix time
- [ ] Share with development team

---

**HAPPY TESTING! BE THOROUGH AND DETAIL-ORIENTED!** 🚀

---

END OF MANUAL TESTING PLAN
