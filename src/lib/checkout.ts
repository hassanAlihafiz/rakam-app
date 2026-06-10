// NOTE: Regenerate the OpenAPI client once POST /api/checkout is in the spec.

import { getToken } from '@/src/lib/auth';

export type BillingCycle = 'monthly' | 'annual';

export type CheckoutResponse = {
  checkout_url: string;
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const CHECKOUT_URL = `${API_BASE}/api/checkout`;

export async function createCheckout(
  planId: string,
  billing: BillingCycle,
): Promise<CheckoutResponse> {
  const token = await getToken('ACCESS_TOKEN');
  if (!token) {
    throw new Error('Checkout failed');
  }

  const response = await fetch(CHECKOUT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      billing,
    }),
  });

  if (!response.ok) {
    throw new Error('Checkout failed');
  }

  return response.json() as Promise<CheckoutResponse>;
}
