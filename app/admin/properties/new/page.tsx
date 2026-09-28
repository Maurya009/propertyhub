/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-location-assign-relative-destination */
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  const [uploadingMainImage, setUploadingMainImage] =
    useState(false);
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
      throw new Error(
        data.message || "Image upload failed"
      );
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
        err instanceof Error
          ? err.message
          : "Main image upload failed"
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

        const allImages = [
          ...existingImages,
          ...uploadedUrls,
        ];

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
        throw new Error(
          "Please upload a main property image"
        );
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
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              PROPERTY
              <span className="text-amber-500">
                HUB
              </span>
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add New Property
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Back to Dashboard
          </a>
        </div>
      </header>

      {/* FORM */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              Property Information
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the details of the property you want
              to list.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* TITLE + LOCATION */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Property Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Premium 3 BHK Villa"
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
                  placeholder="Sector 150, Noida"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* PRICE + TYPE + STATUS */}
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price
                </label>

                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="₹1.25 Crore"
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
                  {propertyTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
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
                  {propertyStatuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* BEDS + BATHS + AREA */}
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold">
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Area
                </label>

                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="1,850 sq.ft"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the property..."
                required
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />
            </div>

            {/* MAIN IMAGE */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Main Property Image
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  disabled={uploadingMainImage}
                  className="block w-full cursor-pointer text-sm text-slate-600"
                />

                <p className="mt-2 text-xs text-slate-400">
                  JPG, PNG, WEBP • Maximum 5MB
                </p>

                {uploadingMainImage && (
                  <p className="mt-3 text-sm font-semibold text-amber-600">
                    Uploading main image...
                  </p>
                )}

                {form.image && (
                  <div className="mt-5">
                    <img
                      src={form.image}
                      alt="Main property preview"
                      className="mx-auto h-48 w-full max-w-md rounded-xl object-cover"
                    />

                    <p className="mt-2 break-all text-xs text-slate-400">
                      Image uploaded successfully
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ADDITIONAL IMAGES */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Additional Property Images
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesUpload}
                  disabled={uploadingAdditionalImages}
                  className="block w-full cursor-pointer text-sm text-slate-600"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Multiple images select kar sakte ho •
                  Maximum 5MB per image
                </p>

                {uploadingAdditionalImages && (
                  <p className="mt-3 text-sm font-semibold text-amber-600">
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
                          alt={`Property image ${
                            index + 1
                          }`}
                          className="h-32 w-full rounded-xl object-cover"
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* AMENITIES */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Amenities
              </label>

              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="Parking, Lift, Security, Gym"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"
              />

              <p className="mt-2 text-xs text-slate-400">
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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  loading ||
                  uploadingMainImage ||
                  uploadingAdditionalImages
                }
                className="rounded-xl bg-slate-950 px-7 py-3.5 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Property..."
                  : "Add Property"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}