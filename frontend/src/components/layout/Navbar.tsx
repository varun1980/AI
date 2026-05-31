'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCart } from '@/store/cartStore';
import { cn } from '@/lib/utils';

const links = [
  { href: '/competitions', label: 'Competitions' },
  { href: '/winners', label: 'Winners' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-500 font-display text-xl text-ink-950">
            P
          </span>
          <span className="font-display text-2xl uppercase tracking-wider">
            Prize<span className="text-primary-400">Arena</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary-400',
                pathname === l.href ? 'text-primary-400' : 'text-gray-300',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="hidden h-10 w-10 place-items-center rounded-lg text-gray-300 hover:bg-white/5 hover:text-white sm:grid"
            aria-label="Account"
          >
            <FiUser size={20} />
          </Link>
          <button
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-lg text-gray-300 hover:bg-white/5 hover:text-white"
            aria-label="Open basket"
          >
            <FiShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary-500 px-1 text-[11px] font-bold text-ink-950">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-lg text-gray-300 hover:bg-white/5 md:hidden"
            aria-label="Menu"
          >
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-ink-950 md:hidden">
          <div className="container-custom flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-gray-200 hover:text-primary-400"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-gray-200 hover:text-primary-400"
            >
              My Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
