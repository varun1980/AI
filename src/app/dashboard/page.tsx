"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiPackage,
  FiDollarSign,
  FiArrowRight,
  FiX,
  FiRefreshCw,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const mockBookings = [
  {
    id: "1",
    type: "1-to-1 Session",
    date: "Monday, 24 March 2025",
    time: "10:00 - 11:00",
    price: 50,
    status: "confirmed",
  },
  {
    id: "2",
    type: "1-to-1 Session",
    date: "Monday, 31 March 2025",
    time: "10:00 - 11:00",
    price: 50,
    status: "confirmed",
  },
];

const mockPastBookings = [
  {
    id: "3",
    type: "Skills Assessment",
    date: "Friday, 14 March 2025",
    time: "14:00 - 14:45",
    price: 40,
    status: "completed",
  },
];

const mockPackage = {
  name: "10-Week Package",
  totalSessions: 10,
  usedSessions: 3,
  expiresAt: "June 2025",
};

export default function DashboardPage() {
  const [tab, setTab] = useState<"upcoming" | "past" | "packages">("upcoming");

  return (
    <div className="pt-[72px] min-h-screen">
      <div className="container-sc py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Welcome back, John. Manage your bookings and packages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/book" className="btn-gold text-sm">
              New Booking <FiArrowRight />
            </Link>
            <button className="p-2 text-zinc-400 hover:text-white" title="Profile">
              <FiUser size={18} />
            </button>
            <Link href="/" className="p-2 text-zinc-400 hover:text-white" title="Logout">
              <FiLogOut size={18} />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: <FiCalendar className="text-gold-500" />,
              label: "Upcoming",
              value: mockBookings.length,
            },
            {
              icon: <FiPackage className="text-gold-500" />,
              label: "Package Sessions Left",
              value: mockPackage.totalSessions - mockPackage.usedSessions,
            },
            {
              icon: <FiClock className="text-gold-500" />,
              label: "Total Sessions",
              value: mockBookings.length + mockPastBookings.length,
            },
            {
              icon: <FiDollarSign className="text-gold-500" />,
              label: "Total Spent",
              value: "£190",
            },
          ].map((stat) => (
            <div key={stat.label} className="card-dark">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-zinc-500 text-xs">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-800">
          {(["upcoming", "past", "packages"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? "border-gold-500 text-gold-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "upcoming" && (
          <div className="space-y-3">
            {mockBookings.map((b) => (
              <div
                key={b.id}
                className="card-dark flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="font-semibold">{b.type}</p>
                    <p className="text-zinc-400 text-sm">
                      {b.date} &middot; {b.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gold-400">
                    £{b.price}
                  </span>
                  <button
                    className="p-2 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-800"
                    title="Reschedule"
                  >
                    <FiRefreshCw size={14} />
                  </button>
                  <button
                    className="p-2 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800"
                    title="Cancel"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "past" && (
          <div className="space-y-3">
            {mockPastBookings.map((b) => (
              <div key={b.id} className="card-dark flex items-center justify-between opacity-70">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="font-semibold">{b.type}</p>
                    <p className="text-zinc-500 text-sm">
                      {b.date} &middot; {b.time}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full capitalize">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "packages" && (
          <div className="max-w-lg">
            <div className="card-dark">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{mockPackage.name}</h3>
                <span className="text-xs bg-gold-500/10 text-gold-400 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                {mockPackage.usedSessions} of {mockPackage.totalSessions}{" "}
                sessions used &middot; Expires {mockPackage.expiresAt}
              </p>
              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-gold-500 to-gold-400 h-3 rounded-full transition-all"
                  style={{
                    width: `${(mockPackage.usedSessions / mockPackage.totalSessions) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-zinc-500">
                {mockPackage.totalSessions - mockPackage.usedSessions} sessions
                remaining
              </p>
            </div>

            <Link
              href="/packages"
              className="btn-outline-gold mt-4 inline-flex"
            >
              View All Packages
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
