"use client";

import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiInstagram,
  FiSend,
  FiCheck,
} from "react-icons/fi";
import { WORKING_HOURS } from "@/lib/data";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call an API
    setSent(true);
  };

  return (
    <div className="pt-[72px] min-h-screen">
      {/* Header */}
      <section className="py-20 text-center">
        <div className="container-sc">
          <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Get In Touch
          </p>
          <h1 className="section-heading mb-4">
            Contact <span className="text-gold-400">Us</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Have a question or want to learn more? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-sc">
          <div className="grid lg:grid-cols-[1fr,1.2fr] gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Contact Details</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:gus@sanchescoaching.co.uk"
                    className="flex items-center gap-3 text-zinc-400 hover:text-gold-400 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                      <FiMail size={18} />
                    </div>
                    <span className="text-sm">gus@sanchescoaching.co.uk</span>
                  </a>
                  <a
                    href="tel:+447000000000"
                    className="flex items-center gap-3 text-zinc-400 hover:text-gold-400 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                      <FiPhone size={18} />
                    </div>
                    <span className="text-sm">+44 7XXX XXXXXX</span>
                  </a>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                      <FiMapPin size={18} />
                    </div>
                    <span className="text-sm">London, United Kingdom</span>
                  </div>
                  <a
                    href="https://www.instagram.com/sanchescoaching"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-zinc-400 hover:text-gold-400 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                      <FiInstagram size={18} />
                    </div>
                    <span className="text-sm">@sanchescoaching</span>
                  </a>
                </div>
              </div>

              {/* Working hours */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FiClock className="text-gold-500" /> Working Hours
                </h3>
                <div className="space-y-2">
                  {WORKING_HOURS.map((wh) => (
                    <div
                      key={wh.day}
                      className="flex justify-between text-sm py-1"
                    >
                      <span className="text-zinc-400">{wh.day}</span>
                      <span
                        className={
                          wh.hours === "Closed"
                            ? "text-zinc-600"
                            : "text-zinc-300"
                        }
                      >
                        {wh.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-dark">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="text-green-400" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-zinc-400 text-sm">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-semibold text-lg mb-2">
                    Send a Message
                  </h3>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="input-dark"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="input-dark"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Subject
                    </label>
                    <input
                      required
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="input-dark"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Message
                    </label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="input-dark h-32 resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <button type="submit" className="btn-gold w-full justify-center">
                    Send Message <FiSend size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
