/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";
import { getBrowserApiUrl } from "../../../lib/api";

const API_URL = getBrowserApiUrl();

const bhkOptions = ["2 BHK", "3 BHK"];
const unitTypeOptions = ["Type 01", "Type 02"];

const statusOptions = [
  "Available",
  "Coming Soon",
  "Sold Out",
];

export default function NewPropertyPage() {
  const [form, setForm] = useState({
    title: "",
    location: "Sector 89A, Gurugram",
    bhk: "3 BHK",
    unitType: "Type 01",
    carpetArea: "",
    balconyArea: "",
    superArea: "",
    status: "Available",
    description: "",
    floorPlan: "",
    image: "",
    images: "",
    amenities: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);
  const [uploadingFloorPlan, setUploadingFloorPlan] =
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

  const uploadFile = async (file: File) => {
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

  const handleMainImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setError("");
      setMessage("");
      setUploadingImage(true);

      const imageUrl = await uploadFile(file);

      setForm((prev) => ({
        ...prev,
        image: imageUrl,
      }));

      setMessage("Featured residence image uploaded.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Featured image upload failed"
      );
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleFloorPlanUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setError("");
      setMessage("");
      setUploadingFloorPlan(true);

      const imageUrl = await uploadFile(file);

      setForm((prev) => ({
        ...prev,
        floorPlan: imageUrl,
      }));

      setMessage("Floor plan uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Floor plan upload failed"
      );
    } finally {
      setUploadingFloorPlan(false);
      e.target.value = "";
    }
  };

  const handleAdditionalImagesUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    try {
      setError("");
      setMessage("");
      setUploadingAdditionalImages(true);

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const imageUrl = await uploadFile(file);
        uploadedUrls.push(imageUrl);
      }

      setForm((prev) => {
        const existingImages = prev.images
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean);

        return {
          ...prev,
          images: [
            ...existingImages,
            ...uploadedUrls,
          ].join(", "),
        };
      });

      setMessage(
        `${uploadedUrls.length} gallery image${
          uploadedUrls.length > 1 ? "s" : ""
        } uploaded successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gallery image upload failed"
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
      if (!form.title.trim()) {
        throw new Error("Residence title is required.");
      }

      if (!form.floorPlan) {
        throw new Error("Please upload the floor plan.");
      }

      if (!form.image) {
        throw new Error(
          "Please upload a featured residence image."
        );
      }

      if (!form.carpetArea.trim()) {
        throw new Error("Carpet area is required.");
      }

      if (!form.balconyArea.trim()) {
        throw new Error("Balcony area is required.");
      }

      if (!form.superArea.trim()) {
        throw new Error("Super area is required.");
      }

      if (!form.description.trim()) {
        throw new Error("Residence description is required.");
      }

      const imageList = form.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      const amenityList = form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const beds = form.bhk === "3 BHK" ? 3 : 2;

      const res = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          location: form.location.trim(),
          bhk: form.bhk,
          unitType: form.unitType,
          carpetArea: form.carpetArea.trim(),
          balconyArea: form.balconyArea.trim(),
          superArea: form.superArea.trim(),
          floorPlan: form.floorPlan,
          status: form.status,
          description: form.description.trim(),
          image: form.image,
          images: imageList,
          amenities: amenityList,

          // Legacy compatibility
          price: "",
          type: "Residence",
          beds,
          baths: 0,
          area: form.superArea.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create residence"
        );
      }

      setMessage("Residence created successfully.");

      setForm({
        title: "",
        location: "Sector 89A, Gurugram",
        bhk: "3 BHK",
        unitType: "Type 01",
        carpetArea: "",
        balconyArea: "",
        superArea: "",
        status: "Available",
        description: "",
        floorPlan: "",
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

  const isUploading =
    uploadingImage ||
    uploadingFloorPlan ||
    uploadingAdditionalImages;

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#1c1b19]">
      <header className="border-b border-[#dedbd5] bg-[rgba(250,249,246,0.97)]">
        <div className="flex min-h-[74px] items-center gap-[26px] px-[34px]">
          <a
            href="/admin"
            className="shrink-0 text-[10px] font-bold text-[#827d74] no-underline"
          >
            ← Dashboard
          </a>

          <div className="flex items-center gap-[13px]">
            <img
              src="/brand/ym-realty-logo.png"
              alt="YM Realty"
              className="block w-[104px] h-auto"
            />

            <span className="h-[20px] w-px bg-[#d6d1c8]" />

            <span className="text-[11px] font-bold text-[#252623]">
              Add Residence
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
            Residence Management
          </span>

          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            Add a new residence
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
            Create a 2 BHK or 3 BHK residence with its
            floor plan, areas, featured visual and gallery.
          </p>
        </div>

        <div className="border border-black/10 bg-[#fffdf8] shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-0"
          >
            {/* BASIC INFORMATION */}
            <div className="border-b border-black/10 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
                  01
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  Residence information
                </h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Residence Title
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="3 BHK · Type 01"
                    required
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
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
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Residence Type
                  </label>

                  <select
                    name="bhk"
                    value={form.bhk}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
                  >
                    {bhkOptions.map((bhk) => (
                      <option key={bhk} value={bhk}>
                        {bhk}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Unit Type
                  </label>

                  <select
                    name="unitType"
                    value={form.unitType}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
                  >
                    {unitTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* AREAS */}
            <div className="border-b border-black/10 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
                  02
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  Residence areas
                </h3>

                <p className="mt-2 text-sm text-black/50">
                  Enter the area figures exactly as they
                  appear in the approved project material.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Carpet Area
                  </label>

                  <input
                    name="carpetArea"
                    value={form.carpetArea}
                    onChange={handleChange}
                    placeholder="1,018 sq.ft."
                    required
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Balcony Area
                  </label>

                  <input
                    name="balconyArea"
                    value={form.balconyArea}
                    onChange={handleChange}
                    placeholder="309 sq.ft."
                    required
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Super Area
                  </label>

                  <input
                    name="superArea"
                    value={form.superArea}
                    onChange={handleChange}
                    placeholder="1,785 sq.ft."
                    required
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="border-b border-black/10 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
                  03
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  Residence story
                </h3>
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={7}
                placeholder="Describe the residence, its planning, light, space, privacy and other relevant features..."
                required
                className="w-full resize-y border border-black/15 bg-white px-4 py-3 leading-6 outline-none transition focus:border-[#c7a269]"
              />
            </div>

            {/* FLOOR PLAN */}
            <div className="border-b border-black/10 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
                  04
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  Floor plan
                </h3>

                <p className="mt-2 text-sm text-black/50">
                  Upload the floor plan image for this
                  residence type.
                </p>
              </div>

              <div className="border border-dashed border-black/20 bg-[#f7f2e9] p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFloorPlanUpload}
                  disabled={uploadingFloorPlan}
                  className="block w-full cursor-pointer text-sm"
                />

                {uploadingFloorPlan && (
                  <p className="mt-4 text-sm font-semibold text-[#9b7a45]">
                    Uploading floor plan...
                  </p>
                )}

                {form.floorPlan && (
                  <div className="mt-5">
                    <img
                      src={form.floorPlan}
                      alt="Floor plan preview"
                      className="max-h-[420px] w-full object-contain bg-white"
                    />

                    <p className="mt-2 text-xs text-black/40">
                      Floor plan uploaded successfully.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FEATURED IMAGE */}
            <div className="border-b border-black/10 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
                  05
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  Featured visual
                </h3>

                <p className="mt-2 text-sm text-black/50">
                  This image represents the residence in
                  the Admin listings.
                </p>
              </div>

              <div className="border border-dashed border-black/20 bg-[#f7f2e9] p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  disabled={uploadingImage}
                  className="block w-full cursor-pointer text-sm"
                />

                {uploadingImage && (
                  <p className="mt-4 text-sm font-semibold text-[#9b7a45]">
                    Uploading featured image...
                  </p>
                )}

                {form.image && (
                  <div className="mt-5">
                    <img
                      src={form.image}
                      alt="Featured residence preview"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* GALLERY */}
            <div className="border-b border-black/10 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
                  06
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  Gallery images
                </h3>

                <p className="mt-2 text-sm text-black/50">
                  Add additional visuals for this residence.
                </p>
              </div>

              <div className="border border-dashed border-black/20 bg-[#f7f2e9] p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesUpload}
                  disabled={uploadingAdditionalImages}
                  className="block w-full cursor-pointer text-sm"
                />

                {uploadingAdditionalImages && (
                  <p className="mt-4 text-sm font-semibold text-[#9b7a45]">
                    Uploading gallery images...
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
                          alt={`Residence gallery ${index + 1}`}
                          className="h-36 w-full object-cover"
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* AMENITIES */}
            <div className="border-b border-black/10 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7a45]">
                  07
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  Amenities
                </h3>
              </div>

              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="Fitness Centre, Yoga & Wellness, Indoor Swimming Pool"
                className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#c7a269]"
              />

              <p className="mt-2 text-xs text-black/40">
                Separate multiple amenities with commas.
              </p>
            </div>

            {/* MESSAGES + SUBMIT */}
            <div className="p-6 md:p-8">
              {message && (
                <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  ✓ {message}
                </div>
              )}

              {error && (
                <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <a
                  href="/admin"
                  className="border border-black/15 px-6 py-3 text-center text-sm font-semibold transition hover:border-[#c7a269]"
                >
                  Cancel
                </a>

                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="bg-[#1c1b19] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#36322b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creating Residence..."
                    : "Create Residence"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
