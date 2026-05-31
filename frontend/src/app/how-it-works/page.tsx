import Link from 'next/link';
import type { Metadata } from 'next';
import { FiShoppingCart, FiHelpCircle, FiVideo, FiAward, FiMail, FiShield } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'How Prize Arena competitions work — pick tickets, answer a skill question and watch the live draw.',
};

const steps = [
  { icon: FiShoppingCart, title: 'Choose a competition', text: 'Browse live draws for cars, cash, tech and more. Pick how many tickets you want — the fewer total tickets, the better your odds.' },
  { icon: FiHelpCircle, title: 'Answer the skill question', text: 'Every entry requires the correct answer to a simple skill-based question. This is what makes Prize Arena a legal prize competition rather than a lottery.' },
  { icon: FiMail, title: 'Get your ticket numbers', text: 'As soon as your entry is confirmed you receive your unique ticket numbers by email and in your account.' },
  { icon: FiVideo, title: 'Watch the live draw', text: 'When the timer hits zero we draw the winning number live using a verifiable random method, streamed for everyone to see.' },
  { icon: FiAward, title: 'Get paid', text: 'Cash prizes land in your bank account within 24 hours. Cars and physical prizes are delivered to your door, or take the cash alternative.' },
];

export default function HowItWorksPage() {
  return (
    <div className="container-custom py-12">
      <div className="text-center">
        <h1 className="section-title">How It Works</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-400">
          Prize Arena is a prize competition platform. Winning comes down to entering, answering a
          skill question and a fair, live draw — no gambling, no catch.
        </p>
      </div>

      <ol className="mx-auto mt-12 max-w-3xl space-y-5">
        {steps.map((s, i) => (
          <li key={s.title} className="card flex gap-5 p-6">
            <div className="flex flex-col items-center">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-500/15 text-2xl text-primary-400">
                <s.icon />
              </span>
              {i < steps.length - 1 && <span className="mt-2 w-px flex-1 bg-white/10" />}
            </div>
            <div>
              <h3 className="font-display text-xl uppercase">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-2 text-gray-400">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-10 max-w-3xl card p-6">
        <div className="flex items-start gap-3">
          <FiShield className="mt-1 flex-shrink-0 text-success-400" size={22} />
          <div>
            <h3 className="font-display text-lg uppercase">Free postal entry</h3>
            <p className="mt-1 text-sm text-gray-400">
              No purchase is necessary. You can enter any competition for free by sending your details
              and answer to the skill question by post. Free entries have the same chance of winning as
              paid entries. Full details are in our Terms &amp; Conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/competitions" className="btn-primary">See live competitions</Link>
      </div>
    </div>
  );
}
