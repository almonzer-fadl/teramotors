import { test, expect } from '@playwright/test'

test.describe('TeraMotors E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[name="email"]', 'admin@teramotors.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard')
  })

  test.describe('Dashboard', () => {
    test('should display dashboard with overview cards', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for dashboard elements
      await expect(page.locator('h1')).toContainText('Dashboard')
      await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4)
      
      // Check for navigation
      await expect(page.locator('nav')).toBeVisible()
    })

    test('should show real-time updates', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for notification bell
      await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible()
    })
  })

  test.describe('Customer Management', () => {
    test('should create a new customer', async ({ page }) => {
      await page.goto('/customers')
      
      // Click add customer button
      await page.click('[data-testid="add-customer-btn"]')
      
      // Fill customer form
      await page.fill('input[name="firstName"]', 'John')
      await page.fill('input[name="lastName"]', 'Doe')
      await page.fill('input[name="email"]', 'john.doe@example.com')
      await page.fill('input[name="phone"]', '+1234567890')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Verify customer was created
      await expect(page.locator('text=John Doe')).toBeVisible()
    })

    test('should search customers', async ({ page }) => {
      await page.goto('/customers')
      
      // Search for customer
      await page.fill('input[placeholder*="search"]', 'John')
      await page.press('input[placeholder*="search"]', 'Enter')
      
      // Verify search results
      await expect(page.locator('text=John')).toBeVisible()
    })

    test('should edit customer', async ({ page }) => {
      await page.goto('/customers')
      
      // Click on first customer
      await page.click('[data-testid="customer-row"]:first-child')
      
      // Click edit button
      await page.click('[data-testid="edit-customer-btn"]')
      
      // Update customer name
      await page.fill('input[name="firstName"]', 'Jane')
      await page.click('button[type="submit"]')
      
      // Verify update
      await expect(page.locator('text=Jane')).toBeVisible()
    })
  })

  test.describe('Vehicle Management', () => {
    test('should add a new vehicle', async ({ page }) => {
      await page.goto('/vehicles')
      
      // Click add vehicle button
      await page.click('[data-testid="add-vehicle-btn"]')
      
      // Fill vehicle form
      await page.fill('input[name="make"]', 'Toyota')
      await page.fill('input[name="model"]', 'Camry')
      await page.fill('input[name="year"]', '2020')
      await page.fill('input[name="licensePlate"]', 'ABC-123')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Verify vehicle was created
      await expect(page.locator('text=Toyota Camry')).toBeVisible()
    })

    test('should view vehicle details', async ({ page }) => {
      await page.goto('/vehicles')
      
      // Click on first vehicle
      await page.click('[data-testid="vehicle-row"]:first-child')
      
      // Verify vehicle details page
      await expect(page.locator('h1')).toContainText('Vehicle Details')
      await expect(page.locator('[data-testid="vehicle-info"]')).toBeVisible()
    })
  })

  test.describe('Appointment Scheduling', () => {
    test('should create a new appointment', async ({ page }) => {
      await page.goto('/appointments')
      
      // Click add appointment button
      await page.click('[data-testid="add-appointment-btn"]')
      
      // Fill appointment form
      await page.selectOption('select[name="customerId"]', { index: 1 })
      await page.selectOption('select[name="vehicleId"]', { index: 1 })
      await page.selectOption('select[name="serviceId"]', { index: 1 })
      await page.fill('input[name="appointmentDate"]', '2024-02-01')
      await page.fill('input[name="startTime"]', '09:00')
      await page.fill('input[name="endTime"]', '10:00')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Verify appointment was created
      await expect(page.locator('text=Appointment scheduled')).toBeVisible()
    })

    test('should view calendar', async ({ page }) => {
      await page.goto('/appointments/calendar')
      
      // Verify calendar is displayed
      await expect(page.locator('[data-testid="calendar"]')).toBeVisible()
      await expect(page.locator('.rbc-calendar')).toBeVisible()
    })
  })

  test.describe('Job Cards', () => {
    test('should create a job card', async ({ page }) => {
      await page.goto('/job-cards')
      
      // Click add job card button
      await page.click('[data-testid="add-job-card-btn"]')
      
      // Fill job card form
      await page.selectOption('select[name="customerId"]', { index: 1 })
      await page.selectOption('select[name="vehicleId"]', { index: 1 })
      await page.selectOption('select[name="status"]', 'pending')
      await page.selectOption('select[name="priority"]', 'medium')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Verify job card was created
      await expect(page.locator('text=Job card created')).toBeVisible()
    })

    test('should update job status', async ({ page }) => {
      await page.goto('/job-cards')
      
      // Click on first job card
      await page.click('[data-testid="job-card-row"]:first-child')
      
      // Update status
      await page.selectOption('select[name="status"]', 'in-progress')
      await page.click('[data-testid="update-status-btn"]')
      
      // Verify status update
      await expect(page.locator('text=in-progress')).toBeVisible()
    })
  })

  test.describe('Parts Inventory', () => {
    test('should add a new part', async ({ page }) => {
      await page.goto('/inventory')
      
      // Click add part button
      await page.click('[data-testid="add-part-btn"]')
      
      // Fill part form
      await page.fill('input[name="name"]', 'Oil Filter')
      await page.fill('input[name="category"]', 'Engine')
      await page.fill('input[name="cost"]', '25.00')
      await page.fill('input[name="sellingPrice"]', '35.00')
      await page.fill('input[name="stockQuantity"]', '50')
      await page.fill('input[name="minStockLevel"]', '10')
      await page.fill('input[name="partNumber"]', 'OF-001')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Verify part was created
      await expect(page.locator('text=Oil Filter')).toBeVisible()
    })

    test('should check low stock alerts', async ({ page }) => {
      await page.goto('/inventory/alerts')
      
      // Verify alerts page
      await expect(page.locator('h1')).toContainText('Inventory Alerts')
      await expect(page.locator('[data-testid="alert-list"]')).toBeVisible()
    })
  })

  test.describe('Invoices', () => {
    test('should generate an invoice', async ({ page }) => {
      await page.goto('/invoices')
      
      // Click add invoice button
      await page.click('[data-testid="add-invoice-btn"]')
      
      // Fill invoice form
      await page.selectOption('select[name="jobCardId"]', { index: 1 })
      await page.fill('input[name="totalAmount"]', '100.00')
      await page.fill('input[name="dueDate"]', '2024-03-01')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Verify invoice was created
      await expect(page.locator('text=Invoice created')).toBeVisible()
    })

    test('should generate PDF invoice', async ({ page }) => {
      await page.goto('/invoices')
      
      // Click on first invoice
      await page.click('[data-testid="invoice-row"]:first-child')
      
      // Click generate PDF button
      await page.click('[data-testid="generate-pdf-btn"]')
      
      // Verify PDF generation (check for download or new tab)
      await expect(page.locator('text=PDF generated')).toBeVisible()
    })
  })

  test.describe('Authentication', () => {
    test('should logout successfully', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Click logout button
      await page.click('[data-testid="logout-btn"]')
      
      // Verify redirect to login page
      await page.waitForURL('/login')
      await expect(page.locator('h1')).toContainText('Login')
    })

    test('should redirect unauthenticated users', async ({ page }) => {
      // Clear authentication
      await page.context().clearCookies()
      
      // Try to access protected page
      await page.goto('/dashboard')
      
      // Should redirect to login
      await page.waitForURL('/login')
    })
  })

  test.describe('Role-Based Access', () => {
    test('should show admin-only features for admin users', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Check for admin navigation items
      await expect(page.locator('text=Settings')).toBeVisible()
      await expect(page.locator('text=Reports')).toBeVisible()
    })

    test('should hide admin features for non-admin users', async ({ page }) => {
      // Mock non-admin user
      await page.goto('/login')
      await page.fill('input[name="email"]', 'mechanic@teramotors.com')
      await page.fill('input[name="password"]', 'Password123!')
      await page.click('button[type="submit"]')
      
      await page.waitForURL('/dashboard')
      
      // Admin features should not be visible
      await expect(page.locator('text=Settings')).not.toBeVisible()
      await expect(page.locator('text=Reports')).not.toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/dashboard')
      
      // Check for mobile navigation
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
      
      // Test mobile menu
      await page.click('[data-testid="mobile-menu-btn"]')
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    })

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await page.goto('/dashboard')
      
      // Verify layout adapts to tablet
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('[data-testid="stats-card"]')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort())
      
      await page.goto('/customers')
      
      // Should show error message
      await expect(page.locator('text=Error loading customers')).toBeVisible()
    })

    test('should handle 404 errors', async ({ page }) => {
      await page.goto('/nonexistent-page')
      
      // Should show 404 page
      await expect(page.locator('text=404')).toBeVisible()
    })
  })
})
