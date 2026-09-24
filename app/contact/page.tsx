/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { FormEvent, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      setMessage("");
  
      const res = await fetch(`${API_URL}/contact-enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit enquiry");
      }
  
      setMessage("Enquiry sent successfully!");
  
      setForm({
        name: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            PROPERTY<span className="text-amber-500">HUB</span>
          </a>

          <nav className="hidden gap-8 text-sm font-medium md:flex">
            <a href="/" className="hover:text-amber-500">
              Home
            </a>

            <a href="/properties" className="hover:text-amber-500">
              Properties
            </a>

            <a href="/contact" className="text-amber-500">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
            Get in touch
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Let&apos;s find the right property for you.
          </h1>

          <p className="mt-5 max-w-2xl text-slate-300">
            Have a question about a property or want help finding your next
            property? Send us a message and our team will get back to you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        {/* Contact Info */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Contact information
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            We&apos;re here to help.
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Contact us for property details, site visits, availability,
            pricing information, or any other property-related enquiry.
          </p>

          <div className="mt-8 space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Phone</p>
              <a
                href="tel:+919999999999"
                className="mt-1 block font-semibold hover:text-amber-500"
              >
                +91 99999 99999
              </a>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Email</p>
              <a
                href="mailto:info@propertyhub.com"
                className="mt-1 block font-semibold hover:text-amber-500"
              >
                info@propertyhub.com
              </a>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Office</p>
              <p className="mt-1 font-semibold">
                Delhi NCR, India
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 md:p-8">
          <h2 className="text-2xl font-bold">Send us an enquiry</h2>

          <p className="mt-2 text-sm text-slate-500">
            Fill in your details and we&apos;ll contact you.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone
                </label>

                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="Enter email address"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Message
              </label>

              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                placeholder="Tell us what property you are looking for..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Enquiry"}
            </button>

            {message && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500 lg:px-8">
          © {new Date().getFullYear()} PROPERTYHUB. All rights reserved.
        </div>
      </footer>
    </main>
  );
}