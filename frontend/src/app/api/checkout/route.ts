import { NextResponse } from 'next/server';
import { getCompetitionById, allocateTickets } from '@/lib/store';
import { getStripe, isStripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

interface CheckoutItem {
  competitionId: string;
  quantity: number;
  /** index of the option the user selected for the skill question */
  answerIndex: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  email?: string;
}

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.items?.length) {
    return NextResponse.json({ error: 'Your basket is empty' }, { status: 400 });
  }

  // Validate, price and check the skill question for every line server-side.
  let amount = 0;
  const validated: { competitionId: string; quantity: number }[] = [];
  for (const item of body.items) {
    const comp = await getCompetitionById(item.competitionId);
    if (!comp) {
      return NextResponse.json({ error: `Unknown competition ${item.competitionId}` }, { status: 400 });
    }
    if (item.answerIndex !== comp.skillQuestion.answerIndex) {
      return NextResponse.json(
        { error: `Incorrect skill answer for "${comp.title}". You must answer correctly to enter.` },
        { status: 422 },
      );
    }
    const remaining = comp.totalTickets - comp.ticketsSold;
    if (item.quantity < 1 || item.quantity > Math.min(comp.maxPerUser, remaining)) {
      return NextResponse.json(
        { error: `Invalid ticket quantity for "${comp.title}".` },
        { status: 422 },
      );
    }
    amount += comp.ticketPrice * item.quantity;
    validated.push({ competitionId: comp.id, quantity: item.quantity });
  }

  // Allocate ticket numbers + resolve instant wins.
  const ticketNumbers: { competitionId: string; numbers: number[] }[] = [];
  const instantWins: { competitionId: string; label: string; value: number }[] = [];
  for (const v of validated) {
    const { numbers, instantWin } = await allocateTickets(v.competitionId, v.quantity);
    ticketNumbers.push({ competitionId: v.competitionId, numbers });
    if (instantWin) {
      instantWins.push({ competitionId: v.competitionId, label: instantWin.label, value: instantWin.value });
    }
  }

  const orderId = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  // Real Stripe path
  const stripe = getStripe();
  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId, email: body.email ?? '' },
    });
    return NextResponse.json({
      orderId,
      status: 'requires_payment',
      amount,
      clientSecret: intent.client_secret,
      ticketNumbers,
      instantWins,
      mock: false,
    });
  }

  // Mock path — instant success
  return NextResponse.json({
    orderId,
    status: 'paid',
    amount,
    ticketNumbers,
    instantWins,
    mock: true,
    stripeConfigured: isStripeEnabled(),
  });
}
