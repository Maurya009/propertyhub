"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../../lib/api";

type Amenity = {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  publicId?: string;
  order: number;
  featured: boolean;
  active: boolean;
};

type AmenityForm = {
  title: string;
  description: string;
  imageUrl: string;
  publicId: string;
  order: string;
  featured: boolean;
  active: boolean;
};

const emptyForm: AmenityForm = {
  title: "",
  description: "",
  imageUrl: "",
  publicId: "",
  order: "0",
  featured: false,
  active: true,
};

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [form, setForm] = useState<AmenityForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAmenities() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${getBrowserApiUrl()}/amenities`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to load amenities."
        );
      }

      setAmenities(
        Array.isArray(data.data) ? data.data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load amenities."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAmenities();
  }, []);

  function updateForm(
    field: keyof AmenityForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function startAdd() {
    setForm({
      ...emptyForm,
      order: String(amenities.length + 1),
    });
    setEditingId(null);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function startEdit(item: Amenity) {
    setForm({
      title: item.title || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      publicId: item.publicId || "",
      order: String(item.order ?? 0),
      featured: Boolean(item.featured),
      active: Boolean(item.active),
    });

    setEditingId(item._id);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${getBrowserApiUrl()}/upload/image`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to upload image."
        );
      }

      setForm((current) => ({
        ...current,
        imageUrl: data.data?.url || "",
        publicId: data.data?.publicId || "",
      }));

      setMessage("Image uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Amenity title is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        publicId: form.publicId.trim(),
        order: Number(form.order) || 0,
        featured: form.featured,
        active: form.active,
      };

      const url = editingId
        ? `${getBrowserApiUrl()}/amenities/${editingId}`
        : `${getBrowserApiUrl()}/amenities`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to save amenity."
        );
      }

      setMessage(
        editingId
          ? "Amenity updated successfully."
          : "Amenity created successfully."
      );

      resetForm();
      await loadAmenities();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save amenity."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAmenity(id: string) {
    const confirmed = window.confirm(
      "Delete this amenity?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${getBrowserApiUrl()}/amenities/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to delete amenity."
        );
      }

      setAmenities((current) =>
        current.filter((item) => item._id !== id)
      );

      setMessage("Amenity deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete amenity."
      );
    }
  }

  const filteredAmenities = amenities.filter((item) =>
    item.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const featuredCount = amenities.filter(
    (item) => item.featured
  ).length;

  const activeCount = amenities.filter(
    (item) => item.active
  ).length;

  return (
    <main className="amenities-page">
      <header className="page-header">
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
            Amenities
          </span>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={startAdd}
        >
          + Add Amenity
        </button>
      </header>

      <section className="page-content">
        <div className="page-intro">
          <div>
            <span className="eyebrow">
              WEBSITE MANAGEMENT
            </span>

            <h1>Amenities</h1>

            <p>
              Manage the amenities and lifestyle spaces
              displayed on the public website.
            </p>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card dark">
            <span>Total Amenities</span>
            <strong>
              {loading ? "—" : amenities.length}
            </strong>
            <small>All records</small>
          </div>

          <div className="summary-card">
            <span>Active</span>
            <strong>
              {loading ? "—" : activeCount}
            </strong>
            <small>Visible on website</small>
          </div>

          <div className="summary-card">
            <span>Featured</span>
            <strong>
              {loading ? "—" : featuredCount}
            </strong>
            <small>Highlighted items</small>
          </div>
        </div>

        {showForm && (
          <section className="editor-card">
            <div className="editor-head">
              <div>
                <span className="eyebrow">
                  {editingId
                    ? "EDIT AMENITY"
                    : "NEW AMENITY"}
                </span>

                <h2>
                  {editingId
                    ? "Edit amenity"
                    : "Add amenity"}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={resetForm}
              >
                ×
              </button>
            </div>

            <form
              className="amenity-form"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <label className="field">
                  <span>Title</span>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Fitness Centre"
                    required
                  />
                </label>

                <label className="field">
                  <span>Display order</span>

                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(event) =>
                      updateForm(
                        "order",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="field field-full">
                  <span>Description</span>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Short description for this amenity."
                  />
                </label>

                <div className="upload-field field-full">
                  <span>Featured image</span>

                  <div className="upload-row">
                    <label className="upload-button">
                      {uploading
                        ? "Uploading…"
                        : "Choose image"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                      />
                    </label>

                    {form.imageUrl && (
                      <div className="preview">
                        <img
                          src={form.imageUrl}
                          alt={form.title || "Amenity"}
                        />
                      </div>
                    )}
                  </div>

                  <small>
                    Recommended: high-quality landscape visual.
                  </small>
                </div>

                <label className="toggle-card">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateForm(
                        "featured",
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <strong>Featured amenity</strong>
                    <span>
                      Highlight this item on the website.
                    </span>
                  </div>
                </label>

                <label className="toggle-card">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      updateForm(
                        "active",
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <strong>Active</strong>
                    <span>
                      Keep this amenity visible.
                    </span>
                  </div>
                </label>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving || uploading}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Add amenity"}

                  <span>→</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {message && (
          <div className="success-message">
            <span />
            {message}
          </div>
        )}

        <section className="list-section">
          <div className="list-head">
            <div>
              <span className="eyebrow">
                PROJECT LIFESTYLE
              </span>

              <h2>Website amenities</h2>
            </div>

            <div className="search-box">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search amenities..."
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading amenities…
            </div>
          ) : filteredAmenities.length === 0 ? (
            <div className="empty-state">
              <strong>
                {amenities.length === 0
                  ? "No amenities yet."
                  : "No matching amenities."}
              </strong>

              <span>
                {amenities.length === 0
                  ? "Add your first amenity to start managing this section."
                  : "Try a different search."}
              </span>
            </div>
          ) : (
            <div className="amenity-list">
              {filteredAmenities.map((item) => (
                <article
                  key={item._id}
                  className="amenity-row"
                >
                  <div className="amenity-visual">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                      />
                    ) : (
                      <div className="no-image">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="amenity-info">
                    <div className="amenity-labels">
                      <span>
                        {String(item.order).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      {item.featured && (
                        <b>Featured</b>
                      )}

                      {!item.active && (
                        <i>Hidden</i>
                      )}
                    </div>

                    <h3>{item.title}</h3>

                    <p>
                      {item.description ||
                        "No description added."}
                    </p>
                  </div>

                  <div className="amenity-actions">
                    <span
                      className={
                        item.active
                          ? "active-status"
                          : "hidden-status"
                      }
                    >
                      {item.active
                        ? "Active"
                        : "Hidden"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(item)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-action"
                      onClick={() =>
                        void deleteAmenity(
                          item._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <style jsx>{`
        .amenities-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 82% 0%,
              rgba(194, 164, 107, 0.09),
              transparent 24%
            ),
            #f3f1ec;
          color: #191a18;
        }

        .page-header {
          min-height: 74px;
          padding: 0 34px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          column-gap: 26px;
          border-bottom: 1px solid #dedbd5;
          background: rgba(250, 249, 246, 0.97);
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

        .add-button {
          justify-self: end;
          min-height: 37px;
          padding: 0 13px;
          border: 0;
          border-radius: 6px;
          background: #1a1c1b;
          color: #ffffff;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .page-content {
          width: min(1100px, calc(100% - 48px));
          margin: 0 auto;
          padding: 38px 0 60px;
        }

        .eyebrow {
          display: block;
          color: #a18455;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .page-intro h1 {
          margin: 8px 0 7px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 38px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .page-intro p {
          max-width: 580px;
          margin: 0;
          color: #7d7971;
          font-size: 11px;
          line-height: 1.65;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 27px 0 25px;
        }

        .summary-card {
          min-height: 105px;
          padding: 16px 18px;
          border: 1px solid #dedbd5;
          border-radius: 8px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .summary-card.dark {
          background: #1b1e1c;
          border-color: #1b1e1c;
          color: #ffffff;
        }

        .summary-card span {
          color: #817d75;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .summary-card.dark span {
          color: rgba(255, 255, 255, 0.45);
        }

        .summary-card strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 33px;
          line-height: 1;
          font-weight: 500;
        }

        .summary-card small {
          color: #a09b93;
          font-size: 8px;
        }

        .summary-card.dark small {
          color: rgba(255, 255, 255, 0.34);
        }

        .editor-card {
          margin-bottom: 14px;
          padding: 22px;
          border: 1px solid #ddd9d1;
          border-radius: 9px;
          background: #ffffff;
          box-shadow: 0 7px 23px rgba(35, 32, 27, 0.035);
        }

        .editor-head {
          padding-bottom: 17px;
          margin-bottom: 20px;
          border-bottom: 1px solid #ebe8e2;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .editor-head h2 {
          margin: 7px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          font-weight: 500;
        }

        .close-button {
          width: 30px;
          height: 30px;
          border: 1px solid #dedad3;
          border-radius: 6px;
          background: #faf9f6;
          color: #68645c;
          cursor: pointer;
          font-size: 18px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 180px;
          gap: 17px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-full {
          grid-column: 1 / -1;
        }

        .field > span,
        .upload-field > span {
          color: #484640;
          font-size: 9px;
          font-weight: 800;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #ddd9d1;
          border-radius: 6px;
          outline: none;
          background: #fbfaf8;
          color: #20211f;
          font: inherit;
          font-size: 11px;
        }

        .field input {
          height: 47px;
          padding: 0 12px;
        }

        .field textarea {
          padding: 11px 12px;
          resize: vertical;
          line-height: 1.55;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #b79b69;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(183, 155, 105, 0.11);
        }

        .upload-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .upload-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .upload-button {
          min-height: 43px;
          padding: 0 13px;
          border: 1px solid #d9d4cb;
          border-radius: 6px;
          background: #faf8f4;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #5b564e;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
        }

        .upload-button input {
          display: none;
        }

        .preview {
          width: 88px;
          height: 58px;
          overflow: hidden;
          border-radius: 5px;
          border: 1px solid #ddd9d1;
          background: #f1efeb;
        }

        .preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .upload-field small {
          color: #9b968e;
          font-size: 8px;
        }

        .toggle-card {
          min-height: 58px;
          padding: 11px 12px;
          box-sizing: border-box;
          border: 1px solid #e3dfd8;
          border-radius: 6px;
          background: #faf9f6;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .toggle-card input {
          width: 15px;
          height: 15px;
          accent-color: #9f814f;
        }

        .toggle-card strong,
        .toggle-card span {
          display: block;
        }

        .toggle-card strong {
          color: #363732;
          font-size: 10px;
          margin-bottom: 3px;
        }

        .toggle-card span {
          color: #99948b;
          font-size: 8px;
        }

        .error-message,
        .success-message {
          margin-top: 13px;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 9px;
        }

        .error-message {
          border: 1px solid #ead2ce;
          background: #fff7f5;
          color: #994e45;
        }

        .success-message {
          margin-bottom: 13px;
          border: 1px solid #d7e1da;
          background: #eef5f0;
          color: #56715f;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-message span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #74917c;
        }

        .form-actions {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #ebe8e2;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .cancel-button,
        .save-button {
          min-height: 38px;
          padding: 0 13px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
        }

        .cancel-button {
          border: 1px solid #ddd9d1;
          background: #ffffff;
          color: #68635c;
        }

        .save-button {
          border: 0;
          background: #1a1c1b;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 9px;
        }

        .save-button span {
          color: #c2a66f;
          font-size: 13px;
        }

        .list-section {
          padding: 22px;
          border: 1px solid #dedbd5;
          border-radius: 9px;
          background: #ffffff;
          box-shadow: 0 6px 20px rgba(35, 32, 27, 0.03);
        }

        .list-head {
          padding-bottom: 18px;
          border-bottom: 1px solid #ebe8e2;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .list-head h2 {
          margin: 7px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 500;
        }

        .search-box input {
          width: 220px;
          height: 38px;
          padding: 0 11px;
          border: 1px solid #ddd9d1;
          border-radius: 6px;
          outline: none;
          background: #faf9f6;
          font-size: 10px;
        }

        .search-box input:focus {
          border-color: #b79b69;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(183, 155, 105, 0.1);
        }

        .amenity-list {
          border-top: 1px solid #ebe8e2;
        }

        .amenity-row {
          min-height: 98px;
          padding: 14px 0;
          border-bottom: 1px solid #ebe8e2;
          display: grid;
          grid-template-columns: 104px minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
        }

        .amenity-visual {
          width: 104px;
          height: 70px;
          overflow: hidden;
          border-radius: 6px;
          background: #efede8;
        }

        .amenity-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa59c;
          font-size: 8px;
        }

        .amenity-labels {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 5px;
        }

        .amenity-labels span {
          color: #a39786;
          font-size: 8px;
          font-weight: 800;
        }

        .amenity-labels b,
        .amenity-labels i {
          padding: 4px 6px;
          border-radius: 4px;
          font-style: normal;
          font-size: 7px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .amenity-labels b {
          background: #f2e8d7;
          color: #80623a;
        }

        .amenity-labels i {
          background: #ece9e4;
          color: #77726a;
        }

        .amenity-info h3 {
          margin: 0 0 5px;
          color: #222320;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          font-weight: 500;
        }

        .amenity-info p {
          max-width: 540px;
          margin: 0;
          overflow: hidden;
          color: #8d8981;
          font-size: 9px;
          line-height: 1.5;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .amenity-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .active-status,
        .hidden-status {
          padding: 5px 7px;
          border-radius: 4px;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .active-status {
          background: #e5eee8;
          color: #597263;
        }

        .hidden-status {
          background: #eceae6;
          color: #77716a;
        }

        .amenity-actions button {
          min-height: 28px;
          padding: 0 8px;
          border: 1px solid #ddd9d1;
          border-radius: 5px;
          background: #faf9f6;
          color: #625d55;
          cursor: pointer;
          font-size: 8px;
          font-weight: 700;
        }

        .amenity-actions button:hover {
          background: #f1eee8;
        }

        .amenity-actions .delete-action {
          color: #9a534a;
          border-color: #ead6d2;
        }

        .empty-state {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 7px;
          color: #99958d;
          font-size: 9px;
        }

        .empty-state strong {
          color: #363733;
          font-size: 11px;
        }

        @media (max-width: 820px) {
          .page-header {
            padding: 0 20px;
          }

          .page-content {
            width: min(100% - 28px, 700px);
            padding-top: 28px;
          }

          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .summary-card:last-child {
            grid-column: 1 / -1;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field-full {
            grid-column: auto;
          }

          .list-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .search-box input {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .page-header {
            grid-template-columns: 1fr auto;
            gap: 12px;
          }

          .back-link {
            display: none;
          }

          .brand-row {
            justify-self: start;
          }

          .brand-logo {
            width: 94px;
          }

          .divider {
            display: none;
          }

          .page-name {
            font-size: 10px;
          }

          .add-button {
            padding: 0 10px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .summary-card:last-child {
            grid-column: auto;
          }

          .list-section,
          .editor-card {
            padding: 16px;
          }

          .amenity-row {
            grid-template-columns: 72px minmax(0, 1fr);
            gap: 11px;
          }

          .amenity-visual {
            width: 72px;
            height: 62px;
          }

          .amenity-actions {
            grid-column: 1 / -1;
            justify-content: flex-end;
          }

          .amenity-info p {
            white-space: normal;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          .upload-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .save-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .back-link,
          .add-button,
          .field input,
          .field textarea,
          .search-box input,
          .save-button,
          .amenity-actions button {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
