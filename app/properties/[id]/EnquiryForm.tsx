"use client";

import { useState } from "react";
import { getBrowserApiUrl } from "../../lib/api";

type EnquiryFormProps = {
  propertyId: string;
};

const API_URL = getBrowserApiUrl();

export default function EnquiryForm({ propertyId }: EnquiryFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!name || !phone || !email) {
      setStatus("error");
      setErrorMsg("Please fill in your name, phone and email.");
      return;
    }

    try {
      setStatus("loading");
      setErrorMsg("");

      const res = await fetch(`${API_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          name,
          phone,
          email,
          message,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Something went wrong");
      }

      setStatus("success");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Could not send enquiry"
      );
    }
  };

  if (status === "success") {
    return (
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <p className="font-semibold text-green-700">
          ✅ Enquiry sent successfully!
        </p>
        <p className="mt-1 text-sm text-green-600">
          Our property expert will contact you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-green-700 underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
      />

      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
      />

      <textarea
        rows={4}
        placeholder="I am interested in this property..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
      />

      {status === "error" && (
        <p className="text-sm font-medium text-red-600">{errorMsg}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={status === "loading"}
        className="w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Enquiry"}
      </button>
    </div>
  );
}