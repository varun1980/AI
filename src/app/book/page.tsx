"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FiCheck,
  FiCalendar,
  FiClock,
  FiArrowLeft,
  FiArrowRight,
  FiUser,
  FiUsers,
  FiClipboard,
} from "react-icons/fi";
import {
  addDays,
  format,
  startOfDay,
  isSameDay,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
} from "date-fns";
import { SESSION_TYPES, TIME_SLOTS } from "@/lib/data";

const iconMap: Record<string, React.ReactNode> = {
  user: <FiUser size={20} />,
  users: <FiUsers size={20} />,
  clipboard: <FiClipboard size={20} />,
  calendar: <FiCalendar size={20} />,
};

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [, setConfirmed] = useState(false);

  const session = SESSION_TYPES.find((s) => s.id === selectedType);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const paddingDays = getDay(start) === 0 ? 6 : getDay(start) - 1;
    const padding = Array(paddingDays).fill(null);
    return [...padding, ...days];
  }, [currentMonth]);

  const isDateAvailable = (date: Date) => {
    const day = getDay(date);
    if (day === 0) return false; // Sunday
    if (isBefore(date, startOfDay(addDays(new Date(), 1)))) return false;
    return true;
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setStep(4);
  };

  return (
    <div className="pt-[72px] min-h-screen">
      <div className="container-sc py-12">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-0 mb-12 max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                  step >= s
                    ? "bg-gold-500 text-white"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {step > s ? <FiCheck size={16} /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`h-0.5 flex-1 mx-1 transition-colors ${
                    step > s ? "bg-gold-500" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Session Type */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <h1 className="section-heading text-center mb-2">Choose Your Session</h1>
            <p className="text-zinc-400 text-center mb-10">
              Select the type of coaching that suits your needs.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {SESSION_TYPES.filter((s) => s.id !== "camp").map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedType(s.id);
                    setStep(2);
                  }}
                  className={`card-dark text-left cursor-pointer ${
                    selectedType === s.id ? "border-gold-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                      {iconMap[s.icon]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{s.name}</h3>
                      <p className="text-zinc-500 text-sm">{s.duration} min</p>
                      <p className="text-zinc-400 text-sm mt-2">{s.description}</p>
                      <p className="text-gold-400 font-bold text-xl mt-3">£{s.price}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm"
            >
              <FiArrowLeft size={14} /> Back to session types
            </button>

            <h1 className="section-heading mb-2">
              Pick a Date & Time
            </h1>
            <p className="text-zinc-400 mb-8">
              {session?.name} &mdash; {session?.duration} min &mdash; £{session?.price}
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div className="card-dark">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    <FiArrowLeft size={16} />
                  </button>
                  <span className="font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    <FiArrowRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-2">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                    <span key={d} className="py-1">{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) =>
                    day ? (
                      <button
                        key={i}
                        disabled={!isDateAvailable(day)}
                        onClick={() => setSelectedDate(day)}
                        className={`py-2 rounded-md text-sm transition-colors ${
                          selectedDate && isSameDay(day, selectedDate)
                            ? "bg-gold-500 text-white font-semibold"
                            : isDateAvailable(day)
                            ? "hover:bg-zinc-800 text-zinc-300"
                            : "text-zinc-700 cursor-not-allowed"
                        }`}
                      >
                        {format(day, "d")}
                      </button>
                    ) : (
                      <span key={i} />
                    )
                  )}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FiClock className="text-gold-500" />
                  {selectedDate
                    ? format(selectedDate, "EEEE, d MMMM")
                    : "Select a date first"}
                </h3>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.filter((_, i) => {
                      if (getDay(selectedDate!) === 6) return i < 6;
                      return true;
                    }).map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? "bg-gold-500 text-white"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">
                    Choose a date on the calendar to see available times.
                  </p>
                )}

                {selectedDate && selectedTime && (
                  <div className="mt-6">
                    <label className="block text-sm text-zinc-400 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-dark h-24 resize-none"
                      placeholder="Tell Gus about your goals or areas to focus on..."
                    />
                    <button
                      onClick={() => setStep(3)}
                      className="btn-gold w-full mt-4 justify-center"
                    >
                      Continue <FiArrowRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details & Confirm */}
        {step === 3 && (
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm"
            >
              <FiArrowLeft size={14} /> Back
            </button>

            <h1 className="section-heading mb-8">Your Details</h1>

            {/* Summary */}
            <div className="card-dark mb-8">
              <h3 className="font-semibold mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <p className="flex items-center gap-2">
                  <FiCheck className="text-gold-500" /> {session?.name}
                </p>
                <p className="flex items-center gap-2">
                  <FiCalendar className="text-gold-500" />{" "}
                  {selectedDate && format(selectedDate, "EEEE, d MMMM yyyy")}
                </p>
                <p className="flex items-center gap-2">
                  <FiClock className="text-gold-500" /> {selectedTime}
                </p>
              </div>
              <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-gold-400">
                  £{session?.price}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-dark"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-dark"
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>
              <button
                onClick={handleConfirm}
                disabled={!name || !email}
                className="btn-gold w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Pay £{session?.price}
              </button>
              <p className="text-xs text-zinc-600 text-center">
                Payment will be processed securely via Stripe.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-400" size={36} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-zinc-400 mb-2">
              Your {session?.name} is booked for
            </p>
            <p className="text-lg font-semibold text-gold-400 mb-1">
              {selectedDate && format(selectedDate, "EEEE, d MMMM yyyy")}
            </p>
            <p className="text-lg font-semibold text-gold-400 mb-8">
              at {selectedTime}
            </p>
            <p className="text-zinc-500 text-sm mb-8">
              A confirmation email with a calendar invite has been sent to{" "}
              <span className="text-zinc-300">{email}</span>.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard" className="btn-gold">
                My Dashboard
              </Link>
              <Link href="/" className="btn-outline-gold">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
