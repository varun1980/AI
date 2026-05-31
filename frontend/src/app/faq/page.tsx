import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about entering Prize Arena competitions, draws and prizes.',
};

const faqs: { q: string; a: string }[] = [
  {
    q: 'How do I enter a competition?',
    a: 'Choose a competition, select how many tickets you want, answer the skill-based question correctly and complete checkout. Your ticket numbers are confirmed instantly.',
  },
  {
    q: 'Is this gambling?',
    a: 'No. Prize Arena runs prize competitions under the Gambling Act 2005. Entry requires answering a skill-based question, and a free postal entry route is always available, which is what distinguishes a competition from a lottery.',
  },
  {
    q: 'When are the draws?',
    a: 'Each competition has a countdown timer showing exactly when it closes. Draws take place live once the timer ends or once all tickets sell out, whichever comes first.',
  },
  {
    q: 'How are winners picked?',
    a: 'Winners are selected using a verifiable random draw, streamed live so everyone can see the result. The winning ticket number is matched to the entrant who holds it.',
  },
  {
    q: 'How quickly are prizes paid?',
    a: 'Cash prizes are transferred within 24 hours of the draw. Physical prizes such as cars are arranged for delivery, and most prizes offer a cash alternative if you prefer.',
  },
  {
    q: 'What are instant wins?',
    a: 'Some competitions hide instant cash prizes behind certain ticket numbers. If your number matches one, you find out immediately at checkout — on top of still being entered into the main draw.',
  },
  {
    q: 'Who can enter?',
    a: 'You must be 18 or over and a resident of the United Kingdom to enter. Please always play responsibly and within your means.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Once a competition entry is confirmed it cannot be refunded, as your ticket number is allocated immediately. Please double-check your basket before paying.',
  },
];

export default function FaqPage() {
  return (
    <div className="container-custom max-w-3xl py-12">
      <h1 className="section-title text-center">FAQ</h1>
      <p className="mt-3 text-center text-gray-400">Everything you need to know before you enter.</p>

      <div className="mt-10 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-white">
              {f.q}
              <span className="text-primary-400 transition-transform group-open:rotate-45">＋</span>
            </summary>
            <p className="mt-3 text-gray-400">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
