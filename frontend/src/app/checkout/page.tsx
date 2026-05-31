import type { Metadata } from 'next';
import { listCompetitions } from '@/lib/store';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = { title: 'Checkout' };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const competitions = await listCompetitions();
  return (
    <div className="container-custom py-10">
      <CheckoutClient competitions={competitions} />
    </div>
  );
}
