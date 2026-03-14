import Link from "next/link";
import {
  FiInstagram,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const quickLinks = [
  { href: "/book", label: "Book a Session" },
  { href: "/packages", label: "Packages" },
  { href: "/events", label: "Events & Camps" },
  { href: "/media", label: "Media" },
  { href: "/about", label: "About Gus" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="container-sc py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white font-bold text-lg">
                SC
              </span>
              <span className="text-lg font-bold tracking-wide">
                SANCHES <span className="text-gold-400">COACHING</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Premium football coaching for players of all ages and levels.
              Elevate your game with Gus Sanches.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-500 hover:text-gold-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <FiMail className="text-gold-500 shrink-0" />
                gus@sanchescoaching.co.uk
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-gold-500 shrink-0" />
                +44 7XXX XXXXXX
              </li>
              <li className="flex items-center gap-2">
                <FiMapPin className="text-gold-500 shrink-0" />
                London, United Kingdom
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Follow Us
            </h3>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/sanchescoaching"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-gold-500 hover:text-white transition-colors"
              >
                <FiInstagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-gold-500 hover:text-white transition-colors"
              >
                <FiTwitter size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} Sanches Coaching. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
