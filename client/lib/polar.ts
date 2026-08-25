import type { SubscriptionTier } from "@/lib/subscription/tiers";

const POLAR_API_BASE =
  process.env.POLAR_SERVER === "sandbox"
    ? "https://sandbox-api.polar.sh/v1"
    : "https://api.polar.sh/v1";

export const POLAR_CHECKOUT_TIERS = ["basic", "pro", "enterprise"] as const;

export type PolarCheckoutTier = Extract<
  SubscriptionTier,
  (typeof POLAR_CHECKOUT_TIERS)[number]
>;

const PRODUCT_ID_ENV: Record<PolarCheckoutTier, string> = {
  basic: "POLAR_PRODUCT_BASIC_ID",
  pro: "POLAR_PRODUCT_PRO_ID",
  enterprise: "POLAR_PRODUCT_ENTERPRISE_ID",
};

export function isPolarCheckoutTier(value: string | null): value is PolarCheckoutTier {
  return POLAR_CHECKOUT_TIERS.includes(value as PolarCheckoutTier);
}

export function getPolarProductId(tier: PolarCheckoutTier) {
  const envName = PRODUCT_ID_ENV[tier];
  return process.env[envName];
}

export async function createPolarCheckoutSession(params: {
  tier: PolarCheckoutTier;
  productId: string;
  origin: string;
  customerEmail?: string;
  customerName?: string;
  externalCustomerId?: string;
  metadata?: Record<string, string>;
}) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }

  const successUrl = new URL("/settings/subscription", params.origin);
  successUrl.searchParams.set("checkout", "success");
  successUrl.searchParams.set("plan", params.tier);
  successUrl.searchParams.set("checkout_id", "{CHECKOUT_ID}");

  const returnUrl = new URL("/settings/subscription", params.origin);
  returnUrl.searchParams.set("checkout", "cancelled");
  returnUrl.searchParams.set("plan", params.tier);

  const metadata = Object.fromEntries(
    Object.entries({
      app: "teramotors",
      plan: params.tier,
      ...params.metadata,
    }).filter(([, value]) => value !== "")
  );

  const response = await fetch(`${POLAR_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: params.productId,
      allow_trial: true,
      trial_interval: "day",
      trial_interval_count: 14,
      success_url: successUrl.toString(),
      return_url: returnUrl.toString(),
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      external_customer_id: params.externalCustomerId,
      metadata,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail || data?.error || "Unable to create Polar checkout";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (!data?.url) {
    throw new Error("Polar checkout response did not include a redirect URL");
  }

  return data as { id: string; url: string };
}
