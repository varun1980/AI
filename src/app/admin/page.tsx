"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiDownload,
  FiSlash,
  FiCheck,
  FiX,
  FiClock,
} from "react-icons/fi";

const stats = [
  { label: "Total Bookings", value: "247", icon: <FiCalendar />, trend: "+12%" },
  { label: "Active Clients", value: "89", icon: <FiUsers />, trend: "+5%" },
  { label: "Revenue (Month)", value: "£4,350", icon: <FiDollarSign />, trend: "+18%" },
  { label: "Utilisation", value: "78%", icon: <FiTrendingUp />, trend: "+3%" },
];

const recentBookings = [
  { name: "James Parker", type: "1-to-1", date: "24 Mar", time: "10:00", status: "confirmed" },
  { name: "Sarah Mitchell", type: "Assessment", date: "24 Mar", time: "14:00", status: "confirmed" },
  { name: "David Kim", type: "Small Group", date: "25 Mar", time: "11:00", status: "pending" },
  { name: "Emma Wilson", type: "1-to-1", date: "25 Mar", time: "16:00", status: "confirmed" },
  { name: "Tom Harris", type: "1-to-1", date: "26 Mar", time: "09:00", status: "confirmed" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "bookings" | "clients">("overview");

  return (
    <div className="pt-[72px] min-h-screen">
      <div className="container-sc py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Manage bookings, clients, and business operations.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline-gold text-sm">
              <FiSlash size={14} /> Block Time
            </button>
            <button className="btn-gold text-sm">
              <FiDownload size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card-dark">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                  {s.icon}
                </div>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  {s.trend}
                </span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-800">
          {(["overview", "bookings", "clients"] as const).map((t) => (
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

        {/* Bookings table */}
        {tab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Bookings</h2>
              <Link href="/admin?tab=bookings" className="text-gold-400 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="card-dark p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-4 font-medium">Client</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Time</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b, i) => (
                    <tr
                      key={i}
                      className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30"
                    >
                      <td className="py-3 px-4 font-medium">{b.name}</td>
                      <td className="py-3 px-4 text-zinc-400">{b.type}</td>
                      <td className="py-3 px-4 text-zinc-400">{b.date}</td>
                      <td className="py-3 px-4 text-zinc-400">{b.time}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            b.status === "confirmed"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-zinc-500 hover:text-green-400 rounded hover:bg-zinc-800" title="Confirm">
                            <FiCheck size={14} />
                          </button>
                          <button className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800" title="Cancel">
                            <FiX size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Today's Schedule */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Today&apos;s Schedule</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card-dark">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                      <FiClock />
                    </div>
                    <div>
                      <p className="font-semibold">10:00 - 11:00</p>
                      <p className="text-zinc-400 text-xs">1-to-1 &middot; James Parker</p>
                    </div>
                  </div>
                </div>
                <div className="card-dark">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                      <FiClock />
                    </div>
                    <div>
                      <p className="font-semibold">14:00 - 14:45</p>
                      <p className="text-zinc-400 text-xs">Assessment &middot; Sarah Mitchell</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="text-center py-12 text-zinc-500">
            <FiCalendar size={48} className="mx-auto mb-4 text-zinc-700" />
            <p>Full booking management with filters and search.</p>
            <p className="text-xs mt-2">Connect a database to see live data.</p>
          </div>
        )}

        {tab === "clients" && (
          <div className="text-center py-12 text-zinc-500">
            <FiUsers size={48} className="mx-auto mb-4 text-zinc-700" />
            <p>Client management with profiles and booking history.</p>
            <p className="text-xs mt-2">Connect a database to see live data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
