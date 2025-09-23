# ZATCA Implementation Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install qrcode @types/qrcode @types/node typescript ts-node
```

### Step 2: Update Company Configuration
Edit `src/config/company-config.ts`:
```typescript
export const COMPANY_CONFIG: CompanyConfig = {
  name: "YOUR ACTUAL COMPANY NAME",
  vatNumber: "YOUR_15_DIGIT_VAT_NUMBER", // Must start and end with 3
  address: {
    street: "Your Street Address",
    city: "Your City",
    postalCode: "12345",
    country: "SA"
  },
  businessType: "Your Business Type",
  environment: 'production' // Change to 'sandbox' for testing
};
```

### Step 3: Create Your First Invoice
```typescript
import { InvoiceService } from './invoices/invoice-service';

const invoiceService = new InvoiceService();

// Create a simple sale
const result = await invoiceService.createInvoice({
  items: [
    {
      name: 'Product Name',
      quantity: 1,
      unitPrice: 100.00,
      vatRate: 15
    }
  ],
  paymentMethod: 'cash'
});

// Get the QR code
console.log('QR Code:', result.qrCode);
```

## 🔧 How Each Component Works

### 1. **Company Configuration (`company-config.ts`)**
- Stores your business information
- Validates VAT number format
- Used by all other components

### 2. **ZATCA Types (`zatca-types.ts`)**
- Defines all TypeScript interfaces
- Ensures type safety throughout your application
- Matches ZATCA requirements exactly

### 3. **ZATCA Utils (`zatca-utils.ts`)**
- Helper functions for calculations
- VAT calculations, date formatting
- Currency formatting, validation

### 4. **ZATCA Validator (`zatca-validator.ts`)**
- Validates invoice data before processing
- Checks ZATCA compliance rules
- Returns detailed error messages

### 5. **ZATCA QR Generator (`zatca-qr-generator.ts`)**
- Core QR code generation logic
- Creates TLV (Tag-Length-Value) encoded data
- Handles Phase 1 compliance

### 6. **Invoice Service (`invoice-service.ts`)**
- Main service class for your application
- Handles invoice creation, storage, retrieval
- Integrates with ZATCA QR generator

## 🔄 Data Flow

```
Your App → Invoice Service → ZATCA QR Generator → QR Code
    ↓            ↓                   ↓
  Storage    Validation         TLV Encoding
```

### Detailed Flow:
1. **Input**: Your app provides invoice data
2. **Validation**: System validates data against ZATCA rules
3. **Calculation**: Totals, VAT amounts calculated
4. **QR Generation**: TLV-encoded QR code created
5. **Storage**: Invoice saved with QR code
6. **Output**: QR code returned to your app

## 📱 QR Code Structure

The QR code contains:
- **Tag 1**: Company Name (UTF-8)
- **Tag 2**: VAT Number (15 digits)
- **Tag 3**: Date/Time (ISO 8601)
- **Tag 4**: Total Amount (including VAT)
- **Tag 5**: VAT Amount

Format: `Base64(TLV-encoded-data)`

## 🔌 Integration Points

### Option 1: Direct Integration (Simplest)
```typescript
import { InvoiceService } from './invoices/invoice-service';

const invoiceService = new InvoiceService();

// In your existing invoice creation code:
const zatcaResult = await invoiceService.createInvoice({
  items: yourExistingItems,
  customer: yourExistingCustomer,
  // ... other data
});

// Use the QR code in your receipt/invoice
const qrCode = zatcaResult.qrCode;
```

### Option 2: API Integration
```typescript
// Add to your Express.js routes
app.post('/invoices', async (req, res) => {
  const result = await invoiceService.createInvoice(req.body);
  res.json({ 
    invoice: result.invoice,
    qrCode: result.qrCode 
  });
});
```

### Option 3: Event-Based Integration
```typescript
// Listen for invoice creation events
eventEmitter.on('invoice:created', async (invoiceData) => {
  const result = await invoiceService.createInvoice(invoiceData);
  
  // Emit QR code generated event
  eventEmitter.emit('qr:generated', {
    invoiceNumber: invoiceData.invoiceNumber,
    qrCode: result.qrCode
  });
});
```

## 📊 Storage Options

### Default: LocalStorage (for web apps)
```typescript
// Automatically handled by InvoiceService
// Data stored in browser's localStorage
```

### Database Integration
```typescript
// Replace the storage methods in InvoiceService
private async saveInvoice(invoice: ZATCAInvoice): Promise<void> {
  // Your database logic here
  await db.invoices.create(invoice);
}
```

### File System (Node.js)
```typescript
import fs from 'fs/promises';

