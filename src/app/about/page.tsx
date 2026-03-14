import Link from "next/link";
import {
  FiAward,
  FiUsers,
  FiTarget,
  FiHeart,
  FiArrowRight,
} from "react-icons/fi";

export default function AboutPage() {
  return (
    <div className="pt-[72px] min-h-screen">
      {/* Header */}
      <section className="py-20">
        <div className="container-sc">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Photo placeholder */}
            <div className="aspect-[4/5] bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center text-zinc-700">
              <FiUsers size={64} />
            </div>

            {/* Bio */}
            <div>
              <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
                Meet Your Coach
              </p>
              <h1 className="section-heading mb-6">
                Gus <span className="text-gold-400">Sanches</span>
              </h1>
              <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>
                  With over 10 years of experience in football coaching, Gus
                  Sanches has dedicated his career to developing players at every
                  level &mdash; from grassroots beginners to academy prospects.
                </p>
                <p>
                  Gus holds UEFA coaching qualifications and has worked with
                  professional clubs, academies, and community programmes across
                  London. His coaching philosophy centres on technical
                  excellence, tactical intelligence, and building genuine
                  confidence on the pitch.
                </p>
                <p>
                  Sanches Coaching was founded with a simple mission: to provide
                  accessible, premium-quality football coaching that makes a real
                  difference. Every session is personalised, every player is
                  valued, and every goal is worth chasing.
                </p>
              </div>

              <div className="mt-8 flex gap-4">
                <Link href="/book" className="btn-gold">
                  Book a Session <FiArrowRight />
                </Link>
                <Link href="/contact" className="btn-outline-gold">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-zinc-950/50">
        <div className="container-sc">
          <h2 className="section-heading text-center mb-16">
            Our <span className="text-gold-400">Values</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FiTarget className="text-2xl" />,
                title: "Excellence",
                desc: "We hold ourselves and our clients to the highest standards. Every session is planned, purposeful, and professional.",
              },
              {
                icon: <FiHeart className="text-2xl" />,
                title: "Passion",
                desc: "Football is more than a sport to us. We bring genuine enthusiasm and energy to every session.",
              },
              {
                icon: <FiUsers className="text-2xl" />,
                title: "Inclusivity",
                desc: "Everyone is welcome. We coach players of all ages, abilities, and backgrounds.",
              },
              {
                icon: <FiAward className="text-2xl" />,
                title: "Results",
                desc: "We measure success by the progress of our clients. Tangible, measurable improvement is the goal.",
              },
            ].map((v) => (
              <div key={v.title} className="card-dark text-center">
                <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 mx-auto mb-5">
                  {v.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="py-20">
        <div className="container-sc max-w-3xl">
          <h2 className="section-heading text-center mb-12">
            Qualifications & <span className="text-gold-400">Experience</span>
          </h2>
          <div className="space-y-4">
            {[
              "UEFA B Coaching Licence",
              "FA Level 3 Award in Coaching Football",
              "FA Safeguarding Children Certificate",
              "FA Emergency Aid Certificate",
              "Enhanced DBS Checked",
              "10+ years coaching experience across all age groups",
              "Academy coaching experience with professional clubs",
              "Community coaching programme development",
            ].map((q) => (
              <div
                key={q}
                className="flex items-center gap-3 text-zinc-300 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                {q}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
