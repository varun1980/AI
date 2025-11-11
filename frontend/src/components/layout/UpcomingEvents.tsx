'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';

const events = [
  {
    title: 'Summer Training Camp 2024',
    date: 'July 15-19, 2024',
    location: 'City Sports Complex',
    capacity: 20,
    available: 12,
    price: '£350',
    image: '/images/camp-1.jpg',
  },
  {
    title: 'Elite Skills Workshop',
    date: 'August 5-6, 2024',
    location: 'Elite Training Ground',
    capacity: 15,
    available: 8,
    price: '£200',
    image: '/images/camp-2.jpg',
  },
];

export function UpcomingEvents() {
  return (
    <section className="section bg-dark-950">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Upcoming <span className="text-primary-500">Events</span>
          </h2>
          <p className="text-xl text-gray-400">
            Join our exclusive training camps and workshops
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden"
            >
              <div className="aspect-video bg-dark-800 rounded-lg mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent z-10" />
              </div>

              <h3 className="text-2xl font-display uppercase mb-4">{event.title}</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-400">
                  <FiCalendar className="mr-3 text-primary-500" />
                  {event.date}
                </div>
                <div className="flex items-center text-gray-400">
                  <FiMapPin className="mr-3 text-primary-500" />
                  {event.location}
                </div>
                <div className="flex items-center text-gray-400">
                  <FiUsers className="mr-3 text-primary-500" />
                  {event.available} of {event.capacity} spots available
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-display text-primary-500">{event.price}</div>
                <Link href={`/events/${index}`} className="btn-primary">
                  Register Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/events" className="btn-outline">
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
}
