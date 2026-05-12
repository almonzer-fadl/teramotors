#!/usr/bin/env node

const accessToken = process.env.POLAR_ACCESS_TOKEN;
const server = process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";
const baseUrl = server === "sandbox" ? "https://sandbox-api.polar.sh/v1" : "https://api.polar.sh/v1";

const products = [
  {
    key: "basic",
    env: "POLAR_PRODUCT_BASIC_ID",
    name: "TeraMotors Basic",
    description: "Core workshop management tools for small and growing repair shops.",
    priceAmount: 4900,
  },
  {
    key: "pro",
    env: "POLAR_PRODUCT_PRO_ID",
    name: "TeraMotors Pro",
    description: "More control for busy teams and higher job volume.",
    priceAmount: 12900,
  },
];

if (!accessToken) {
  console.error("POLAR_ACCESS_TOKEN is required.");
  process.exit(1);
}

async function createProduct(product) {
  const response = await fetch(`${baseUrl}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: product.name,
      description: product.description,
      recurring_interval: "month",
      trial_interval: "day",
      trial_interval_count: 14,
      visibility: "public",
      metadata: {
        app: "teramotors",
        plan: product.key,
      },
      prices: [
        {
          amount_type: "fixed",
          price_amount: product.priceAmount,
          price_currency: "usd",
        },
      ],
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${product.name}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  console.log(`Creating Polar products in ${server}...`);

  for (const product of products) {
    const data = await createProduct(product);
    console.log(`${product.env}=${data.id}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
