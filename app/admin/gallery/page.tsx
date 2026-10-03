"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../../lib/api";

type GalleryCategory =
  | "Architecture"
  | "Residences"
  | "Amenities"
  | "Lifestyle"
  | "Retail"
  | "Landscape";

type GalleryItem = {
  _id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  publicId?: string;
  order: number;
  featured: boolean;
  createdAt?: string;
};

const categories: GalleryCategory[] = [
  "Architecture",
  "Residences",
  "Amenities",
  "Lifestyle",
  "Retail",
  "Landscape",
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<GalleryCategory>("Architecture");
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [order, setOrder] = useState("0");
  const [featured, setFeatured] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadGallery() {
    try {
      setLoading(true);

      const response = await fetch(
        `${getBrowserApiUrl()}/gallery`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load gallery."
        );
      }

      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load gallery."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGallery();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSelectedCategory("Architecture");
    setImageUrl("");
    setPublicId("");
    setOrder("0");
    setFeatured(false);
    setMessage("");
    setShowForm(false);
  }

  function openAdd() {
    setEditingId(null);
    setTitle("");
    setSelectedCategory("Architecture");
    setImageUrl("");
    setPublicId("");
    setOrder(String(items.length));
    setFeatured(false);
    setMessage("");
    setShowForm(true);
  }

  function openEdit(item: GalleryItem) {
    setEditingId(item._id);
    setTitle(item.title);
    setSelectedCategory(item.category);
    setImageUrl(item.imageUrl);
    setPublicId(item.publicId || "");
    setOrder(String(item.order ?? 0));
    setFeatured(item.featured);
    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleUpload(file: File) {
    try {
      setUploading(true);
      setMessage("");

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
          data.message || "Image upload failed."
        );
      }

      setImageUrl(data.data?.url || "");
      setPublicId(data.data?.publicId || "");
      setMessage("Image uploaded.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a title.");
      return;
    }

    if (!imageUrl.trim()) {
      setMessage("Please upload an image.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        title: title.trim(),
        category: selectedCategory,
        imageUrl: imageUrl.trim(),
        publicId: publicId.trim(),
        order: Number(order) || 0,
        featured,
      };

      const url = editingId
        ? `${getBrowserApiUrl()}/gallery/${editingId}`
        : `${getBrowserApiUrl()}/gallery`;

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
          data.message || "Unable to save image."
        );
      }

      setMessage(
        editingId
          ? "Gallery image updated."
          : "Gallery image added."
      );

      await loadGallery();
      resetForm();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save image."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: GalleryItem) {
    const confirmed = window.confirm(
      `Delete "${item.title}" from the gallery?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      setMessage("");

      const response = await fetch(
        `${getBrowserApiUrl()}/gallery/${item._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete image."
        );
      }

      setItems((current) =>
        current.filter(
          (galleryItem) =>
            galleryItem._id !== item._id
        )
      );

      if (editingId === item._id) {
        resetForm();
      }

      setMessage("Gallery image deleted.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete image."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" ||
        item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const featuredCount = items.filter(
    (item) => item.featured
  ).length;

  return (
    <main className="gallery-shell">
      <div className="gallery-wrap">
        <header className="page-header">
          <div className="header-brand">
            <img
              src="/brand/ym-realty-logo.png"
              alt="YM Realty"
            />

            <div>
              <span>
                YM REALTY · WEBSITE MANAGEMENT
              </span>

              <h1>Gallery</h1>

              <p>
                Manage website visuals and project
                media.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <Link
              href="/admin"
              className="button secondary"
            >
              ← Dashboard
            </Link>

            <button
              type="button"
              className="button primary"
              onClick={openAdd}
            >
              + Add Visual
            </button>
          </div>
        </header>

        <section className="summary-grid">
          <div>
            <span>Total Visuals</span>
            <strong>
              {loading ? "—" : items.length}
            </strong>
          </div>

          <div>
            <span>Featured</span>
            <strong>
              {loading ? "—" : featuredCount}
            </strong>
          </div>

          <div>
            <span>Categories</span>
            <strong>{categories.length}</strong>
          </div>
        </section>

        {showForm && (
          <section className="form-panel">
            <div className="form-heading">
              <div>
                <span>
                  {editingId
                    ? "EDIT VISUAL"
                    : "ADD VISUAL"}
                </span>

                <h2>
                  {editingId
                    ? "Update gallery image"
                    : "Add a new visual"}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={resetForm}
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="form-grid"
            >
              <label>
                <span>Title</span>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Main elevation"
                  maxLength={200}
                  required
                />
              </label>

              <label>
                <span>Category</span>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target
                        .value as GalleryCategory
                    )
                  }
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>Display Order</span>

                <input
                  type="number"
                  min="0"
                  value={order}
                  onChange={(event) =>
                    setOrder(event.target.value)
                  }
                />
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(
                      event.target.checked
                    )
                  }
                />

                <span>
                  Featured visual
                </span>
              </label>

              <div className="upload-field">
                <span>Image</span>

                <div className="upload-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0];

                      if (file) {
                        void handleUpload(file);
                      }
                    }}
                    disabled={uploading}
                  />

                  {uploading && (
                    <small>
                      Uploading…
                    </small>
                  )}
                </div>

                {imageUrl && (
                  <div className="form-preview">
                    <img
                      src={imageUrl}
                      alt="Preview"
                    />
                  </div>
                )}
              </div>

              {message && (
                <div className="form-message">
                  {message}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button primary"
                  disabled={saving || uploading}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save Changes"
                      : "Add Visual"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="library">
          <div className="library-header">
            <div>
              <span>MEDIA LIBRARY</span>
              <h2>Website visuals</h2>
            </div>

            <div className="filters">
              <div className="search">
                <span>⌕</span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search..."
                />
              </div>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                <option value="All">
                  All Categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {message && !showForm && (
            <div className="message">
              {message}
            </div>
          )}

          {loading ? (
            <div className="empty">
              Loading gallery…
            </div>
          ) : items.length === 0 ? (
            <div className="empty large">
              <div className="empty-symbol">+</div>

              <h3>No visuals yet</h3>

              <p>
                Add your first website visual using
                the button above.
              </p>

              <button
                type="button"
                className="button primary"
                onClick={openAdd}
              >
                Add Visual
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty large">
              <h3>No matching visuals</h3>

              <p>
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="image-grid">
              {filteredItems.map((item) => (
                <article
                  className="image-card"
                  key={item._id}
                >
                  <div className="image-wrap">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                    />

                    {item.featured && (
                      <span className="featured">
                        Featured
                      </span>
                    )}

                    <span className="order">
                      #{item.order}
                    </span>
                  </div>

                  <div className="image-info">
                    <div className="image-meta">
                      <span>
                        {item.category}
                      </span>
                    </div>

                    <h3>{item.title}</h3>

                    <div className="image-actions">
                      <button
                        type="button"
                        className="edit-action"
                        onClick={() =>
                          openEdit(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-action"
                        disabled={
                          deletingId ===
                          item._id
                        }
                        onClick={() =>
                          void deleteItem(item)
                        }
                      >
                        {deletingId === item._id
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .gallery-shell {
          min-height: 100vh;
          background: #f3eee6;
          color: #1c1b19;
          padding: 30px 24px 60px;
        }

        .gallery-wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding-bottom: 25px;
          border-bottom: 1px solid
            rgba(28, 27, 25, 0.1);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 17px;
        }

        .header-brand img {
          width: 92px;
          height: auto;
        }

        .header-brand span,
        .library-header > div > span,
        .form-heading span {
          display: block;
          color: #897c6d;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .header-brand h1 {
          margin: 6px 0 4px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 37px;
          line-height: 1;
          font-weight: 500;
        }

        .header-brand p {
          margin: 7px 0 0;
          color: #817567;
          font-size: 12px;
        }

        .header-actions {
          display: flex;
          gap: 9px;
        }

        .button {
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid
            rgba(28, 27, 25, 0.15);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        .button.primary {
          background: #1c1b19;
          border-color: #1c1b19;
          color: #fffdf8;
        }

        .button.secondary {
          background: transparent;
          color: #1c1b19;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 20px 0;
        }

        .summary-grid > div {
          min-height: 88px;
          padding: 16px 18px;
          background: #fffdf8;
          border: 1px solid
            rgba(28, 27, 25, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .summary-grid span {
          color: #8d8070;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .summary-grid strong {
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 28px;
          font-weight: 500;
          line-height: 1;
        }

        .form-panel,
        .library {
          background: #fffdf8;
          border: 1px solid
            rgba(28, 27, 25, 0.09);
        }

        .form-panel {
          padding: 21px;
          margin-bottom: 12px;
        }

        .form-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .form-heading h2,
        .library-header h2 {
          margin: 5px 0 0;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 25px;
          font-weight: 500;
        }

        .close-button {
          border: 1px solid
            rgba(28, 27, 25, 0.14);
          background: transparent;
          padding: 8px 10px;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1.3fr 0.8fr auto;
          gap: 12px;
          align-items: end;
        }

        .form-grid label,
        .upload-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-grid label > span,
        .upload-field > span {
          color: #807465;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .form-grid input:not([type="checkbox"]),
        .form-grid select {
          height: 42px;
          border: 1px solid
            rgba(28, 27, 25, 0.13);
          background: #fff;
          padding: 0 11px;
          font: inherit;
          font-size: 11px;
          outline: 0;
        }

        .form-grid input:focus,
        .form-grid select:focus {
          border-color: #b99764;
        }

        .check-field {
          height: 42px;
          flex-direction: row !important;
          align-items: center;
          gap: 7px !important;
          white-space: nowrap;
        }

        .check-field input {
          width: 16px;
          height: 16px;
        }

        .check-field span {
          color: #5e564b !important;
          font-size: 10px !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
        }

        .upload-field {
          grid-column: 1 / -1;
          margin-top: 2px;
        }

        .upload-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px;
          border: 1px dashed
            rgba(28, 27, 25, 0.18);
          background: #f7f2e9;
        }

        .upload-row input {
          font: inherit;
          font-size: 11px;
        }

        .upload-row small {
          color: #967747;
        }

        .form-preview {
          width: 210px;
          margin-top: 10px;
          aspect-ratio: 16 / 10;
          background: #eee7dc;
          overflow: hidden;
        }

        .form-preview img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .form-message {
          grid-column: 1 / -1;
          padding: 9px 11px;
          background: #f0e7db;
          color: #6f604f;
          font-size: 11px;
        }

        .form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 4px;
        }

        .library-header {
          padding: 19px 20px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid
            rgba(28, 27, 25, 0.08);
        }

        .filters {
          display: flex;
          gap: 8px;
        }

        .search {
          width: 210px;
          height: 40px;
          padding: 0 10px;
          background: #fff;
          border: 1px solid
            rgba(28, 27, 25, 0.12);
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .search span {
          color: #9a8d7d;
        }

        .search input {
          width: 100%;
          border: 0;
          outline: 0;
          font: inherit;
          font-size: 11px;
        }

        .filters select {
          width: 155px;
          height: 40px;
          border: 1px solid
            rgba(28, 27, 25, 0.12);
          background: #fff;
          padding: 0 9px;
          font: inherit;
          font-size: 10px;
          color: #5d554b;
          outline: 0;
        }

        .message {
          margin: 12px 12px 0;
          padding: 9px 11px;
          background: #f0e7db;
          color: #6f604f;
          font-size: 11px;
        }

        .image-grid {
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .image-card {
          border: 1px solid
            rgba(28, 27, 25, 0.09);
          background: #fff;
          overflow: hidden;
        }

        .image-wrap {
          position: relative;
          aspect-ratio: 16 / 10;
          background: #eee7dc;
        }

        .image-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .featured,
        .order {
          position: absolute;
          top: 9px;
          padding: 5px 7px;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .featured {
          left: 9px;
          background: #1c1b19;
          color: #fffdf8;
        }

        .order {
          right: 9px;
          background: rgba(255, 253, 248, 0.9);
          color: #5d554b;
        }

        .image-info {
          padding: 13px;
        }

        .image-meta {
          color: #8d8070;
          font-size: 8px;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .image-info h3 {
          margin: 0 0 12px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 18px;
          font-weight: 500;
        }

        .image-actions {
          display: flex;
          gap: 6px;
        }

        .edit-action,
        .delete-action {
          padding: 7px 10px;
          border: 1px solid
            rgba(28, 27, 25, 0.13);
          background: transparent;
          font: inherit;
          font-size: 9px;
          cursor: pointer;
        }

        .delete-action {
          background: #f5e8e4;
          color: #763e36;
          border-color: rgba(118, 62, 54, 0.18);
        }

        .empty {
          min-height: 140px;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #85796b;
        }

        .empty.large {
          min-height: 310px;
        }

        .empty-symbol {
          width: 42px;
          height: 42px;
          margin-bottom: 9px;
          border: 1px solid
            rgba(28, 27, 25, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 21px;
        }

        .empty h3 {
          margin: 0 0 6px;
          color: #403a33;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 21px;
          font-weight: 500;
        }

        .empty p {
          max-width: 390px;
          margin: 0 0 14px;
          color: #897e70;
          font-size: 11px;
          line-height: 1.55;
        }

        @media (max-width: 900px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .image-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .library-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 650px) {
          .gallery-shell {
            padding: 20px 14px 45px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions,
          .header-actions .button {
            width: 100%;
          }

          .header-actions .button {
            flex: 1;
          }

          .summary-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .form-grid,
          .image-grid {
            grid-template-columns: 1fr;
          }

          .filters,
          .search,
          .filters select {
            width: 100%;
          }

          .filters {
            flex-direction: column;
          }

          .form-panel {
            padding: 17px;
          }

          .image-grid {
            padding: 10px;
          }
        }
      `}</style>
    </main>
  );
}
