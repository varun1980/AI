import type { Metadata, Viewport } from 'next';
import { Inter, Anton } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const display = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Prize Arena — Win Cars, Cash & Tech from £0.99',
    template: '%s | Prize Arena',
  },
  description:
    'Prize Arena runs live online competitions to win dream cars, tax-free cash and the latest tech. Low odds, instant wins and live draws. Enter from just £0.99.',
  keywords: ['competitions', 'prize draws', 'win a car', 'raffle', 'instant wins', 'cash competitions'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: '#06070a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="bg-ink-950 text-white font-sans antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
