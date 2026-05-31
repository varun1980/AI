import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Stripe webhook receiver. Verifies the signature when STRIPE_WEBHOOK_SECRET
 * is set and acknowledges payment events. In a full deployment this is where
 * you'd mark the order paid and email ticket numbers to the entrant.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ received: true, verified: false });
  }

  const sig = req.headers.get('stripe-signature');
  const payload = await req.text();
  try {
    const event = stripe.webhooks.constructEvent(payload, sig as string, secret);
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as { metadata?: { orderId?: string } };
      console.log('[webhook] order paid:', intent.metadata?.orderId);
    }
    return NextResponse.json({ received: true, verified: true });
  } catch (err) {
    console.error('[webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
