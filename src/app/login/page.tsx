"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // In production, call API
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="pt-[72px] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white font-bold text-2xl mb-4"
          >
            SC
          </Link>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-zinc-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Google button */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark pl-10"
                placeholder="you@example.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark pl-10"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-zinc-400">
              <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900" />
              Remember me
            </label>
            <Link href="#" className="text-gold-400 hover:text-gold-300">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center py-3.5"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-gold-400 hover:text-gold-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
