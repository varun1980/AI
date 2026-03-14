"use client";

import Link from "next/link";
import { useState } from "react";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";

const links = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" },
  { href: "/packages", label: "Packages" },
  { href: "/events", label: "Events" },
  { href: "/media", label: "Media" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800/60">
      <div className="container-sc flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white font-bold text-lg">
            SC
          </span>
          <span className="text-lg font-bold tracking-wide hidden sm:inline">
            SANCHES{" "}
            <span className="text-gold-400">COACHING</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-zinc-800/50"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="ml-3 btn-gold text-xs py-2 px-5">
            Sign In
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {open ? <HiOutlineX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t border-zinc-800 bg-[#050505]">
          <div className="container-sc py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-sm text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-zinc-800/50"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 btn-gold text-center"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
