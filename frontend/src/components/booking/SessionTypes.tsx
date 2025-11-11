'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiUser, FiUsers, FiClipboard, FiCalendar } from 'react-icons/fi';

const sessionTypes = [
  {
    icon: FiUser,
    title: '1-to-1 Session',
    duration: '60 minutes',
    price: '£50',
    description: 'Intensive one-on-one coaching focused on your individual development',
    features: [
      'Personalized training plan',
      'Video analysis',
      'Performance tracking',
      'Direct feedback',
    ],
  },
  {
    icon: FiUsers,
    title: 'Small Group',
    duration: '90 minutes',
    price: '£30',
    description: 'Train with up to 4 players in a dynamic group environment',
    features: [
      'Competitive drills',
      'Team dynamics',
      'Match situations',
      'Peer learning',
    ],
  },
  {
    icon: FiClipboard,
    title: 'Assessment',
    duration: '45 minutes',
    price: '£40',
    description: 'Comprehensive skills assessment with detailed feedback report',
    features: [
      'Technical evaluation',
      'Strengths & weaknesses',
      'Development roadmap',
      'Written report',
    ],
  },
  {
    icon: FiCalendar,
    title: 'Training Camp',
    duration: '3-5 days',
    price: 'From £300',
    description: 'Intensive multi-day camps during school holidays',
    features: [
      'Full-day sessions',
      'Tournament play',
      'Guest coaches',
      'Certificates',
    ],
  },
];

export function SessionTypes() {
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
            Training <span className="text-primary-500">Options</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect training format for your needs and goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessionTypes.map((session, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-primary-500/10 rounded-lg flex items-center justify-center mb-6">
                <session.icon className="text-primary-500 text-3xl" />
              </div>

              <h3 className="text-2xl font-display uppercase mb-2">{session.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{session.duration}</p>
              <p className="text-gray-300 mb-6 flex-grow">{session.description}</p>

              <ul className="space-y-2 mb-6">
                {session.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <div className="text-3xl font-display text-primary-500 mb-4">
                  {session.price}
                </div>
                <Link href={`/book?type=${session.title}`} className="btn-primary w-full">
                  Book Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/packages" className="btn-outline text-lg px-8 py-4">
            View Package Deals
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
