"use client";

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
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-slate-600">
          Loading property...
        </p>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-red-600">
            Property not found
          </h1>

          <p className="mt-2 text-slate-500">{error}</p>

          <button
            onClick={() => router.push("/admin")}
            className="mt-6 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              PROPERTY<span className="text-amber-500">HUB</span>
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Edit Property
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold">Edit Property</h2>

          <p className="mt-2 text-sm text-slate-500">
            Update property information and save your changes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Property Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price
                </label>

                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Property Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
                >
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Plot</option>
                  <option>House</option>
                  <option>Commercial</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
                >
                  <option>Ready to Move</option>
                  <option>Under Construction</option>
                  <option>New Launch</option>
                  <option>Sold</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Area
                </label>

                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Bedrooms
                </label>

                <input
                  name="beds"
                  type="number"
                  min="0"
                  value={form.beds}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Bathrooms
                </label>

                <input
                  name="baths"
                  type="number"
                  min="0"
                  value={form.baths}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                name="description"
                rows={6}
                value={form.description}
                onChange={handleChange}
                required
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Main Image URL
              </label>

              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Additional Image URLs
              </label>

              <textarea
                name="images"
                rows={3}
                value={form.images}
                onChange={handleChange}
                placeholder="URL 1, URL 2, URL 3"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />

              <p className="mt-1 text-xs text-slate-500">
                Separate multiple URLs using commas.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Amenities
              </label>

              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="Parking, Lift, Security, Garden"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />

              <p className="mt-1 text-xs text-slate-500">
                Separate amenities using commas.
              </p>
            </div>

            {message && (
              <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                ✅ {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                ❌ {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-xl border border-slate-200 px-6 py-3.5 font-semibold hover:bg-slate-50"
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