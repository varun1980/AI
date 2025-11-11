'use client';

import { motion } from 'framer-motion';
import { FiInstagram } from 'react-icons/fi';

export function InstagramFeed() {
  return (
    <section className="section bg-dark-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">
            Follow <span className="text-primary-500">@SanchesCoaching</span>
          </h2>
          <p className="text-xl text-gray-400">Stay updated with our latest training content</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-square bg-dark-800 rounded-lg overflow-hidden group cursor-pointer relative"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <FiInstagram className="text-white text-3xl" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://instagram.com/sanchescoaching"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center"
          >
            <FiInstagram className="mr-2" />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
