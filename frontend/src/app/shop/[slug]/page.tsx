'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const typeLabel: Record<string, string> = {
  EBOOK: 'eBook',
  VIDEO_COURSE: 'Video Course',
  TRAINING_PLAN: 'Training Plan',
  MEAL_PLAN: 'Nutrition Guide',
  BUNDLE: 'Bundle',
};

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!params.slug) return;
    fetch(`${API_BASE}/api/v1/passive-income/shop/${params.slug}`)
      .then(r => r.json())
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setCheckoutLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/passive-income/shop/${product.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          successUrl: `${window.location.origin}/shop/success`,
          cancelUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#b8832b] animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Product not found</p>
          <a href="/shop" className="text-[#b8832b] hover:underline">← Back to shop</a>
        </div>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.priceGBP) / product.compareAtPrice) * 100)
    : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Breadcrumb */}
      <div className="bg-[#111] border-b border-[#222] py-3 px-8">
        <div className="max-w-5xl mx-auto text-sm text-gray-400">
          <a href="/shop" className="hover:text-white">Shop</a>
          <span className="mx-2">/</span>
          <span className="text-white">{product.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Product Info */}
          <div>
            {/* Thumbnail */}
            <div className="aspect-video bg-[#111] border border-[#222] rounded-xl flex items-center justify-center mb-6">
              {product.thumbnailUrl ? (
                <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-7xl">📦</span>
              )}
            </div>

            {/* Type Badge */}
            <span className="bg-[#b8832b]/20 text-[#b8832b] text-xs px-3 py-1 rounded-full font-medium">
              {typeLabel[product.type] || product.type}
            </span>

            <h1 className="text-3xl font-bold mt-3 mb-4">{product.name}</h1>
            <p className="text-gray-300 leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">What's included:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-[#b8832b] font-bold mt-0.5">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            {product.purchaseCount > 0 && (
              <div className="mt-6 flex gap-6 text-sm text-gray-400">
                <span>⭐ Trusted by {product.purchaseCount}+ players</span>
              </div>
            )}
          </div>

          {/* Right: Purchase Box */}
          <div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 sticky top-8">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-[#b8832b]">£{product.priceGBP.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <span className="text-gray-500 line-through text-lg">£{product.compareAtPrice.toFixed(2)}</span>
                )}
                {discount && (
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-md font-bold">
                    Save {discount}%
                  </span>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-6">One-time payment · Instant download · Lifetime access</p>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Your email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gus@example.com"
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#b8832b]"
                  />
                  {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
                  <p className="text-xs text-gray-500 mt-1">Download link will be sent here</p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-[#b8832b] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#a07020] transition-colors disabled:opacity-50"
                >
                  {checkoutLoading ? 'Redirecting to payment...' : `Buy Now — £${product.priceGBP.toFixed(2)}`}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure payment via Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Instant download after payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>Download link sent to your email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>Questions? Email gus@sanchescoaching.co.uk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        {product.pageContent && (
          <div
            className="mt-12 prose prose-invert max-w-none prose-p:text-gray-300"
            dangerouslySetInnerHTML={{ __html: product.pageContent }}
          />
        )}
      </div>

      {/* Bottom CTA */}
      <section className="bg-[#111] border-t border-[#222] py-10 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-400 text-sm mb-3">Prefer personalised coaching?</p>
          <h3 className="text-xl font-bold mb-4">Book a 1-on-1 session with Gus</h3>
          <a
            href="/book"
            className="bg-transparent border border-[#b8832b] text-[#b8832b] px-6 py-3 rounded-lg font-semibold hover:bg-[#b8832b] hover:text-white transition-colors"
          >
            View Coaching Packages →
          </a>
        </div>
      </section>
    </main>
  );
}
