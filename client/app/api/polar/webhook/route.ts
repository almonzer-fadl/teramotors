import { NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { connectToDatabase } from "@/lib/db";
import Tenant from "@/lib/models/Tenant";

type PolarWebhookEvent = ReturnType<typeof validateEvent>;

function productIdToPlan(productId?: string | null) {
  if (!productId) return null;
  if (productId === process.env.POLAR_PRODUCT_BASIC_ID) return "basic";
  if (productId === process.env.POLAR_PRODUCT_PRO_ID) return "professional";
  if (productId === process.env.POLAR_PRODUCT_ENTERPRISE_ID) return "enterprise";
  return null;
}

function getTenantId(data: any) {
  return data?.customer?.externalId || data?.metadata?.tenant_id || null;
}

function getSubscriptionStatus(type: string, status?: string) {
  if (type === "subscription.canceled" || type === "subscription.revoked") return "cancelled";
  if (type === "subscription.past_due") return "suspended";
  if (status === "trialing") return "trial";
  return "active";
}

async function handleSubscriptionEvent(event: PolarWebhookEvent) {
  if (!event.type.startsWith("subscription.")) return;

  const data = event.data as any;
  const tenantId = getTenantId(data);
  if (!tenantId) return;

  const plan = productIdToPlan(data.productId);
  const endDate = data.currentPeriodEnd || data.trialEnd || data.endsAt || undefined;

  await connectToDatabase();
  await Tenant.findByIdAndUpdate(tenantId, {
    status: getSubscriptionStatus(event.type, data.status),
    ...(plan && { "subscription.plan": plan }),
    "subscription.endDate": endDate,
    "subscription.polarCustomerId": data.customerId,
    "subscription.polarSubscriptionId": data.id,
    "subscription.polarProductId": data.productId,
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { success: false, error: "POLAR_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  try {
    const event = validateEvent(Buffer.from(rawBody), headers, secret);
    await handleSubscriptionEvent(event);

    return new NextResponse(null, { status: 202 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return new NextResponse(null, { status: 403 });
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
