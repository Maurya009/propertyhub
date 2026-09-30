"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBrowserApiUrl } from "../../../../lib/api";

const API_URL = getBrowserApiUrl();

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "Apartment",
    status: "Ready to Move",
    beds: "",
    baths: "",
    area: "",
    description: "",
    image: "",
    images: "",
    amenities: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_URL}/properties/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Property not found");
        }

        const property = data.data;

        setForm({
          title: property.title || "",
          location: property.location || "",
          price: property.price || "",
          type: property.type || "Apartment",
          status: property.status || "Ready to Move",
          beds: String(property.beds ?? ""),
          baths: String(property.baths ?? ""),
          area: property.area || "",
          description: property.description || "",
          image: property.image || "",
          images: property.images?.join(", ") || "",
          amenities: property.amenities?.join(", ") || "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load property"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        title: form.title,
        location: form.location,
        price: form.price,
        type: form.type,
        status: form.status,
        beds: Number(form.beds),
        baths: Number(form.baths),
        area: form.area,
        description: form.description,
        image: form.image,
        images: form.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const res = await fetch(`${API_URL}/properties/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update property");
      }

      setMessage("Property updated successfully!");

      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f2e8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#d9c7a2] border-t-[#8f6b2f]" />
          <p className="text-sm font-medium text-[#756d61]">
            Loading property...
          </p>
        </div>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f2e8] px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#e5d9c5] bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-bold text-red-600">
            Property not found
          </h1>

          <p className="mt-2 text-sm text-[#756d61]">{error}</p>

          <button
            onClick={() => router.push("/admin")}
            className="mt-6 rounded-xl bg-[#30271f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#473b30]"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#30271f]">
      {/* Header */}
      <header className="border-b border-[#e7dcc9] bg-[#fffdf9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Image
              src="/images/ym-realty-logo.png"
              alt="YM Realty"
              width={110}
              height={70}
              priority
              className="h-14 w-auto object-contain"
            />

            <div className="hidden h-10 w-px bg-[#e2d6c2] sm:block" />

            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#30271f]">
                Edit Property
              </h1>

              <p className="text-xs text-[#8b8173]">
                Property Management
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-xl border border-[#e1d5c1] bg-white px-4 py-2.5 text-sm font-semibold text-[#30271f] shadow-sm transition hover:bg-[#faf6ef]"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
        {/* Page Heading */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-[3px] w-12 rounded-full bg-[#b58a3a]" />

            <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#a47a32]">
              Property Management
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#30271f] sm:text-4xl">
            Edit Property
          </h2>

          <p className="mt-2 text-sm text-[#82786b] sm:text-base">
            Update property information and save your changes.
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-3xl border border-[#e4d8c5] bg-white shadow-[0_20px_60px_rgba(80,60,30,0.08)]">
          {/* Card Header */}
          <div className="border-b border-[#eadfce] bg-[#fbf7ef] px-6 py-5 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e3c8] text-[#a47a32]">
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#30271f]">
                  Property Information
                </h3>

                <p className="mt-1 text-sm text-[#8b8173]">
                  Update complete details of the property listing.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Basic Information */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Property Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Premium 3 BHK Villa"
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="Sector 150, Noida"
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Price
                </label>

                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="₹1.25 Crore"
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Property Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                >
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Plot</option>
                  <option>House</option>
                  <option>Commercial</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                >
                  <option>Ready to Move</option>
                  <option>Under Construction</option>
                  <option>New Launch</option>
                  <option>Sold</option>
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Area
                </label>

                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  required
                  placeholder="1,850 sq.ft"
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Bedrooms
                </label>

                <input
                  name="beds"
                  type="number"
                  min="0"
                  value={form.beds}
                  onChange={handleChange}
                  required
                  placeholder="3"
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                  Bathrooms
                </label>

                <input
                  name="baths"
                  type="number"
                  min="0"
                  value={form.baths}
                  onChange={handleChange}
                  required
                  placeholder="3"
                  className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                Description
              </label>

              <textarea
                name="description"
                rows={6}
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe the property..."
                className="w-full resize-none rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
              />
            </div>

            {/* Main Image */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                Main Image URL
              </label>

              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                required
                placeholder="https://example.com/property-image.jpg"
                className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
              />
            </div>

            {/* Additional Images */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                Additional Image URLs
              </label>

              <textarea
                name="images"
                rows={3}
                value={form.images}
                onChange={handleChange}
                placeholder="URL 1, URL 2, URL 3"
                className="w-full resize-none rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
              />

              <p className="mt-2 text-xs text-[#8b8173]">
                Separate multiple image URLs using commas.
              </p>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-[#40372e]">
                Amenities
              </label>

              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="Parking, Lift, Security, Garden"
                className="w-full rounded-xl border border-[#dfd3c0] bg-[#fffdfa] px-4 py-3.5 text-sm text-[#30271f] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
              />

              <p className="mt-2 text-xs text-[#8b8173]">
                Separate amenities using commas.
              </p>
            </div>

            {/* Messages */}
            {message && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                ✓ {message}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
                ✕ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 border-t border-[#eadfce] pt-6 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-[#30271f] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#473b30] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-xl border border-[#dfd3c0] bg-white px-6 py-3.5 text-sm font-semibold text-[#40372e] transition hover:bg-[#faf6ef]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}