# TeraMotors - Feature #5: BNPL + Local Payments
**Implementation Plan**
**Date:** December 6, 2025

## Executive Summary

**Goal:** Integrate Buy Now, Pay Later (BNPL) and local payment methods to increase repair order values by 3x.

**Business Impact:**
- **3x higher repair order values** ($1,800 vs $600 average with BNPL)
- 40% increase in estimate approval rates
- Faster payment collection
- Competitive advantage (only 15% of competitors have BNPL)
- No financial risk to shop (paid upfront)

**Timeline:** 4-5 weeks
**Complexity:** Medium
**Dependencies:** Feature #2 (Customer Portal) recommended

---

## BNPL Market Reality

**Tekmetric Data (Fall 2024):**
- 5% of transactions use BNPL (growing rapidly)
- Average repair with BNPL: **$1,800**
- Average repair without BNPL: **$600**
- **3x increase!**

**Why BNPL Works:**
- Customers approve expensive repairs they'd normally decline
- No credit check required (soft check only)
- 0% APR for 3-6 months
- Shop gets paid upfront (no risk)
- Customer pays in installments

---

## Payment Providers

### For GCC (Saudi Arabia, UAE, Kuwait, Qatar):

**1. Tabby** (Recommended)
- Leading BNPL in Middle East
- $200 - $10,000 SAR
- 0% APR for 3-4 installments
- Shop receives full amount upfront
- Tabby handles collections
- **Pricing:** 2-4% transaction fee

**2. Tamara**
- Alternative to Tabby
- Similar terms
- Strong in Saudi Arabia

### For Global Markets:

**3. Affirm** (USA)
- Leading BNPL in USA
- $50 - $17,500
- 0-30% APR
- Tekmetric partnership (May 2025)

**4. Klarna** (Europe/Global)
- Global leader
- Pay in 4 or Pay in 30 days
- 0% interest options

**5. Stripe** (Credit Cards)
- Traditional card processing
- Apple Pay, Google Pay
- International coverage

---

## Architecture Design

### Multi-Provider Support

```typescript
interface PaymentProvider {
  type: 'stripe' | 'tabby' | 'tamara' | 'affirm' | 'klarna';
  createCheckout(invoice: Invoice): Promise<CheckoutSession>;
  handleWebhook(event: any): Promise<PaymentResult>;
}
```

**Benefits:**
- Customer chooses payment method
- Shop offers multiple options
- Fallback if primary fails

---

## Files to Create (22 files)

### Payment Services
- `/lib/payments/TabbyService.ts` - Tabby BNPL integration
- `/lib/payments/TamaraService.ts` - Tamara BNPL integration
- `/lib/payments/AffirmService.ts` - Affirm BNPL integration
- `/lib/payments/KlarnaService.ts` - Klarna integration
- `/lib/payments/StripeService.ts` - Enhanced Stripe (cards)
- `/lib/payments/PaymentGateway.ts` - Unified payment interface

### API Routes
- `/app/api/payments/checkout/route.ts` - Create checkout session
- `/app/api/payments/webhooks/tabby/route.ts` - Tabby webhooks
- `/app/api/payments/webhooks/tamara/route.ts` - Tamara webhooks
- `/app/api/payments/webhooks/affirm/route.ts` - Affirm webhooks
- `/app/api/payments/webhooks/klarna/route.ts` - Klarna webhooks
- `/app/api/payments/webhooks/stripe/route.ts` - Stripe webhooks
- `/app/api/payments/status/[orderId]/route.ts` - Check payment status

### Portal Pages
- `/app/(portal)/portal/[slug]/pay/[invoiceId]/page.tsx` - Payment page
- `/app/(portal)/portal/[slug]/pay/[invoiceId]/success/page.tsx` - Success page
- `/app/(portal)/portal/[slug]/pay/[invoiceId]/failed/page.tsx` - Failed page

### Components
- `/components/payments/PaymentMethodSelector.tsx` - Choose payment method
- `/components/payments/BNPLWidget.tsx` - BNPL option display
- `/components/payments/StripeCheckout.tsx` - Stripe Elements form
- `/components/payments/PaymentStatus.tsx` - Payment status tracker

### Settings
- `/app/(dashboard)/settings/payments/page.tsx` - Payment settings UI

### Database
- `/lib/models/PaymentTransaction.ts` - Transaction log

---

## Tabby Integration (GCC)

### Setup

**1. Create Tabby Account:**
- Sign up at https://tabby.ai
- Get API keys (public + secret)
- Configure webhook URL

**2. Environment Variables:**
```env
TABBY_PUBLIC_KEY=pk_...
TABBY_SECRET_KEY=sk_...
TABBY_MERCHANT_CODE=...
TABBY_WEBHOOK_SECRET=...
```

