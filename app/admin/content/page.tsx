"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../../lib/api";

type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  story: {
    eyebrow: string;
    title: string;
    description: string;
  };
  projectStats: {
    acres: string;
    acresLabel: string;
    towers: string;
    towersLabel: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
};

const emptyContent: SiteContent = {
  hero: {
    eyebrow: "",
    title: "",
    description: "",
    primaryCtaLabel: "",
    secondaryCtaLabel: "",
  },
  story: {
    eyebrow: "",
    title: "",
    description: "",
  },
  projectStats: {
    acres: "",
    acresLabel: "",
    towers: "",
    towersLabel: "",
  },
  contact: {
    eyebrow: "",
    title: "",
    description: "",
    ctaLabel: "",
  },
};

export default function ProjectContentPage() {
  const [content, setContent] =
    useState<SiteContent>(emptyContent);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${getBrowserApiUrl()}/site-content`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.message || "Unable to load project content."
          );
        }

        setContent({
          hero: {
            ...emptyContent.hero,
            ...data.data.hero,
          },
          story: {
            ...emptyContent.story,
            ...data.data.story,
          },
          projectStats: {
            ...emptyContent.projectStats,
            ...data.data.projectStats,
          },
          contact: {
            ...emptyContent.contact,
            ...data.data.contact,
          },
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load project content."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadContent();
  }, []);

  function updateField(
    section: keyof SiteContent,
    field: string,
    value: string
  ) {
    setContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${getBrowserApiUrl()}/site-content`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(content),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to save project content."
        );
      }

      setMessage("Project content saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save project content."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content-page">
      <header className="content-header">
        <div className="content-header-left">
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
              className="content-logo"
            />

            <span className="brand-divider" />

            <span className="page-name">
              Project Content
            </span>
          </div>
        </div>

        <div className="header-note">
          Website content
        </div>
      </header>

      {loading ? (
        <div className="loading-state">
          <div className="loader" />
          <span>Loading project content…</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="content-form"
        >
          <div className="page-intro">
            <div>
              <span className="eyebrow">
                WEBSITE MANAGEMENT
              </span>

              <h1>Project Content</h1>

              <p>
                Manage the primary text and project information
                displayed across the website.
              </p>
            </div>

            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
              <span>→</span>
            </button>
          </div>

          {message && (
            <div className="success-message">
              <span className="message-dot" />
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* HERO */}
          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="card-number">01</span>
                <div>
                  <span className="card-kicker">
                    HOMEPAGE
                  </span>
                  <h2>Hero section</h2>
                </div>
              </div>

              <span className="card-description">
                First impression
              </span>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Eyebrow</span>
                <input
                  value={content.hero.eyebrow}
                  onChange={(event) =>
                    updateField(
                      "hero",
                      "eyebrow",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Main title</span>
                <textarea
                  rows={3}
                  value={content.hero.title}
                  onChange={(event) =>
                    updateField(
                      "hero",
                      "title",
                      event.target.value
                    )
                  }
                  placeholder={"A home with\nmore room for life."}
                />
                <small className="field-hint">
                  Use a new line to create the highlighted second line.
                </small>
              </label>

              <label className="field field-full">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={content.hero.description}
                  onChange={(event) =>
                    updateField(
                      "hero",
                      "description",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Primary CTA</span>
                <input
                  value={content.hero.primaryCtaLabel}
                  onChange={(event) =>
                    updateField(
                      "hero",
                      "primaryCtaLabel",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Secondary CTA</span>
                <input
                  value={content.hero.secondaryCtaLabel}
                  onChange={(event) =>
                    updateField(
                      "hero",
                      "secondaryCtaLabel",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          {/* STORY */}
          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="card-number">02</span>
                <div>
                  <span className="card-kicker">
                    STORY
                  </span>
                  <h2>The Story</h2>
                </div>
              </div>

              <span className="card-description">
                Project narrative
              </span>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Eyebrow</span>
                <input
                  value={content.story.eyebrow}
                  onChange={(event) =>
                    updateField(
                      "story",
                      "eyebrow",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Title</span>
                <input
                  value={content.story.title}
                  onChange={(event) =>
                    updateField(
                      "story",
                      "title",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field field-full">
                <span>Description</span>
                <textarea
                  rows={5}
                  value={content.story.description}
                  onChange={(event) =>
                    updateField(
                      "story",
                      "description",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          {/* PROJECT STATS */}
          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="card-number">03</span>
                <div>
                  <span className="card-kicker">
                    PROJECT
                  </span>
                  <h2>Project statistics</h2>
                </div>
              </div>

              <span className="card-description">
                Key figures
              </span>
            </div>

            <div className="stats-edit-grid">
              <label className="field">
                <span>Acres value</span>
                <input
                  value={content.projectStats.acres}
                  onChange={(event) =>
                    updateField(
                      "projectStats",
                      "acres",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Acres label</span>
                <input
                  value={content.projectStats.acresLabel}
                  onChange={(event) =>
                    updateField(
                      "projectStats",
                      "acresLabel",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Towers value</span>
                <input
                  value={content.projectStats.towers}
                  onChange={(event) =>
                    updateField(
                      "projectStats",
                      "towers",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Towers label</span>
                <input
                  value={content.projectStats.towersLabel}
                  onChange={(event) =>
                    updateField(
                      "projectStats",
                      "towersLabel",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          {/* CONTACT */}
          <section className="content-card">
            <div className="card-heading">
              <div>
                <span className="card-number">04</span>
                <div>
                  <span className="card-kicker">
                    CONTACT
                  </span>
                  <h2>Contact section</h2>
                </div>
              </div>

              <span className="card-description">
                Enquiry CTA
              </span>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Eyebrow</span>
                <input
                  value={content.contact.eyebrow}
                  onChange={(event) =>
                    updateField(
                      "contact",
                      "eyebrow",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>CTA label</span>
                <input
                  value={content.contact.ctaLabel}
                  onChange={(event) =>
                    updateField(
                      "contact",
                      "ctaLabel",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field field-full">
                <span>Heading</span>
                <input
                  value={content.contact.title}
                  onChange={(event) =>
                    updateField(
                      "contact",
                      "title",
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="field field-full">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={content.contact.description}
                  onChange={(event) =>
                    updateField(
                      "contact",
                      "description",
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          <div className="form-bottom">
            <span>
              Changes will be applied to the public website after
              the content connection is completed.
            </span>

            <button
              type="submit"
              className="save-button bottom-save"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
              <span>→</span>
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        .content-page {
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

        .content-header {
          min-height: 74px;
          padding: 0 34px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #dfdcd5;
          background: rgba(250, 249, 246, 0.96);
        }

        .content-header-left {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .back-link {
          color: #827d74;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          transition: color 180ms ease;
        }

        .back-link:hover {
          color: #1c1d1b;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .content-logo {
          width: 104px;
          height: auto;
          display: block;
        }

        .brand-divider {
          width: 1px;
          height: 20px;
          background: #d6d1c8;
        }

        .page-name {
          color: #252623;
          font-size: 11px;
          font-weight: 700;
        }

        .header-note {
          color: #9b968e;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .content-form {
          width: min(1080px, calc(100% - 48px));
          margin: 0 auto;
          padding: 38px 0 60px;
        }

        .page-intro {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 26px;
        }

        .eyebrow,
        .card-kicker {
          display: block;
          color: #9d8053;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .page-intro h1 {
          margin: 8px 0 7px;
          color: #191a18;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 37px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .page-intro p {
          margin: 0;
          max-width: 520px;
          color: #7f7a71;
          font-size: 11px;
          line-height: 1.65;
        }

        .save-button {
          min-height: 39px;
          padding: 0 14px;
          border: 0;
          border-radius: 6px;
          background: #1a1c1b;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
          transition:
            background 180ms ease,
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .save-button:hover:not(:disabled) {
          background: #252926;
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(25, 27, 25, 0.11);
        }

        .save-button span {
          color: #c5a66d;
          font-size: 13px;
        }

        .save-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .success-message,
        .error-message {
          margin-bottom: 12px;
          padding: 11px 13px;
          border-radius: 6px;
          font-size: 9px;
        }

        .success-message {
          border: 1px solid #d3dfd6;
          background: #edf4ef;
          color: #55715f;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .message-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #76927e;
        }

        .error-message {
          border: 1px solid #ead3cf;
          background: #fff7f5;
          color: #994f45;
        }

        .content-card {
          margin-top: 12px;
          padding: 22px;
          border: 1px solid #dedbd5;
          border-radius: 9px;
          background: #ffffff;
          box-shadow: 0 6px 20px rgba(32, 30, 26, 0.03);
        }

        .card-heading {
          margin-bottom: 22px;
          padding-bottom: 17px;
          border-bottom: 1px solid #ece9e3;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .card-heading > div {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .card-number {
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          border-radius: 50%;
          background: #f1e8d8;
          color: #8a6f45;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 800;
        }

        .card-heading h2 {
          margin: 6px 0 0;
          color: #1b1c1a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .card-description {
          color: #aaa59c;
          font-size: 9px;
        }


        .field-hint {
          color: #a19b91;
          font-size: 8px;
          line-height: 1.45;
          margin-top: -2px;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .stats-edit-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-full {
          grid-column: 1 / -1;
        }

        .field > span {
          color: #4f4c46;
          font-size: 9px;
          font-weight: 800;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dedbd5;
          border-radius: 6px;
          outline: none;
          background: #fbfaf8;
          color: #20211f;
          font: inherit;
          font-size: 11px;
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease;
        }

        .field input {
          height: 47px;
          padding: 0 12px;
        }

        .field textarea {
          padding: 11px 12px;
          resize: vertical;
          line-height: 1.6;
        }

        .field input:hover,
        .field textarea:hover {
          border-color: #cfc8bc;
          background: #ffffff;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #b69a68;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(182, 154, 104, 0.11);
        }

        .form-bottom {
          margin-top: 18px;
          padding: 17px 2px 0;
          border-top: 1px solid #ddd9d1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .form-bottom > span {
          color: #99958d;
          font-size: 9px;
          line-height: 1.5;
        }

        .loading-state {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #89857d;
          font-size: 10px;
        }

        .loader {
          width: 17px;
          height: 17px;
          border: 1px solid #d7d1c6;
          border-top-color: #a88b59;
          border-radius: 50%;
          animation: spin 700ms linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 820px) {
          .content-header {
            padding: 0 20px;
          }

          .header-note {
            display: none;
          }

          .content-form {
            width: min(100% - 28px, 700px);
            padding-top: 28px;
          }

          .page-intro {
            align-items: flex-start;
            flex-direction: column;
          }

          .field-grid,
          .stats-edit-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 560px) {
          .content-header-left {
            gap: 13px;
          }

          .brand-divider {
            display: none;
          }

          .back-link {
            display: none;
          }

          .content-logo {
            width: 92px;
          }

          .page-name {
            font-size: 10px;
          }

          .page-intro h1 {
            font-size: 32px;
          }

          .content-card {
            padding: 17px;
          }

          .field-grid,
          .stats-edit-grid {
            grid-template-columns: 1fr;
          }

          .field-full {
            grid-column: auto;
          }

          .card-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .bottom-save {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .back-link,
          .save-button,
          .field input,
          .field textarea {
            transition: none;
          }

          .loader {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
