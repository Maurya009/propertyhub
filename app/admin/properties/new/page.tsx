/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-location-assign-relative-destination */
"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { getBrowserApiUrl } from "../../../lib/api";

const API_URL = getBrowserApiUrl();

const propertyTypes = [
  "Apartment",
  "Villa",
  "Plot",
  "House",
  "Commercial",
];

const propertyStatuses = [
  "Ready to Move",
  "Under Construction",
  "New Launch",
  "Sold",
];

export default function NewPropertyPage() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "Apartment",
    beds: "",
    baths: "",
    area: "",
    status: "Ready to Move",
    description: "",
    image: "",
    images: "",
    amenities: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingAdditionalImages, setUploadingAdditionalImages] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  // Upload single image to Cloudinary
  const uploadImage = async (file: File) => {
    const formData = new FormData();

    formData.append("image", file);

    const res = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (res.status === 401) {
      window.location.href = "/admin/login";
      throw new Error("Please login again");
    }

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Image upload failed");
    }

    return data.data.url;
  };

  // Main image upload
  const handleMainImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setError("");
      setMessage("");
      setUploadingMainImage(true);

      const imageUrl = await uploadImage(file);

      setForm((prev) => ({
        ...prev,
        image: imageUrl,
      }));

      setMessage("Main image uploaded successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Main image upload failed"
      );
    } finally {
      setUploadingMainImage(false);
      e.target.value = "";
    }
  };

  // Additional images upload
  const handleAdditionalImagesUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    try {
      setError("");
      setMessage("");
      setUploadingAdditionalImages(true);

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const imageUrl = await uploadImage(file);
        uploadedUrls.push(imageUrl);
      }

      setForm((prev) => {
        const existingImages = prev.images
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean);

        const allImages = [...existingImages, ...uploadedUrls];

        return {
          ...prev,
          images: allImages.join(", "),
        };
      });

      setMessage(
        `${uploadedUrls.length} additional image${
          uploadedUrls.length > 1 ? "s" : ""
        } uploaded successfully!`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Additional image upload failed"
      );
    } finally {
      setUploadingAdditionalImages(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!form.image) {
        throw new Error("Please upload a main property image");
      }

      const imageList = form.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      const amenityList = form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          location: form.location,
          price: form.price,
          type: form.type,
          beds: Number(form.beds),
          baths: Number(form.baths),
          area: form.area,
          status: form.status,
          description: form.description,
          image: form.image,
          images: imageList,
          amenities: amenityList,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create property"
        );
      }

      setMessage("Property created successfully!");

      setForm({
        title: "",
        location: "",
        price: "",
        type: "Apartment",
        beds: "",
        baths: "",
        area: "",
        status: "Ready to Move",
        description: "",
        image: "",
        images: "",
        amenities: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f0e6] text-[#2f261d]">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 border-b border-[#dfd1ba] bg-[#fffdf9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">

          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="flex items-center"
              aria-label="YM Realty Admin"
            >
              <Image
                src="/images/ym-realty-logo.png"
                alt="YM Realty"
                width={150}
                height={75}
                priority
                className="h-14 w-auto object-contain"
              />
            </a>

            <div className="hidden border-l border-[#dfd1ba] pl-4 sm:block">
              <p className="text-sm font-semibold text-[#2f261d]">
                Add New Property
              </p>
              <p className="text-xs text-[#8d8172]">
                Property Management
              </p>
            </div>
          </div>

          <a
            href="/admin"
            className="rounded-xl border border-[#d9c9ae] bg-white px-4 py-2.5 text-sm font-semibold text-[#3a3026] shadow-sm transition hover:border-[#b58a3a] hover:bg-[#faf6ee]"
          >
            ← Back to Dashboard
          </a>
        </div>
      </header>

      {/* ================= PAGE HEADER ================= */}
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-8 sm:px-6">

        <div className="mb-2 flex items-center gap-3">
          <span className="h-[3px] w-12 rounded-full bg-[#b58a3a]" />

          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#a47b32]">
            Property Management
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#2f261d] sm:text-4xl">
          Add New Property
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#85796b] sm:text-base">
          Add property details, images and amenities to publish a new
          listing on YM Realty.
        </p>
      </section>

      {/* ================= FORM ================= */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-6 sm:px-6">

        <div className="overflow-hidden rounded-3xl border border-[#dfd1ba] bg-[#fffdf9] shadow-[0_20px_60px_rgba(74,55,30,0.08)]">

          {/* CARD TOP */}
          <div className="border-b border-[#eadfce] bg-[#fbf7ef] px-6 py-6 sm:px-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eee1c9] text-[#9c712c]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2f261d]">
                  Property Information
                </h2>

                <p className="mt-1 text-sm text-[#8a7d6e]">
                  Enter complete details of the property you want to list.
                </p>
              </div>

            </div>
          </div>

          <div className="p-6 sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* TITLE + LOCATION */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Property Title
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Premium 3 BHK Villa"
                    required
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Location
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Sector 150, Noida"
                    required
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  />
                </div>

              </div>

              {/* PRICE + TYPE + STATUS */}
              <div className="grid gap-6 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Price
                  </label>

                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="₹1.25 Crore"
                    required
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Property Type
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  >
                    {propertyStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* BEDS + BATHS + AREA */}
              <div className="grid gap-6 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Bedrooms
                  </label>

                  <input
                    type="number"
                    name="beds"
                    value={form.beds}
                    onChange={handleChange}
                    placeholder="3"
                    min="0"
                    required
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Bathrooms
                  </label>

                  <input
                    type="number"
                    name="baths"
                    value={form.baths}
                    onChange={handleChange}
                    placeholder="2"
                    min="0"
                    required
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                    Area
                  </label>

                  <input
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="1,850 sq.ft"
                    required
                    className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                  />
                </div>

              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the property..."
                  required
                  className="w-full resize-none rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />
              </div>

              {/* MAIN IMAGE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                  Main Property Image
                </label>

                <div className="rounded-2xl border-2 border-dashed border-[#d9c9ae] bg-[#fbf8f1] p-6 text-center transition hover:border-[#b58a3a]">

                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eee1c9] text-[#a47b32]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    disabled={uploadingMainImage}
                    className="mx-auto block w-full max-w-md cursor-pointer text-sm text-[#665b50]"
                  />

                  <p className="mt-2 text-xs text-[#9b9084]">
                    JPG, PNG, WEBP • Maximum 5MB
                  </p>

                  {uploadingMainImage && (
                    <p className="mt-3 text-sm font-semibold text-[#a47b32]">
                      Uploading main image...
                    </p>
                  )}

                  {form.image && (
                    <div className="mt-5">
                      <img
                        src={form.image}
                        alt="Main property preview"
                        className="mx-auto h-56 w-full max-w-lg rounded-2xl object-cover shadow-md"
                      />

                      <p className="mt-2 text-xs font-medium text-green-600">
                        ✓ Image uploaded successfully
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* ADDITIONAL IMAGES */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                  Additional Property Images
                </label>

                <div className="rounded-2xl border-2 border-dashed border-[#d9c9ae] bg-[#fbf8f1] p-6">

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    disabled={uploadingAdditionalImages}
                    className="block w-full cursor-pointer text-sm text-[#665b50]"
                  />

                  <p className="mt-2 text-xs text-[#9b9084]">
                    Multiple images select kar sakte ho • Maximum 5MB per
                    image
                  </p>

                  {uploadingAdditionalImages && (
                    <p className="mt-3 text-sm font-semibold text-[#a47b32]">
                      Uploading additional images...
                    </p>
                  )}

                  {form.images && (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {form.images
                        .split(",")
                        .map((url) => url.trim())
                        .filter(Boolean)
                        .map((url, index) => (
                          <img
                            key={`${url}-${index}`}
                            src={url}
                            alt={`Property image ${index + 1}`}
                            className="h-32 w-full rounded-xl object-cover shadow-sm"
                          />
                        ))}
                    </div>
                  )}

                </div>
              </div>

              {/* AMENITIES */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#3a3026]">
                  Amenities
                </label>

                <input
                  name="amenities"
                  value={form.amenities}
                  onChange={handleChange}
                  placeholder="Parking, Lift, Security, Gym"
                  className="w-full rounded-xl border border-[#ddd0bc] bg-white px-4 py-3 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa093] focus:border-[#b58a3a] focus:ring-4 focus:ring-[#b58a3a]/10"
                />

                <p className="mt-2 text-xs text-[#9b9084]">
                  Amenities comma se separate karo.
                </p>
              </div>

              {/* MESSAGE */}
              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                  ✅ {message}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  ❌ {error}
                </div>
              )}

              {/* SUBMIT */}
              <div className="flex flex-col gap-3 border-t border-[#eadfce] pt-7 sm:flex-row sm:justify-end">

                <a
                  href="/admin"
                  className="rounded-xl border border-[#d9c9ae] bg-white px-7 py-3.5 text-center text-sm font-semibold text-[#4a4035] transition hover:bg-[#faf6ee]"
                >
                  Cancel
                </a>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingMainImage ||
                    uploadingAdditionalImages
                  }
                  className="rounded-xl bg-[#2f261d] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2f261d]/10 transition hover:bg-[#40352a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating Property..."
                    : "Add Property"}
                </button>

              </div>

            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#dfd1ba] bg-[#f1e9dc] py-5 text-center">
        <p className="text-xs text-[#8f8272]">
          © {new Date().getFullYear()} YM Realty · Property Management
        </p>
      </footer>

    </main>
  );
}