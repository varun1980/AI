import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="container-custom py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="font-display text-2xl uppercase tracking-wider">
              Prize<span className="text-primary-400">Arena</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Live online prize competitions. Win dream cars, tax-free cash and the latest tech from
              as little as 49p.
            </p>
            <div className="mt-4 flex gap-3 text-gray-400">
              <a href="#" aria-label="Instagram" className="hover:text-primary-400"><FiInstagram size={20} /></a>
              <a href="#" aria-label="Facebook" className="hover:text-primary-400"><FiFacebook size={20} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-primary-400"><FiTwitter size={20} /></a>
            </div>
          </div>

          <FooterCol
            title="Competitions"
            items={[
              ['All Competitions', '/competitions'],
              ['Cars', '/competitions?category=cars'],
              ['Cash', '/competitions?category=cash'],
              ['Instant Wins', '/competitions?category=instant'],
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              ['How It Works', '/how-it-works'],
              ['Winners', '/winners'],
              ['FAQ', '/faq'],
              ['My Account', '/account'],
            ]}
          />
          <FooterCol
            title="Legal"
            items={[
              ['Terms & Conditions', '/terms'],
              ['Privacy Policy', '/privacy'],
              ['Acceptable Use', '/terms'],
              ['Responsible Play', '/faq'],
            ]}
          />
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-gray-500">
          <p className="mb-2">
            Prize Arena runs prize competitions in which entry requires the correct answer to a
            skill-based question, in line with the Gambling Act 2005. You must be 18 or over and a UK
            resident to enter. Please play responsibly.
          </p>
          <p>© {new Date().getFullYear()} Prize Arena Ltd. All rights reserved. This is a demonstration site.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{title}</h4>
      <ul className="space-y-2.5">
        {items.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-gray-400 hover:text-primary-400">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
