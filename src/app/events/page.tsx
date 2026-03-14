import Link from "next/link";
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiArrowRight } from "react-icons/fi";
import { EVENTS } from "@/lib/data";

export default function EventsPage() {
  return (
    <div className="pt-[72px] min-h-screen">
      {/* Header */}
      <section className="py-20 text-center">
        <div className="container-sc">
          <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Camps & Workshops
          </p>
          <h1 className="section-heading mb-4">
            Upcoming <span className="text-gold-400">Events</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Join our intensive training camps and specialist workshops. Limited
            spaces available.
          </p>
        </div>
      </section>

      {/* Events list */}
      <section className="pb-24">
        <div className="container-sc">
          <div className="space-y-8 max-w-4xl mx-auto">
            {EVENTS.map((event) => (
              <div
                key={event.id}
                id={event.id}
                className="card-dark grid md:grid-cols-[1fr,1.5fr] gap-6 scroll-mt-24"
              >
                {/* Image placeholder */}
                <div className="aspect-video md:aspect-auto bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600">
                  <FiCalendar size={48} />
                </div>

                {/* Details */}
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold mb-3">{event.title}</h2>
                  <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400 mb-6">
                    <p className="flex items-center gap-2">
                      <FiCalendar className="text-gold-500" size={14} />
                      {event.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiMapPin className="text-gold-500" size={14} />
                      {event.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <FiUsers className="text-gold-500" size={14} />
                      {event.spotsLeft} of {event.capacity} spots left
                    </p>
                    <p className="flex items-center gap-2">
                      <FiClock className="text-gold-500" size={14} />
                      9:00 AM - 4:00 PM daily
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-3xl font-bold text-gold-400">
                        £{event.price}
                      </p>
                      <p className="text-zinc-500 text-xs">per person</p>
                    </div>
                    <Link
                      href={`/book?type=camp&event=${event.id}`}
                      className="btn-gold"
                    >
                      Register Now <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="max-w-lg mx-auto mt-20 text-center">
            <h3 className="text-xl font-bold mb-3">
              Don&apos;t Miss Out
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Get notified when new camps and events are announced.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="input-dark flex-1"
              />
              <button type="submit" className="btn-gold shrink-0">
                Notify Me
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