### Tabby Service

**File:** `/lib/payments/TabbyService.ts`

```typescript
import axios from 'axios';

export class TabbyService {
  private apiUrl = 'https://api.tabby.ai/api/v2';
  private publicKey: string;
  private secretKey: string;

  constructor() {
    this.publicKey = process.env.TABBY_PUBLIC_KEY;
    this.secretKey = process.env.TABBY_SECRET_KEY;
  }

  async createCheckoutSession(invoice: Invoice, customer: Customer) {
    const response = await axios.post(
      `${this.apiUrl}/checkout`,
      {
        payment: {
          amount: invoice.totalAmount.toFixed(2),
          currency: 'SAR',
          description: `Invoice #${invoice.invoiceNumber}`,
          buyer: {
            phone: customer.phone,
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
          },
          order: {
            reference_id: invoice._id.toString(),
            items: await this.getOrderItems(invoice),
          },
          buyer_history: {
            registered_since: customer.createdAt.toISOString(),
            loyalty_level: 0,
          },
        },
        lang: customer.language === 'ar' ? 'ar' : 'en',
        merchant_code: process.env.TABBY_MERCHANT_CODE,
        merchant_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${tenant.slug}/pay/${invoice._id}/success`,
          cancel: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${tenant.slug}/pay/${invoice._id}/failed`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${tenant.slug}/pay/${invoice._id}/failed`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      checkoutUrl: response.data.configuration.available_products.installments[0].web_url,
      sessionId: response.data.id,
    };
  }

  async capturePayment(paymentId: string) {
    const response = await axios.post(
      `${this.apiUrl}/payments/${paymentId}/captures`,
      {
        amount: payment.amount,
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      }
    );

    return response.data;
  }

  private async getOrderItems(invoice: Invoice) {
    const jobCard = await JobCard.findById(invoice.jobCardId);

    const items = [];

    // Services
    for (const service of jobCard.services) {
      const serviceData = await Service.findById(service.serviceId);
      items.push({
        title: serviceData.name,
        quantity: service.quantity,
        unit_price: (service.laborRate * service.laborHours).toFixed(2),
        category: 'Auto Repair',
      });
    }

    // Parts
    for (const part of jobCard.partsUsed) {
      const partData = await Part.findById(part.partId);
      items.push({
        title: partData.name,
        quantity: part.quantity,
        unit_price: part.cost.toFixed(2),
        category: 'Auto Parts',
      });
    }

    return items;
  }
}
```

### Webhook Handler

**File:** `/app/api/payments/webhooks/tabby/route.ts`

```typescript
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-tabby-signature');

  // Verify webhook signature
  const isValid = verifyTabbySignature(body, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const event = JSON.parse(body);

  switch (event.type) {
    case 'payment.authorized':
      await handlePaymentAuthorized(event.data);
      break;

    case 'payment.captured':
      await handlePaymentCaptured(event.data);
      break;

    case 'payment.failed':
      await handlePaymentFailed(event.data);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentCaptured(paymentData: any) {
  const invoiceId = paymentData.order.reference_id;
  const invoice = await Invoice.findById(invoiceId);

  invoice.status = 'paid';
  invoice.paidAmount = parseFloat(paymentData.amount);
  invoice.paymentMethod = 'tabby';
  invoice.paymentDate = new Date();
  invoice.portalPayment.paidOnline = true;
  invoice.portalPayment.paymentProvider = 'tabby';
  invoice.portalPayment.transactionId = paymentData.id;
  await invoice.save();

  // Create payment record
  await Payment.create({
    tenantId: invoice.tenantId,
    invoiceId: invoice._id,
    customerId: invoice.customerId,
    amount: invoice.totalAmount,
    paymentMethod: 'tabby',
    status: 'completed',
    reference: paymentData.id,
  });

  // Send receipt
  await sendPaymentReceipt(invoice);

  // Notify customer
  await notifyCustomer({
    customer,
    type: 'payment',
    title: 'Payment Received',
    message: `Your payment of ${invoice.totalAmount} SAR has been received. Thank you!`,
  });
}
```

---

## Payment Page UI

**File:** `/app/(portal)/portal/[slug]/pay/[invoiceId]/page.tsx`

