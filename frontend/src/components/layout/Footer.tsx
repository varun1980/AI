import Link from 'next/link';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone } from 'react-icons/fi';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-display text-xl">SC</span>
              </div>
              <span className="font-display text-xl uppercase">
                Sanches Coaching
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Premium football coaching for players of all levels
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display uppercase text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About', 'Book', 'Packages', 'Events', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-primary-500 text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display uppercase text-sm mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <FiMail className="mr-2 text-primary-500" />
                gus@sanchescoaching.co.uk
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2 text-primary-500" />
                +44 7XXX XXXXXX
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display uppercase text-sm mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {[
                { icon: FiInstagram, href: 'https://instagram.com/sanchescoaching' },
                { icon: FiTwitter, href: '#' },
                { icon: FiFacebook, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {currentYear} Sanches Coaching. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary-500 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
