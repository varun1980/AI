import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'TradePro — Real-Time Trading Platform',
  description: 'Fast, low-latency trading with Coinbase Advanced. Rule-based strategies, scheduled trades, and 5% max loss protection.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #1e2d40',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#111827' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#111827' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
