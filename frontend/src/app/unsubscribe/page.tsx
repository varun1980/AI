'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (email) handleUnsubscribe();
  }, [email]);

  const handleUnsubscribe = async () => {
    setStatus('loading');
    try {
      await fetch(`${API_BASE}/api/v1/passive-income/unsubscribe?email=${encodeURIComponent(email)}`);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-8">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-6">
          {status === 'done' ? '✓' : status === 'error' ? '✗' : '⏳'}
        </div>
        <h1 className="text-2xl font-bold mb-3">
          {status === 'loading' && 'Unsubscribing...'}
          {status === 'done' && 'Unsubscribed'}
          {status === 'error' && 'Something went wrong'}
          {status === 'idle' && 'Processing...'}
        </h1>
        <p className="text-gray-400 mb-6">
          {status === 'done' && (
            <>
              <strong>{email}</strong> has been removed from our email list.
              You won't receive any more emails from us.
            </>
          )}
          {status === 'error' && 'Please try again or email us at gus@sanchescoaching.co.uk'}
        </p>
        <a href="/" className="text-[#b8832b] hover:underline text-sm">
          ← Return to Sanches Coaching
        </a>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  );
}
