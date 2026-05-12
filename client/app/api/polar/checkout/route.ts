import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import {
  createPolarCheckoutSession,
  getPolarProductId,
  isPolarCheckoutTier,
} from "@/lib/polar";

export async function GET(request: NextRequest) {
  const tier = request.nextUrl.searchParams.get("plan");

  if (!isPolarCheckoutTier(tier)) {
    return NextResponse.json(
      { success: false, error: "Choose a paid plan: basic, pro, or enterprise." },
      { status: 400 }
    );
  }

  const productId = getPolarProductId(tier);
  if (!productId) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing Polar product ID for ${tier}. Configure POLAR_PRODUCT_${tier.toUpperCase()}_ID.`,
      },
      { status: 500 }
    );
  }

  try {
    const session = await getServerSession();
    const checkout = await createPolarCheckoutSession({
      tier,
      productId,
      origin: request.nextUrl.origin,
      customerEmail: session?.user.email,
      customerName: session?.user.name,
      externalCustomerId: session?.user.tenantId || session?.user.id,
      metadata: {
        user_id: session?.user.id || "",
        tenant_id: session?.user.tenantId || "",
      },
    });

    return NextResponse.redirect(checkout.url);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to start checkout.",
      },
      { status: 500 }
    );
  }
}
