"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserApiUrl } from "../../../../lib/api";

type Residence = {
  _id: string;
  title: string;
  location?: string;
  bhk?: string;
  unitType?: string;
  status?: string;
  carpetArea?: string;
  balconyArea?: string;
  superArea?: string;
  description?: string;
  floorPlan?: string;
  image?: string;
  images?: string[];
  amenities?: string[];
};

type FormState = {
  title: string;
  location: string;
  bhk: string;
  unitType: string;
  status: string;
  carpetArea: string;
  balconyArea: string;
  superArea: string;
  description: string;
  floorPlan: string;
  image: string;
  images: string[];
  amenities: string;
};

const bhkOptions = ["2 BHK", "3 BHK"];
const unitTypeOptions = ["Type 01", "Type 02"];
const statusOptions = ["Available", "Coming Soon", "Sold Out"];

const emptyForm: FormState = {
  title: "",
  location: "Sector 89A, Gurugram",
  bhk: "3 BHK",
  unitType: "Type 01",
  status: "Available",
  carpetArea: "",
  balconyArea: "",
  superArea: "",
  description: "",
  floorPlan: "",
  image: "",
  images: [],
  amenities: "",
};

export default function EditResidencePage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [form, setForm] = useState<FormState>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingFloorPlan, setUploadingFloorPlan] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [uploadingGallery, setUploadingGallery] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadResidence() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${getBrowserApiUrl()}/properties/${id}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load residence."
          );
        }

        const item: Residence =
          data.data || data.property;

        if (!item) {
          throw new Error("Residence not found.");
        }

        setForm({
          title: item.title || "",
          location:
            item.location ||
            "Sector 89A, Gurugram",
          bhk: item.bhk || "3 BHK",
          unitType:
            item.unitType || "Type 01",
          status:
            item.status || "Available",
          carpetArea: item.carpetArea || "",
          balconyArea:
            item.balconyArea || "",
          superArea: item.superArea || "",
          description:
            item.description || "",
          floorPlan:
            item.floorPlan || "",
          image: item.image || "",
          images: Array.isArray(item.images)
            ? item.images
            : [],
          amenities: Array.isArray(item.amenities)
            ? item.amenities.join(", ")
            : "",
        });
      } catch (loadError) {
        console.error(loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load residence."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadResidence();
  }, [id]);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function uploadFile(
    file: File,
    type: "floorPlan" | "image" | "gallery"
  ) {
    try {
      if (type === "floorPlan") {
        setUploadingFloorPlan(true);
      }

      if (type === "image") {
        setUploadingImage(true);
      }

      if (type === "gallery") {
        setUploadingGallery(true);
      }

      setError("");
      setMessage("");

      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await fetch(
        `${getBrowserApiUrl()}/upload/image`,
        {
          method: "POST",
          credentials: "include",
          body: uploadData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Image upload failed."
        );
      }

      const url = data.url || "";

      if (!url) {
        throw new Error(
          "Upload succeeded but no image URL was returned."
        );
      }

      if (type === "floorPlan") {
        setForm((current) => ({
          ...current,
          floorPlan: url,
        }));

        setMessage("Floor plan uploaded.");
      }

      if (type === "image") {
        setForm((current) => ({
          ...current,
          image: url,
        }));

        setMessage("Featured visual uploaded.");
      }

      if (type === "gallery") {
        setForm((current) => ({
          ...current,
          images: [...current.images, url],
        }));

        setMessage("Gallery image added.");
      }
    } catch (uploadError) {
      console.error(uploadError);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed."
      );
    } finally {
      setUploadingFloorPlan(false);
      setUploadingImage(false);
      setUploadingGallery(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        title: form.title.trim(),
        location: form.location.trim(),
        bhk: form.bhk,
        unitType: form.unitType,
        status: form.status,
        carpetArea: form.carpetArea.trim(),
        balconyArea: form.balconyArea.trim(),
        superArea: form.superArea.trim(),
        description: form.description.trim(),
        floorPlan: form.floorPlan,
        image: form.image,
        images: form.images,
        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch(
        `${getBrowserApiUrl()}/properties/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update residence."
        );
      }

      setMessage("Residence updated successfully.");

      setTimeout(() => {
        router.push("/admin/properties");
      }, 650);
    } catch (saveError) {
      console.error(saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update residence."
      );
    } finally {
      setSaving(false);
    }
  }

  function removeGalleryImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter(
        (_, currentIndex) => currentIndex !== index
      ),
    }));
  }

  if (loading) {
    return (
      <main className="edit-shell">
        <div className="edit-loading">
          Loading residence…
        </div>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="edit-shell">
        <div className="edit-error">
          <h1>Unable to load residence</h1>
          <p>{error}</p>

          <Link
            href="/admin/properties"
            className="button primary"
          >
            ← Back to Residences
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-shell">
      <div className="edit-wrap">
        <header className="edit-header">
          <Link
            href="/admin"
            className="back-link"
          >
            ← Dashboard
          </Link>

          <div className="brand-row">
            <img
              src="/brand/ym-realty-logo.png"
              alt="YM Realty"
              className="brand-logo"
            />

            <span className="divider" />

            <span className="page-name">
              Edit Residence
            </span>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="edit-card"
        >
          <section className="form-section">
            <div className="section-title">
              <span>01</span>
              <div>
                <h2>Residence information</h2>
                <p>
                  Core information shown for this
                  residence.
                </p>
              </div>
            </div>

            <div className="form-grid two">
              <label className="full">
                <span>Residence Title</span>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="3 BHK · Type 01"
                  required
                />
              </label>

              <label>
                <span>Location</span>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Status</span>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statusOptions.map(
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
              </label>

              <label>
                <span>BHK</span>

                <select
                  name="bhk"
                  value={form.bhk}
                  onChange={handleChange}
                >
                  {bhkOptions.map((bhk) => (
                    <option
                      key={bhk}
                      value={bhk}
                    >
                      {bhk}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Unit Type</span>

                <select
                  name="unitType"
                  value={form.unitType}
                  onChange={handleChange}
                >
                  {unitTypeOptions.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span>02</span>
              <div>
                <h2>Residence areas</h2>
                <p>
                  Use the approved project figures.
                </p>
              </div>
            </div>

            <div className="form-grid three">
              <label>
                <span>Carpet Area</span>

                <input
                  name="carpetArea"
                  value={form.carpetArea}
                  onChange={handleChange}
                  placeholder="1,018 sq.ft."
                  required
                />
              </label>

              <label>
                <span>Balcony Area</span>

                <input
                  name="balconyArea"
                  value={form.balconyArea}
                  onChange={handleChange}
                  placeholder="309 sq.ft."
                  required
                />
              </label>

              <label>
                <span>Super Area</span>

                <input
                  name="superArea"
                  value={form.superArea}
                  onChange={handleChange}
                  placeholder="1,785 sq.ft."
                  required
                />
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span>03</span>
              <div>
                <h2>Residence story</h2>
                <p>
                  Description used for the residence
                  content.
                </p>
              </div>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={7}
              placeholder="Describe the residence..."
              required
            />
          </section>

          <section className="form-section">
            <div className="section-title">
              <span>04</span>
              <div>
                <h2>Floor plan</h2>
                <p>
                  Replace the current floor plan when
                  required.
                </p>
              </div>
            </div>

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  if (file) {
                    void uploadFile(
                      file,
                      "floorPlan"
                    );
                  }
                }}
                disabled={uploadingFloorPlan}
              />

              {uploadingFloorPlan && (
                <small>
                  Uploading floor plan…
                </small>
              )}

              {form.floorPlan && (
                <div className="large-preview">
                  <img
                    src={form.floorPlan}
                    alt="Floor plan"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span>05</span>
              <div>
                <h2>Featured visual</h2>
                <p>
                  Main visual used for the residence
                  listing.
                </p>
              </div>
            </div>

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  if (file) {
                    void uploadFile(
                      file,
                      "image"
                    );
                  }
                }}
                disabled={uploadingImage}
              />

              {uploadingImage && (
                <small>
                  Uploading featured visual…
                </small>
              )}

              {form.image && (
                <div className="featured-preview">
                  <img
                    src={form.image}
                    alt="Featured visual"
                  />
                </div>
              )}
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span>06</span>
              <div>
                <h2>Gallery</h2>
                <p>
                  Manage additional residence visuals.
                </p>
              </div>
            </div>

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(
                    event.target.files || []
                  );

                  files.forEach((file) => {
                    void uploadFile(
                      file,
                      "gallery"
                    );
                  });

                  event.target.value = "";
                }}
                disabled={uploadingGallery}
              />

              {uploadingGallery && (
                <small>
                  Uploading gallery images…
                </small>
              )}

              {form.images.length > 0 && (
                <div className="gallery-grid">
                  {form.images.map(
                    (url, index) => (
                      <div
                        className="gallery-item"
                        key={`${url}-${index}`}
                      >
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeGalleryImage(
                              index
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="form-section">
            <div className="section-title">
              <span>07</span>
              <div>
                <h2>Amenities</h2>
                <p>
                  Separate multiple items with commas.
                </p>
              </div>
            </div>

            <input
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              placeholder="Fitness Centre, Yoga & Wellness, Indoor Swimming Pool"
            />
          </section>

          {(error || message) && (
            <div
              className={
                error
                  ? "feedback error"
                  : "feedback success"
              }
            >
              {error || `✓ ${message}`}
            </div>
          )}

          <div className="form-footer">
            <Link
              href="/admin/properties"
              className="button secondary"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="button primary"
              disabled={saving}
            >
              {saving
                ? "Saving changes…"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .edit-shell {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 82% 0%,
              rgba(194, 164, 107, 0.09),
              transparent 24%
            ),
            #f3f1ec;
          color: #191a18;
          padding: 0 0 60px;
        }

        .edit-wrap {
          width: 100%;
          margin: 0;
        }

        .edit-header {
          min-height: 74px;
          padding: 0 34px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          column-gap: 26px;
          border-bottom: 1px solid #dedbd5;
          background: rgba(
            250,
            249,
            246,
            0.97
          );
        }

        .back-link {
          justify-self: start;
          color: #827d74;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
        }

        .brand-row {
          justify-self: start;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-logo {
          width: 104px;
          height: auto;
          display: block;
        }

        .divider {
          width: 1px;
          height: 20px;
          background: #d6d1c8;
        }

        .page-name {
          color: #252623;
          font-size: 11px;
          font-weight: 700;
        }

        .button {
          min-height: 40px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font: inherit;
          font-size: 11px;
          text-decoration: none;
          cursor: pointer;
        }

        .button.primary {
          background: #1c1b19;
          color: #fffdf8;
          border: 1px solid #1c1b19;
        }

        .button.secondary {
          color: #1c1b19;
          background: transparent;
          border: 1px solid
            rgba(28, 27, 25, 0.15);
        }

        .edit-card {
          width: min(
            1120px,
            calc(100% - 48px)
          );
          margin: 20px auto 0;
          background: #fffdf8;
          border: 1px solid
            rgba(28, 27, 25, 0.09);
        }

        .form-section {
          padding: 27px;
          border-bottom: 1px solid
            rgba(28, 27, 25, 0.08);
        }

        .section-title {
          display: flex;
          gap: 15px;
          margin-bottom: 21px;
        }

        .section-title > span {
          color: #a18459;
          font-size: 10px;
          letter-spacing: 0.15em;
        }

        .section-title h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 24px;
          font-weight: 500;
        }

        .section-title p {
          margin: 6px 0 0;
          color: #877b6d;
          font-size: 11px;
        }

        .form-grid {
          display: grid;
          gap: 18px;
        }

        .form-grid.two {
          grid-template-columns: 1fr 1fr;
        }

        .form-grid.three {
          grid-template-columns: repeat(3, 1fr);
        }

        .form-grid .full {
          grid-column: 1 / -1;
        }

        label > span {
          display: block;
          margin-bottom: 7px;
          color: #6e6356;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid
            rgba(28, 27, 25, 0.14);
          background: #fff;
          color: #1c1b19;
          padding: 12px 13px;
          outline: 0;
          font: inherit;
          font-size: 12px;
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #b99a68;
        }

        .upload-box {
          padding: 18px;
          border: 1px dashed
            rgba(28, 27, 25, 0.18);
          background: #f7f2e9;
        }

        .upload-box input[type="file"] {
          border: 0;
          background: transparent;
          padding: 0;
        }

        .upload-box small {
          display: block;
          margin-top: 9px;
          color: #967747;
          font-size: 10px;
        }

        .large-preview {
          margin-top: 17px;
          padding: 10px;
          background: #fff;
        }

        .large-preview img {
          width: 100%;
          max-height: 390px;
          display: block;
          object-fit: contain;
        }

        .featured-preview {
          margin-top: 17px;
          max-width: 560px;
        }

        .featured-preview img {
          width: 100%;
          max-height: 300px;
          display: block;
          object-fit: cover;
        }

        .gallery-grid {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .gallery-item {
          position: relative;
          background: #fff;
          border: 1px solid
            rgba(28, 27, 25, 0.09);
        }

        .gallery-item img {
          width: 100%;
          aspect-ratio: 1.2;
          display: block;
          object-fit: cover;
        }

        .gallery-item button {
          width: 100%;
          border: 0;
          border-top: 1px solid
            rgba(28, 27, 25, 0.08);
          background: #f6e8e4;
          color: #783f36;
          padding: 7px;
          cursor: pointer;
          font: inherit;
          font-size: 9px;
        }

        .feedback {
          margin: 18px 27px 0;
          padding: 11px 13px;
          font-size: 11px;
        }

        .feedback.success {
          background: #e8efe9;
          color: #526759;
        }

        .feedback.error {
          background: #f6e8e4;
          color: #783f36;
        }

        .form-footer {
          padding: 20px 27px;
          display: flex;
          justify-content: flex-end;
          gap: 9px;
        }

        .edit-loading,
        .edit-error {
          width: min(700px, 100%);
          margin: 120px auto;
          padding: 40px;
          text-align: center;
          background: #fffdf8;
          border: 1px solid
            rgba(28, 27, 25, 0.09);
        }

        .edit-error h1 {
          margin: 0 0 8px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-weight: 500;
        }

        .edit-error p {
          color: #7f7467;
          font-size: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 760px) {
          .edit-shell {
            padding: 0 0 45px;
          }

          .edit-header {
            padding: 0 20px;
          }

          .edit-card {
            width: calc(100% - 28px);
          }

          .form-grid.two,
          .form-grid.three {
            grid-template-columns: 1fr;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-section {
            padding: 21px 18px;
          }

          .feedback {
            margin-left: 18px;
            margin-right: 18px;
          }

          .form-footer {
            padding-left: 18px;
            padding-right: 18px;
          }
        }
      `}</style>
    </main>
  );
}
