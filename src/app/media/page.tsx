"use client";

import { useState } from "react";
import { FiPlay, FiInstagram, FiExternalLink } from "react-icons/fi";

const videos = [
  { id: 1, title: "1v1 Dribbling Masterclass", duration: "12:34" },
  { id: 2, title: "Finishing Under Pressure", duration: "8:45" },
  { id: 3, title: "First Touch Drills", duration: "15:20" },
  { id: 4, title: "Camp Highlights - Summer 2024", duration: "5:12" },
  { id: 5, title: "Client Testimonial - James", duration: "3:45" },
  { id: 6, title: "Passing & Vision Training", duration: "10:30" },
];

const photos = [
  { id: 1, alt: "Training session" },
  { id: 2, alt: "Camp group photo" },
  { id: 3, alt: "1-to-1 coaching" },
  { id: 4, alt: "Skills workshop" },
  { id: 5, alt: "Award ceremony" },
  { id: 6, alt: "Match day preparation" },
  { id: 7, alt: "Facility" },
  { id: 8, alt: "Team training" },
];

export default function MediaPage() {
  const [tab, setTab] = useState<"videos" | "photos">("videos");

  return (
    <div className="pt-[72px] min-h-screen">
      {/* Header */}
      <section className="py-20 text-center">
        <div className="container-sc">
          <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Training Content
          </p>
          <h1 className="section-heading mb-4">
            Media <span className="text-gold-400">Gallery</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Watch training sessions, highlights, and testimonials from our
            coaching programmes.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="pb-24">
        <div className="container-sc">
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-zinc-900 rounded-lg p-1">
              {(["videos", "photos"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors capitalize ${
                    tab === t
                      ? "bg-gold-500 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Videos */}
          {tab === "videos" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="card-dark group cursor-pointer p-0 overflow-hidden"
                >
                  <div className="aspect-video bg-zinc-800 flex items-center justify-center relative">
                    <div className="w-14 h-14 rounded-full bg-gold-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FiPlay className="text-white ml-1" size={22} />
                    </div>
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {v.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm">{v.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Photos */}
          {tab === "photos" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="aspect-square bg-zinc-800 rounded-lg overflow-hidden group cursor-pointer relative"
                >
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiExternalLink className="text-white" size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instagram CTA */}
          <div className="text-center mt-16">
            <p className="text-zinc-400 text-sm mb-4">
              Follow us for daily training content
            </p>
            <a
              href="https://www.instagram.com/sanchescoaching"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <FiInstagram />
              Follow @SanchesCoaching
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
