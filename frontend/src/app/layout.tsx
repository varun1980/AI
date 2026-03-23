import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Sanches Coaching - Premium Football Training',
  description: 'Book premium football coaching sessions with Gus Sanches',
  keywords: ['football', 'coaching', 'training', 'Gus Sanches', 'premium'],
  authors: [{ name: 'Gus Sanches' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark-950 text-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
