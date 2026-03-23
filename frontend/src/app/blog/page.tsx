import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Football Training Tips & Advice | Sanches Coaching Blog',
  description: 'Expert football coaching tips, youth development advice, training drills, and nutrition guides from professional coach Gus Sanches.',
  keywords: ['football coaching tips', 'youth football training', 'football drills', 'football development'],
};

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  tags: string[];
  featuredImageUrl: string | null;
  publishedAt: string;
  viewCount: number;
  author: string;
}

async function getPosts(page = 1) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/passive-income/blog?page=${page}&limit=12`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return { posts: [], total: 0, totalPages: 0 };
    return res.json();
  } catch {
    return { posts: [], total: 0, totalPages: 0 };
  }
}

export default async function BlogPage() {
  const { posts, total } = await getPosts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="bg-[#111] border-b border-[#222] py-16 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#b8832b] text-sm uppercase tracking-widest mb-3 font-medium">Coaching Blog</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Football Training Tips & Advice</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Free expert coaching advice from Gus Sanches — covering training drills, youth development, nutrition, and the mental side of the game.
          </p>
        </div>
      </section>

      {/* Lead Capture Banner */}
      <section className="bg-[#b8832b]/10 border-b border-[#b8832b]/20 py-6 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">📧 Get the free 4-week training plan</p>
            <p className="text-sm text-gray-400">Join 1,000+ players & parents getting weekly coaching tips</p>
          </div>
          <a
            href="#signup"
            className="bg-[#b8832b] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#a07020] transition-colors whitespace-nowrap"
          >
            Download Free →
          </a>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-5xl mx-auto px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Content coming soon.</p>
            <p className="text-gray-600 text-sm mt-2">New articles are published every Monday.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">{total} articles</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: Post) => (
                <article key={post.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-[#b8832b]/50 transition-colors group">
                  <div className="aspect-video bg-[#1a1a1a] relative">
                    {post.featuredImageUrl ? (
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">⚽</span>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-[#b8832b] text-white text-xs px-2 py-1 rounded-md font-medium">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-bold text-base mb-2 group-hover:text-[#b8832b] transition-colors line-clamp-2">
                      <a href={`/blog/${post.slug}`}>{post.title}</a>
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span>{post.viewCount} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Email Signup */}
      <section id="signup" className="bg-[#111] border-t border-[#222] py-16 px-8">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Get the Free 4-Week Training Plan</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Join 1,000+ players and parents. Get expert tips every week, plus instant access to Gus's free 4-week training programme.
          </p>
          <EmailSignupForm source="BLOG_POST" />
        </div>
      </section>
    </main>
  );
}

function EmailSignupForm({ source }: { source: string }) {
  return (
    <form
      action={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/passive-income/leads`}
      method="POST"
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="consentGiven" value="true" />
      <input
        type="text"
        name="firstName"
        placeholder="First name"
        className="bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#b8832b]"
      />
      <input
        type="email"
        name="email"
        placeholder="Your email address"
        required
        className="bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#b8832b]"
      />
      <button
        type="submit"
        className="bg-[#b8832b] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a07020] transition-colors"
      >
        Download Free Training Plan →
      </button>
      <p className="text-xs text-gray-500">No spam, ever. Unsubscribe anytime.</p>
    </form>
  );
}
