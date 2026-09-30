/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getBrowserApiUrl } from "../../lib/api";

const API_URL = getBrowserApiUrl();

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      router.push("/admin");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f0e7] px-4 py-8 sm:px-6">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-[430px]">

          {/* ================= BRAND ================= */}
          <div className="mb-7 text-center">
            <a
              href="/"
              aria-label="YM Realty Home"
              className="inline-flex flex-col items-center"
            >
              {/* Logo */}
              <div className="relative mx-auto h-28 w-72 overflow-hidden sm:h-32 sm:w-80">
                <Image
                  src="/images/ym-realty-logo.png"
                  alt="YM Realty"
                  fill
                  priority
                  sizes="320px"
                  className="object-contain mix-blend-multiply scale-[1.28]"
                />
              </div>
            </a>

            {/* Portal text */}
            <p className="mt-2 text-sm font-medium tracking-wide text-[#766a5b]">
              Property Management Portal
            </p>
          </div>

          {/* ================= LOGIN CARD ================= */}
          <div className="rounded-[24px] border border-[#d9ccb9] bg-white p-6 shadow-[0_20px_55px_rgba(65,48,27,0.12)] sm:p-8">

            {/* Gold accent */}
            <div className="mb-6 h-[3px] w-12 rounded-full bg-[#b08a45]" />

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-3xl font-semibold tracking-tight text-[#29231c]">
                Admin Login
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#7c7164]">
                Sign in to manage your properties and enquiries.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ================= FORM ================= */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#493c2d]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-xl border border-[#d8cdbd] bg-[#fdfbf8] px-4 text-sm text-[#30271d] outline-none transition placeholder:text-[#a79d90] focus:border-[#a47a32] focus:bg-white focus:ring-4 focus:ring-[#b08a45]/10"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#493c2d]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-xl border border-[#d8cdbd] bg-[#fdfbf8] px-4 text-sm text-[#30271d] outline-none transition placeholder:text-[#a79d90] focus:border-[#a47a32] focus:bg-white focus:ring-4 focus:ring-[#b08a45]/10"
                />
              </div>

              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[#2f271f] px-4 text-sm font-semibold text-white transition hover:bg-[#42372c] focus:outline-none focus:ring-4 focus:ring-[#b08a45]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 h-px bg-[#eee7dc]" />

            {/* Back */}
            <div className="text-center">
              <a
                href="/"
                className="text-sm font-medium text-[#806f5b] transition hover:text-[#a47a32]"
              >
                ← Back to website
              </a>
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <p className="mt-6 text-center text-xs text-[#958979]">
            © {new Date().getFullYear()} YM Realty. Admin access only.
          </p>
        </div>
      </div>
    </main>
  );
}