private async saveInvoice(invoice: ZATCAInvoice): Promise<void> {
  const filename = `invoices/${invoice.invoiceData.invoiceNumber}.json`;
  await fs.writeFile(filename, JSON.stringify(invoice, null, 2));
}
```

## 🧪 Testing Your Implementation

### 1. Validate QR Codes
```typescript
import { ZATCAQRGenerator } from './zatca/zatca-qr-generator';

const qrGenerator = new ZATCAQRGenerator();
const validation = qrGenerator.validateQRCode(yourQRCode);

if (validation.isValid) {
  console.log('✅ QR Code is valid');
  console.log('Data:', validation.data);
} else {
  console.log('❌ QR Code errors:', validation.errors);
}
```

### 2. Test with ZATCA Tools
- Use ZATCA's online QR code reader
- Verify with ZATCA mobile app
- Test invoice XML structure (for Phase 2)

### 3. Validation Checklist
- [ ] Company VAT number is correct format (15 digits, starts/ends with 3)
- [ ] Invoice totals calculate correctly
- [ ] VAT amounts are accurate
- [ ] QR code contains all required fields
- [ ] Dates are in correct format
- [ ] Currency is SAR

## 🚨 Common Issues & Solutions

### Issue 1: Invalid VAT Number
```
Error: Invalid Saudi VAT number format
```
**Solution**: VAT number must be exactly 15 digits, starting and ending with 3
- ✅ Correct: `300000000000003`
- ❌ Wrong: `123456789012345`

### Issue 2: QR Code Too Large
```
Error: QR code data exceeds size limit
```
**Solution**: Shorten company name or product names

### Issue 3: Date Format Errors
```
Error: Invalid timestamp format for QR code
```
**Solution**: Use `ZATCAUtils.formatDateForZATCA(new Date())`

### Issue 4: VAT Calculation Mismatch
```
Warning: VAT amount doesn't match calculated value
```
**Solution**: Use `ZATCAUtils.calculateVAT(amount, rate)` for consistency

## 📈 Production Deployment

### 1. Environment Variables
```bash
# Set production values
COMPANY_NAME="Your Real Company Name"
COMPANY_VAT_NUMBER="300000000000003"
ZATCA_ENVIRONMENT="production"
```

### 2. Error Handling
```typescript
try {
  const result = await invoiceService.createInvoice(data);
  if (!result.success) {
    // Log errors, notify admin
    console.error('Invoice creation failed:', result.errors);
    // Send to error tracking service
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

### 3. Monitoring
```typescript
// Track QR code generation metrics
const metrics = {
  totalInvoices: 0,
  successfulQRGeneration: 0,
  failedQRGeneration: 0,
  averageProcessingTime: 0
};
```

### 4. Backup Strategy
```typescript
// Regular backups of invoice data
setInterval(async () => {
  await backupInvoices();
}, 24 * 60 * 60 * 1000); // Daily backup
```

## 🎯 Next Steps

1. **Immediate**: 
   - Update `company-config.ts` with your details
   - Test with sample invoice data
   - Validate QR codes with ZATCA tools

2. **Short term**:
   - Integrate with your existing invoice system
   - Replace localStorage with proper database
   - Add error handling and logging

3. **Long term**:
   - Consider Phase 2 implementation for B2B
   - Add automated testing
   - Monitor compliance and performance

## 📞 Support

- ZATCA Official Documentation: https://zatca.gov.sa
- QR Code Testing: Use ZATCA mobile app
- Technical Issues: Check validation errors in console