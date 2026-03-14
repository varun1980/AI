import Link from "next/link";
import {
  FiUser,
  FiUsers,
  FiClipboard,
  FiCalendar,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiStar,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { SESSION_TYPES, TESTIMONIALS, EVENTS } from "@/lib/data";

const iconMap: Record<string, React.ReactNode> = {
  user: <FiUser />,
  users: <FiUsers />,
  clipboard: <FiClipboard />,
  calendar: <FiCalendar />,
};

export default function Home() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-[#050505] to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(223,143,39,.15),transparent)]" />

        <div className="relative z-10 container-sc text-center py-32">
          <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-6">
            Premium Football Coaching
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
            Elevate Your
            <br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              Football Game
            </span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Expert 1-to-1 coaching with Gus Sanches. Transform your technique,
            sharpen your tactical awareness, and unlock your full potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-gold text-base px-8 py-4">
              Book a Session
              <FiArrowRight />
            </Link>
            <Link href="/packages" className="btn-outline-gold text-base px-8 py-4">
              View Packages
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-20 max-w-xl mx-auto">
            {[
              { value: "500+", label: "Sessions Delivered" },
              { value: "10+", label: "Years Experience" },
              { value: "98%", label: "Client Satisfaction" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-bold text-gold-400">{s.value}</p>
                <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Why Choose Us ───── */}
      <section className="py-24 bg-zinc-950/50">
        <div className="container-sc">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              Why Choose <span className="text-gold-400">Sanches Coaching</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Dedicated, professional coaching that delivers measurable results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FiTarget className="text-2xl" />,
                title: "Personalised Training",
                desc: "Every session tailored to your skill level, position, and goals.",
              },
              {
                icon: <FiAward className="text-2xl" />,
                title: "Expert Coaching",
                desc: "10+ years of professional experience at grassroots and elite levels.",
              },
              {
                icon: <FiTrendingUp className="text-2xl" />,
                title: "Proven Results",
                desc: "Measurable improvements in technique, fitness, and match performance.",
              },
              {
                icon: <FiStar className="text-2xl" />,
                title: "Premium Experience",
                desc: "Professional facilities, video analysis, and detailed feedback reports.",
              },
            ].map((f) => (
              <div key={f.title} className="card-dark group">
                <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 mb-5 group-hover:bg-gold-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Session Types ───── */}
      <section className="py-24">
        <div className="container-sc">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              Training <span className="text-gold-400">Options</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Choose the format that fits your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SESSION_TYPES.map((s) => (
              <div key={s.id} className="card-dark flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 text-xl mb-5">
                  {iconMap[s.icon]}
                </div>
                <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                <p className="text-zinc-500 text-xs mb-4">
                  {s.duration ? `${s.duration} minutes` : "Multi-day"}
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">
                  {s.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <FiCheck className="text-gold-500 shrink-0" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <p className="text-3xl font-bold text-gold-400 mb-4">
                    {s.price === 300 ? "From " : ""}£{s.price}
                  </p>
                  <Link href={`/book?type=${s.id}`} className="btn-gold w-full justify-center">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Testimonials ───── */}
      <section className="py-24 bg-zinc-950/50">
        <div className="container-sc">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              What Clients <span className="text-gold-400">Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-dark">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="text-gold-400 fill-gold-400" size={16} />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-zinc-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Upcoming Events preview ───── */}
      <section className="py-24">
        <div className="container-sc">
          <div className="text-center mb-16">
            <h2 className="section-heading">
              Upcoming <span className="text-gold-400">Events</span>
            </h2>
            <p className="text-zinc-400 mt-4">Exclusive training camps and workshops.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {EVENTS.map((e) => (
              <div key={e.id} className="card-dark">
                <div className="aspect-video bg-zinc-800 rounded-lg mb-5 flex items-center justify-center text-zinc-600">
                  <FiCalendar size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{e.title}</h3>
                <div className="space-y-1 text-sm text-zinc-400 mb-4">
                  <p className="flex items-center gap-2">
                    <FiCalendar className="text-gold-500" size={14} />
                    {e.date}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiUsers className="text-gold-500" size={14} />
                    {e.spotsLeft} of {e.capacity} spots left
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-2xl font-bold text-gold-400">£{e.price}</p>
                  <Link href={`/events#${e.id}`} className="btn-gold text-xs py-2 px-4">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/events" className="btn-outline-gold">View All Events</Link>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-24 bg-gradient-to-b from-zinc-950/50 to-[#050505]">
        <div className="container-sc text-center">
          <h2 className="section-heading mb-6">
            Ready to <span className="text-gold-400">Train?</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-10">
            Book your first session today and take the first step towards
            becoming the player you want to be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-gold text-base px-8 py-4">
              Book a Session <FiArrowRight />
            </Link>
            <Link href="/contact" className="btn-outline-gold text-base px-8 py-4">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
