'use client';

import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';

const features = [
  {
    icon: FiTarget,
    title: 'Personalized Training',
    description: 'Tailored sessions designed specifically for your skill level and goals.',
  },
  {
    icon: FiUsers,
    title: 'Expert Coaching',
    description: '10+ years of professional coaching experience at elite levels.',
  },
  {
    icon: FiTrendingUp,
    title: 'Proven Results',
    description: 'Measurable improvements in technique, fitness, and game intelligence.',
  },
  {
    icon: FiAward,
    title: 'Premium Facilities',
    description: 'State-of-the-art training facilities with professional-grade equipment.',
  },
];

export function Features() {
  return (
    <section className="section bg-dark-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Why Choose <span className="text-primary-500">Sanches Coaching</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience premium football coaching that delivers real results
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card group"
            >
              <div className="w-16 h-16 bg-primary-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors">
                <feature.icon className="text-primary-500 text-3xl" />
              </div>
              <h3 className="text-xl font-display uppercase mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
