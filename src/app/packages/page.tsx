import Link from "next/link";
import { FiCheck, FiArrowRight, FiStar } from "react-icons/fi";
import { PACKAGES } from "@/lib/data";

export default function PackagesPage() {
  return (
    <div className="pt-[72px] min-h-screen">
      {/* Header */}
      <section className="py-20 text-center">
        <div className="container-sc">
          <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Save More, Train More
          </p>
          <h1 className="section-heading mb-4">
            Training <span className="text-gold-400">Packages</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Commit to your development with our block booking packages. Train
            consistently, save money, and see real results.
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="pb-24">
        <div className="container-sc">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`card-dark relative overflow-hidden ${
                  pkg.popular ? "border-gold-500" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-4 right-4 bg-gold-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FiStar size={12} /> Most Popular
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
                <p className="text-zinc-400 text-sm mb-6">{pkg.description}</p>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-gold-400">
                    £{pkg.totalPrice}
                  </p>
                  <p className="text-zinc-500 text-sm mt-1">
                    £{(pkg.totalPrice / pkg.sessions).toFixed(2)} per session
                    &mdash;{" "}
                    <span className="text-green-400 font-semibold">
                      Save £{pkg.savings} ({pkg.discountPct}% off)
                    </span>
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-zinc-300"
                    >
                      <FiCheck className="text-gold-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/book?package=${pkg.id}`}
                  className={`w-full justify-center ${
                    pkg.popular ? "btn-gold" : "btn-outline-gold"
                  }`}
                >
                  Get Started <FiArrowRight />
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "How does scheduling work?",
                  a: "When you purchase a package, we'll book you into the same day and time each week. You can reschedule individual sessions with 24 hours notice.",
                },
                {
                  q: "What happens if Gus is unavailable?",
                  a: "If Gus needs to cancel a session (e.g. travel, illness), that session will be credited back to your package and rescheduled at a convenient time.",
                },
                {
                  q: "Can I share my package with someone?",
                  a: "Packages are individual and non-transferable. However, the Small Group session type allows training with friends.",
                },
                {
                  q: "What's the refund policy?",
                  a: "Unused sessions in active packages can be refunded on a pro-rata basis. Contact us to discuss your specific situation.",
                },
              ].map((faq) => (
                <div key={faq.q} className="card-dark">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-zinc-400 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
