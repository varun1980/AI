import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Football Training Resources & Digital Products | Sanches Coaching Shop',
  description: 'Professional football training plans, video courses, nutrition guides and more. Download instantly. Used by Gus Sanches in real coaching sessions.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const typeLabel: Record<string, string> = {
  EBOOK: 'eBook',
  VIDEO_COURSE: 'Video Course',
  TRAINING_PLAN: 'Training Plan',
  MEAL_PLAN: 'Nutrition Guide',
  BUNDLE: 'Bundle',
};

const typeIcon: Record<string, string> = {
  EBOOK: '📖',
  VIDEO_COURSE: '🎥',
  TRAINING_PLAN: '📋',
  MEAL_PLAN: '🥗',
  BUNDLE: '📦',
};

async function getProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/passive-income/shop`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getFeaturedAffiliates() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/passive-income/affiliates?featured=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const [products, affiliates] = await Promise.all([getProducts(), getFeaturedAffiliates()]);

  const featured = products.filter((p: any) => p.isFeatured);
  const regular = products.filter((p: any) => !p.isFeatured);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="bg-[#111] border-b border-[#222] py-16 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#b8832b] text-sm uppercase tracking-widest mb-3 font-medium">Training Resources</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Level Up Your Game</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional training plans, video courses and nutrition guides — the same resources Gus Sanches uses with his coaching clients. Download instantly.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Featured Products */}
        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>⭐</span> Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Products */}
        {regular.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6">All Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">Products coming soon.</p>
          </div>
        )}

        {/* Affiliate Products Section */}
        {affiliates.length > 0 && (
          <section className="mt-12 pt-12 border-t border-[#222]">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Gus's Recommended Gear</h2>
              <p className="text-gray-400 text-sm mt-1">
                Products Gus personally uses and recommends to every player he coaches.
                <span className="text-gray-600 ml-2 text-xs">(Some links are affiliate links — this helps support the coaching community at no extra cost to you.)</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affiliates.map((product: any) => (
                <AffiliateProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trust Section */}
      <section className="bg-[#111] border-t border-[#222] py-12 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-6">Why trust Sanches Coaching resources?</h3>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-3xl mb-2">🏆</p>
              <p className="font-medium mb-1">Professionally Created</p>
              <p className="text-gray-400">Created by a qualified coach with 10+ years of experience</p>
            </div>
            <div>
              <p className="text-3xl mb-2">⚡</p>
              <p className="font-medium mb-1">Instant Download</p>
              <p className="text-gray-400">Access your purchase immediately after payment</p>
            </div>
            <div>
              <p className="text-3xl mb-2">💬</p>
              <p className="font-medium mb-1">Proven Results</p>
              <p className="text-gray-400">Used by real clients to get into academies and improve their game</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product }: { product: any }) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.priceGBP) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#b8832b]/50 transition-colors group flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center relative">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{typeIcon[product.type] || '📦'}</span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-md font-bold">
            -{discount}%
          </span>
        )}
        <span className="absolute bottom-3 left-3 bg-[#0a0a0a]/80 text-white text-xs px-2 py-1 rounded-md">
          {typeLabel[product.type] || product.type}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold mb-2 group-hover:text-[#b8832b] transition-colors line-clamp-2">{product.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3 flex-1">{product.description}</p>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <ul className="space-y-1 mb-4">
            {product.features.slice(0, 3).map((f: string, i: number) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Pricing + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-bold text-[#b8832b]">£{product.priceGBP.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">£{product.compareAtPrice.toFixed(2)}</span>
            )}
          </div>
          <a
            href={`/shop/${product.slug}`}
            className="bg-[#b8832b] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#a07020] transition-colors"
          >
            Buy Now
          </a>
        </div>

        {product.purchaseCount > 0 && (
          <p className="text-xs text-gray-500 mt-2">{product.purchaseCount} sold</p>
        )}
      </div>
    </div>
  );
}

function AffiliateProductCard({ product }: { product: any }) {
  return (
    <a
      href={`/api/v1/passive-income/go/${product.trackingCode}`}
      target="_blank"
      rel="noopener"
      className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-[#b8832b]/30 transition-colors block"
    >
      <div className="flex items-start gap-3">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-[#1a1a1a]" />
        ) : (
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-2xl">⚽</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-2">
            {product.productPrice && (
              <span className="text-sm font-bold text-[#b8832b]">£{product.productPrice.toFixed(2)}</span>
            )}
            <span className="text-xs text-[#b8832b] font-medium">View →</span>
          </div>
        </div>
      </div>
    </a>
  );
}
