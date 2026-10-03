"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { site } from "../lib/site";
import { getBrowserApiUrl } from "../lib/api";

const API_URL = getBrowserApiUrl();

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const res = await fetch(`${API_URL}/contact-enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to submit enquiry");
      setMessage("Thank you. Your enquiry has been received.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="story-site contact-page">
      <Header cta={null} />
      <section className="contact-hero-page">
        <Image src="/story-house/18.webp" alt="The Story House entrance" fill priority sizes="100vw" />
        <div className="contact-hero-shade" />
        <div className="contact-hero-copy">
          <span className="eyebrow eyebrow-gold">The Story House</span>
          <h1>Let the next chapter begin with a conversation.</h1>
          <p>Ask about residences, floor plans, amenities, availability or a private site visit.</p>
        </div>
      </section>

      <section className="contact-form-section section-pad">
        <div className="contact-form-grid">
          <div className="contact-form-copy">
            <span className="section-label">Enquire / Visit</span>
            <span className="eyebrow">A more considered way to live</span>
            <h2>Plan your visit to The Story House.</h2>
            <p>
              Share your details and the project team can help you explore the residences,
              amenities, connectivity and next steps.
            </p>
            <div className="contact-form-details">
              <div><span>Phone</span><a href={`tel:${site.phone}`}>{site.phone}</a></div>
              <div><span>Developer</span><strong>Arttech Elegant Homes LLP</strong></div>
              <div><span>Office</span><strong>{site.address}</strong></div>
            </div>
          </div>

          <div className="enquiry-card">
            <h3>Send an enquiry</h3>
            <p>We will get back to you with the requested project information.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Full name
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </label>
                <label>
                  Phone
                  <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                </label>
              </div>
              <label>
                Email
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
              </label>
              <label>
                Message
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="I’d like to know more about..." />
              </label>
              <button className="button button-dark" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send enquiry"} <span aria-hidden="true">↗</span>
              </button>
              {message && <p className="form-response">{message}</p>}
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
