/**
 * Stripe helper. When STRIPE_SECRET_KEY is present we create real
 * PaymentIntents; otherwise the checkout route falls back to a mock that
 * "pays" instantly so the flow is demoable without keys.
 */
import Stripe from 'stripe';

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return client;
}

export const isStripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;