```tsx
export default function PaymentPage({ params }: { params: { slug: string; invoiceId: string } }) {
  const [invoice, setInvoice] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState<'tabby' | 'stripe' | 'tamara'>(null);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pay Invoice</h1>

      {/* Invoice Summary */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Invoice #{invoice.invoiceNumber}</h2>
          <StatusBadge status={invoice.status} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{invoice.zatca.subtotal} SAR</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (15%)</span>
            <span>{invoice.zatca.vatAmount} SAR</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{invoice.totalAmount} SAR</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="font-semibold mb-4">Choose Payment Method</h3>

        <div className="space-y-3">
          {/* Tabby BNPL */}
          <button
            onClick={() => setSelectedMethod('tabby')}
            className={`w-full p-4 border-2 rounded-lg text-left ${
              selectedMethod === 'tabby' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logos/tabby.svg" alt="Tabby" className="h-8" />
                <div>
                  <p className="font-semibold">Pay in 4 installments</p>
                  <p className="text-sm text-gray-600">
                    0% interest • {(invoice.totalAmount / 4).toFixed(2)} SAR x 4
                  </p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Recommended
              </span>
            </div>
          </button>

          {/* Tamara BNPL */}
          <button
            onClick={() => setSelectedMethod('tamara')}
            className={`w-full p-4 border-2 rounded-lg text-left ${
              selectedMethod === 'tamara' ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <img src="/logos/tamara.svg" alt="Tamara" className="h-8" />
              <div>
                <p className="font-semibold">Split in 3 payments</p>
                <p className="text-sm text-gray-600">
                  0% interest • {(invoice.totalAmount / 3).toFixed(2)} SAR x 3
                </p>
              </div>
            </div>
          </button>

          {/* Credit Card */}
          <button
            onClick={() => setSelectedMethod('stripe')}
            className={`w-full p-4 border-2 rounded-lg text-left ${
              selectedMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-gray-600" />
              <div>
                <p className="font-semibold">Credit/Debit Card</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, Amex, Mada</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      {selectedMethod && (
        <div className="bg-white rounded-lg border p-6">
          {selectedMethod === 'stripe' ? (
            <StripeCheckout invoice={invoice} onSuccess={handlePaymentSuccess} />
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                You'll be redirected to {selectedMethod === 'tabby' ? 'Tabby' : 'Tamara'} to complete your payment.
              </p>
              <button
                onClick={() => handleBNPLCheckout(selectedMethod)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold"
              >
                Continue to {selectedMethod === 'tabby' ? 'Tabby' : 'Tamara'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## BNPL Widget (Checkout Page)

**Component:** `/components/payments/BNPLWidget.tsx`

```tsx
export function BNPLWidget({ amount }: { amount: number }) {
  return (
    <div className="bnpl-widget bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <img src="/logos/tabby.svg" alt="Tabby" className="h-6" />
        <p className="font-semibold text-sm">or pay in 4 interest-free installments</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white rounded p-2 text-center">
          <p className="text-sm font-semibold">{(amount / 4).toFixed(2)} SAR</p>
          <p className="text-xs text-gray-600">Today</p>
        </div>
        <div className="flex-1 bg-white rounded p-2 text-center">
          <p className="text-sm font-semibold">{(amount / 4).toFixed(2)} SAR</p>
          <p className="text-xs text-gray-600">Week 2</p>
        </div>
        <div className="flex-1 bg-white rounded p-2 text-center">
          <p className="text-sm font-semibold">{(amount / 4).toFixed(2)} SAR</p>
          <p className="text-xs text-gray-600">Week 4</p>
        </div>
        <div className="flex-1 bg-white rounded p-2 text-center">
          <p className="text-sm font-semibold">{(amount / 4).toFixed(2)} SAR</p>
          <p className="text-xs text-gray-600">Week 6</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-2">
        0% interest • No hidden fees • Instant approval
      </p>
    </div>
  );
}
```

---

## Timeline (4-5 weeks)

### Week 1-2: Tabby Integration (GCC)
- Tabby account setup
- TabbyService implementation
- Webhook handling
- Payment page UI

### Week 3: Stripe Enhancement
- Stripe Elements integration
- Apple Pay / Google Pay
- Card tokenization
- 3D Secure support

### Week 4: Additional Providers
- Tamara integration (alternative BNPL for GCC)
- Affirm integration (for USA market)
- Multi-provider selector UI

### Week 5: Testing & Launch
- End-to-end payment flows
- Webhook testing
- Refund handling
- Pilot launch

---

## Success Metrics

### Month 1:
- 10+ BNPL transactions
- $15,000+ processed via BNPL
- 0 payment failures
- 40% increase in average repair order

### Month 3:
- 5% of payments via BNPL (industry average)
- 3x higher repair orders with BNPL
- 50%+ of high-value repairs ($1,000+) use BNPL
- Customer love the flexibility

---

**End of Feature #5 Plan**

Next: **Feature #6: Parts Catalog Integration** for faster parts ordering!
