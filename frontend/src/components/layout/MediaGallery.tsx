'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay } from 'react-icons/fi';

export function MediaGallery() {
  const [activeTab, setActiveTab] = useState<'videos' | 'images'>('videos');

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
            Training <span className="text-primary-500">Gallery</span>
          </h2>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-dark-800 p-1">
            {(['videos', 'images'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-display uppercase text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video bg-dark-800 rounded-lg overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              {activeTab === 'videos' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary-500/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiPlay className="text-white text-2xl ml-1" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
