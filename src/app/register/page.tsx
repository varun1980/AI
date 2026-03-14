"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="pt-[72px] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-12">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white font-bold text-2xl mb-4"
          >
            SC
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Start your football journey today
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors mb-6">
          <FcGoogle size={20} />
          <span className="text-sm font-medium">Continue with Google</span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#050505] px-3 text-xs text-zinc-500">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">First Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="input-dark pl-10"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Last Name</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="input-dark"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="input-dark pl-10"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input-dark pl-10"
                placeholder="+44 7XXX XXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="input-dark pl-10"
                placeholder="Min 8 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="input-dark pl-10"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center py-3.5"
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-400 hover:text-gold-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
