import { Navbar } from '@/components/layout/Navbar';
import { LeadGenTool } from '@/components/leads/LeadGenTool';

export const metadata = {
  title: 'Lead Gen Tool | Sanches Coaching',
  description: 'Google Maps + Claude outreach workflow for local businesses',
};

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-24 pb-16">
        <LeadGenTool />
      </main>
    </div>
  );
}
