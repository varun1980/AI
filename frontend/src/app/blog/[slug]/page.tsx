import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getPost(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/passive-income/blog/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.metaTitle || `${post.title} | Sanches Coaching`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Breadcrumb */}
      <div className="bg-[#111] border-b border-[#222] py-3 px-8">
        <div className="max-w-3xl mx-auto text-sm text-gray-400">
          <a href="/" className="hover:text-white">Home</a>
          <span className="mx-2">/</span>
          <a href="/blog" className="hover:text-white">Blog</a>
          <span className="mx-2">/</span>
          <span className="text-white">{post.title}</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-8 py-12">
        {/* Meta */}
        <div className="mb-6">
          {post.category && (
            <span className="bg-[#b8832b] text-white text-xs px-3 py-1 rounded-full font-medium">
              {post.category}
            </span>
          )}
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-[#222]">
          <span>By {post.author}</span>
          <span>•</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span>•</span>
          <span>{post.viewCount} views</span>
        </div>

        {/* Featured Image */}
        {post.featuredImageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={post.featuredImageUrl} alt={post.imageAlt || post.title} className="w-full" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-[#b8832b]
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-gray-300
            prose-strong:text-white
            prose-a:text-[#b8832b] prose-a:no-underline hover:prose-a:underline
            prose-ul:space-y-2 prose-ol:space-y-2"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#222]">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="bg-[#1a1a1a] text-gray-400 text-xs px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Email Capture CTA */}
      <section className="bg-[#111] border-t border-[#222] py-12 px-8">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Want more training tips like this?</h2>
          <p className="text-gray-400 text-sm mb-6">
            Get Gus's free 4-week training plan + weekly coaching tips delivered to your inbox.
          </p>
          <div className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#b8832b]"
            />
            <button className="bg-[#b8832b] text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-[#a07020] whitespace-nowrap">
              Get It Free
            </button>
          </div>
        </div>
      </section>

      {/* Related CTAs */}
      <section className="max-w-3xl mx-auto px-8 py-10">
        <h3 className="text-lg font-semibold mb-4">Ready to take it further?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/shop"
            className="bg-[#111] border border-[#222] hover:border-[#b8832b]/50 rounded-xl p-5 transition-colors"
          >
            <p className="font-semibold mb-1">📚 Training Resources</p>
            <p className="text-gray-400 text-sm">Download our training plans, nutrition guides and video courses.</p>
          </a>
          <a
            href="/book"
            className="bg-[#b8832b]/10 border border-[#b8832b]/40 hover:border-[#b8832b] rounded-xl p-5 transition-colors"
          >
            <p className="font-semibold mb-1">🏆 Book 1-on-1 Coaching</p>
            <p className="text-gray-400 text-sm">Work directly with Gus Sanches for personalised development.</p>
          </a>
        </div>
      </section>
    </main>
  );
}
