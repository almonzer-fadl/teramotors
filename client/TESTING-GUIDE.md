# TeraMotors Testing Guide

## Overview

This guide covers all testing strategies and procedures for the TeraMotors auto repair shop management system. The application includes comprehensive test suites covering unit tests, integration tests, performance tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual components
│   ├── models.test.ts   # Database model tests
│   └── utils.test.ts    # Utility function tests
├── integration/         # Integration tests
│   ├── api.test.ts      # API endpoint tests
│   └── zatca.test.ts    # ZATCA compliance tests
├── e2e/                 # End-to-end tests
│   └── app.test.ts      # Full application flow tests
├── performance/         # Performance tests
│   └── api-performance.test.ts
├── fixtures/            # Test data and mocks
│   └── index.ts
└── setup.ts            # Test configuration
```

## Test Types

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Coverage**:
- Database models and validation
- Utility functions
- Business logic components
- Helper functions

**Running Unit Tests**:
```bash
npm run test:unit
```

**Example**:
```typescript
test('should create a valid customer', async () => {
  const customer = new Customer(mockCustomer)
  const savedCustomer = await customer.save()
  
  expect(savedCustomer._id).toBeDefined()
  expect(savedCustomer.firstName).toBe(mockCustomer.firstName)
})
```

### 2. Integration Tests

**Purpose**: Test API endpoints and component interactions

**Coverage**:
- API route handlers
- Database operations
- Authentication flows
- ZATCA compliance
- File uploads
- Error handling

**Running Integration Tests**:
```bash
npm run test:integration
```

**Example**:
```typescript
test('should return customers with pagination', async () => {
  const response = await customersGET(request)
  const data = await response.json()
  
  expect(response.status).toBe(200)
  expect(data.data).toHaveLength(1)
  expect(data.pagination).toBeDefined()
})
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows

**Coverage**:
- User authentication
- Customer management
- Vehicle management
- Appointment scheduling
- Job card creation
- Invoice generation
- Role-based access
- Responsive design

**Running E2E Tests**:
```bash
npm run test:e2e
```

**Example**:
```typescript
test('should create a new customer', async ({ page }) => {
  await page.goto('/customers')
  await page.click('[data-testid="add-customer-btn"]')
  await page.fill('input[name="firstName"]', 'John')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=John Doe')).toBeVisible()
})
```

### 4. Performance Tests

**Purpose**: Ensure application meets performance requirements

**Coverage**:
- API response times
- Database query performance
- Memory usage
- Caching effectiveness
- Load testing
- Concurrent request handling

**Running Performance Tests**:
```bash
npm run test:performance
```

**Example**:
```typescript
test('should respond within acceptable time', async () => {
  const startTime = performance.now()
  const response = await customersGET(request)
  const endTime = performance.now()
  
  expect(endTime - startTime).toBeLessThan(1000)
})
```

## Test Data Management

### Fixtures

Test fixtures are located in `tests/fixtures/index.ts` and include:

- **Mock Data**: Predefined test objects for all models
- **API Responses**: Expected response formats
- **Test Utilities**: Helper functions for creating test requests

### Database Setup

**Test Database**: Uses MongoDB test instance
**Isolation**: Each test runs in isolation with clean data
**Teardown**: Automatic cleanup after each test

```typescript
beforeEach(async () => {
  await Customer.deleteMany({})
  await Vehicle.deleteMany({})
  // Clean all collections
})
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Performance tests only
npm run test:performance
```

### Coverage Reports
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Test environment: jsdom for React components
- Coverage thresholds: 70% minimum
- Setup files: `tests/setup.ts`
- Module mapping: `@/` to project root

### Playwright Configuration (`playwright.config.ts`)
- Multiple browsers: Chrome, Firefox, Safari
- Mobile testing: iOS and Android
- Screenshots and videos on failure
- Automatic server startup

## ZATCA Compliance Testing

### Phase 1 Requirements
- ✅ QR code generation
- ✅ Invoice hash calculation
- ✅ Basic validation
- ✅ TLV encoding

### Test Coverage
```typescript
describe('ZATCA Compliance Tests', () => {
  test('should generate valid QR code')
  test('should calculate invoice hash')
  test('should validate invoice data')
  test('should meet Phase 1 requirements')
})
```

## Security Testing

### Authentication Tests
- Login/logout flows
- Session management
- Password validation
- Role-based access

### Authorization Tests
- Admin-only features
- User permissions
- Route protection
- API security

### Input Validation Tests
- XSS prevention
- SQL injection protection
- File upload security
- Rate limiting

## Performance Benchmarks

### API Response Times
- **GET requests**: < 500ms
- **POST requests**: < 1000ms
- **Large datasets**: < 2000ms
- **Concurrent requests**: > 10 req/sec

### Database Performance
- **Indexed queries**: < 100ms
- **Pagination**: < 500ms
- **Search operations**: < 300ms

### Memory Usage
- **Memory leaks**: < 50MB increase
- **Garbage collection**: Automatic cleanup

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### Pre-commit Hooks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
npm test -- models.test.ts

# Run with verbose output
npm test -- --verbose

# Debug mode
npm test -- --detectOpenHandles
```

### E2E Tests
```bash
# Run with browser visible
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Run specific test
npx playwright test --grep "should create customer"
```

### Performance Tests
```bash
# Run with detailed output
npm run test:performance -- --verbose

# Memory profiling
node --inspect-brk node_modules/.bin/jest performance
```

## Test Maintenance

### Adding New Tests
1. Create test file in appropriate directory
2. Import necessary fixtures and utilities
3. Write descriptive test cases
4. Update test scripts if needed

### Updating Existing Tests
1. Identify failing tests
2. Update test data or expectations
3. Ensure tests still validate requirements
4. Update documentation

### Test Data Updates
1. Update fixtures when models change
2. Maintain backward compatibility
3. Document data structure changes

## Best Practices

### Test Writing
- **Descriptive names**: Use clear, descriptive test names
- **Single responsibility**: Each test should test one thing
- **Arrange-Act-Assert**: Structure tests clearly
- **Mock external dependencies**: Use mocks for external services

### Test Organization
- **Group related tests**: Use `describe` blocks
- **Setup and teardown**: Use `beforeEach`/`afterEach`
- **Test isolation**: Each test should be independent
- **Clean data**: Start with fresh data for each test

### Performance Considerations
- **Parallel execution**: Run tests in parallel when possible
- **Efficient mocks**: Use lightweight mocks
- **Resource cleanup**: Clean up resources after tests
- **Timeout handling**: Set appropriate timeouts

## Troubleshooting

### Common Issues

**Tests failing due to async operations**:
```typescript
// Use async/await properly
test('should handle async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})
```

**Database connection issues**:
```typescript
// Ensure proper setup/teardown
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI)
})

afterAll(async () => {
  await mongoose.connection.close()
})
```

**Mock not working**:
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
```

### Getting Help
- Check test output for specific error messages
- Use `--verbose` flag for detailed output
- Check Jest/Playwright documentation
- Review existing test patterns

## Conclusion

This comprehensive testing suite ensures the TeraMotors application is reliable, performant, and secure. Regular test execution helps maintain code quality and catch issues early in the development process.

For questions or issues with testing, refer to the troubleshooting section or consult the team lead.
