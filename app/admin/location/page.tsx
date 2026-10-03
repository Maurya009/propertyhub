"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../../lib/api";

type ConnectivityItem = {
  _id?: string;
  time: string;
  place: string;
  order: number;
  active: boolean;
};

type LocationData = {
  key?: string;

  project: {
    label: string;
    address: string;
    mapQuery: string;
  };

  heading: string;
  description: string;

  office: {
    address: string;
    mapQuery: string;
  };

  connectivity: ConnectivityItem[];
  active: boolean;
};

const brochureConnectivity: ConnectivityItem[] = [
  {
    time: "03 min",
    place: "Global City",
    order: 1,
    active: true,
  },
  {
    time: "08 min",
    place: "Proposed Metro Station",
    order: 2,
    active: true,
  },
  {
    time: "25 min",
    place: "Sultanpur National Park",
    order: 3,
    active: true,
  },
  {
    time: "25 min",
    place: "IGI Airport",
    order: 4,
    active: true,
  },
];

const defaultForm: LocationData = {
  project: {
    label: "The Story House · Sector 89A, Gurugram",
    address: "",
    mapQuery: "",
  },

  heading: "Connected to what matters.",

  description:
    "Well connected to key business districts, transport links, everyday essentials and important destinations.",

  office: {
    address:
      "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007",
    mapQuery:
      "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007",
  },

  connectivity: brochureConnectivity,

  active: true,
};

export default function LocationPage() {
  const [form, setForm] =
    useState<LocationData>(defaultForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLocation() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${getBrowserApiUrl()}/location`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            "Unable to load location settings."
        );
      }

      const data = result.data;

      setForm({
        project: {
          label:
            data?.project?.label ||
            defaultForm.project.label,

          address:
            data?.project?.address ||
            "",

          mapQuery:
            data?.project?.mapQuery ||
            "",
        },

        heading:
          data?.heading ||
          defaultForm.heading,

        description:
          data?.description ||
          defaultForm.description,

        office: {
          address:
            data?.office?.address ||
            defaultForm.office.address,

          mapQuery:
            data?.office?.mapQuery ||
            defaultForm.office.mapQuery,
        },

        connectivity:
          Array.isArray(data?.connectivity) &&
          data.connectivity.length > 0
            ? data.connectivity
            : brochureConnectivity,

        active: data?.active !== false,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load location settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLocation();
  }, []);

  function updateProject(
    field: keyof LocationData["project"],
    value: string
  ) {
    setForm((current) => ({
      ...current,

      project: {
        ...current.project,
        [field]: value,
      },
    }));
  }

  function updateOffice(
    field: keyof LocationData["office"],
    value: string
  ) {
    setForm((current) => ({
      ...current,

      office: {
        ...current.office,
        [field]: value,
      },
    }));
  }

  function updateConnectivity(
    index: number,
    field: keyof ConnectivityItem,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,

      connectivity: current.connectivity.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]:
                  field === "order"
                    ? Number(value)
                    : value,
              }
            : item
      ),
    }));
  }

  function addConnectivity() {
    setForm((current) => ({
      ...current,

      connectivity: [
        ...current.connectivity,
        {
          time: "",
          place: "",
          order:
            current.connectivity.length + 1,
          active: true,
        },
      ],
    }));
  }

  function removeConnectivity(index: number) {
    setForm((current) => ({
      ...current,

      connectivity: current.connectivity
        .filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex + 1,
        })),
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
        `${getBrowserApiUrl()}/location`,
        {
          method: "PUT",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            "Unable to save location settings."
        );
      }

      setForm((current) => ({
        ...current,
        ...result.data,

        project: {
          ...current.project,
          ...result.data?.project,
        },

        office: {
          ...current.office,
          ...result.data?.office,
        },

        connectivity:
          Array.isArray(result.data?.connectivity)
            ? result.data.connectivity
            : current.connectivity,
      }));

      setMessage(
        "Location settings saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save location settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="location-page">
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
            Location
          </span>
        </div>
      </header>

      <div className="page-content">
        <div className="page-intro">
          <div>
            <span className="eyebrow">
              WEBSITE MANAGEMENT
            </span>

            <h1>Location</h1>

            <p>
              Manage project location, map details,
              office information and nearby
              connectivity destinations.
            </p>
          </div>

          <span
            className={`status-pill ${
              form.active
                ? "active"
                : "inactive"
            }`}
          >
            {form.active
              ? "Visible"
              : "Hidden"}
          </span>
        </div>

        {loading ? (
          <section className="loading-card">
            Loading location settings...
          </section>
        ) : (
          <form
            className="location-form"
            onSubmit={handleSubmit}
          >
            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    PROJECT
                  </span>

                  <h2>
                    Project location
                  </h2>

                  <p>
                    Location information used for
                    the project website.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label className="field field-full">
                  <span>
                    Project label
                  </span>

                  <input
                    type="text"
                    value={form.project.label}
                    onChange={(event) =>
                      updateProject(
                        "label",
                        event.target.value
                      )
                    }
                    placeholder="The Story House · Sector 89A, Gurugram"
                  />
                </label>

                <label className="field">
                  <span>
                    Project address
                  </span>

                  <input
                    type="text"
                    value={form.project.address}
                    onChange={(event) =>
                      updateProject(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Enter project address"
                  />
                </label>

                <label className="field">
                  <span>
                    Project Google Maps query
                  </span>

                  <input
                    type="text"
                    value={form.project.mapQuery}
                    onChange={(event) =>
                      updateProject(
                        "mapQuery",
                        event.target.value
                      )
                    }
                    placeholder="Project name or full address"
                  />
                </label>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    LOCATION STORY
                  </span>

                  <h2>
                    Connectivity introduction
                  </h2>

                  <p>
                    Supporting copy for the
                    location and connectivity section.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label className="field field-full">
                  <span>
                    Heading
                  </span>

                  <input
                    type="text"
                    value={form.heading}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        heading:
                          event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field field-full">
                  <span>
                    Description
                  </span>

                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    CONNECTIVITY
                  </span>

                  <h2>
                    Nearby destinations
                  </h2>

                  <p>
                    Add, remove and reorder
                    connectivity highlights.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addConnectivity}
                >
                  + Add destination
                </button>
              </div>

              <div className="connectivity-list">
                {form.connectivity.map(
                  (item, index) => (
                    <div
                      className="connectivity-row"
                      key={
                        item._id ||
                        `${item.place}-${index}`
                      }
                    >
                      <div className="order-box">
                        <span>
                          ORDER
                        </span>

                        <input
                          type="number"
                          min="1"
                          value={item.order}
                          onChange={(event) =>
                            updateConnectivity(
                              index,
                              "order",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <label className="field">
                        <span>
                          Time
                        </span>

                        <input
                          type="text"
                          value={item.time}
                          onChange={(event) =>
                            updateConnectivity(
                              index,
                              "time",
                              event.target.value
                            )
                          }
                          placeholder="03 min"
                        />
                      </label>

                      <label className="field destination-field">
                        <span>
                          Destination
                        </span>

                        <input
                          type="text"
                          value={item.place}
                          onChange={(event) =>
                            updateConnectivity(
                              index,
                              "place",
                              event.target.value
                            )
                          }
                          placeholder="Global City"
                        />
                      </label>

                      <label className="toggle-field">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={(event) =>
                            updateConnectivity(
                              index,
                              "active",
                              event.target.checked
                            )
                          }
                        />

                        <span>
                          Active
                        </span>
                      </label>

                      <button
                        type="button"
                        className="remove-button"
                        onClick={() =>
                          removeConnectivity(index)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-label">
                    OFFICE
                  </span>

                  <h2>
                    Office &amp; map
                  </h2>

                  <p>
                    Contact-office information shown
                    in the website footer.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label className="field field-full">
                  <span>
                    Office address
                  </span>

                  <textarea
                    rows={3}
                    value={form.office.address}
                    onChange={(event) =>
                      updateOffice(
                        "address",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="field field-full">
                  <span>
                    Office Google Maps query
                  </span>

                  <input
                    type="text"
                    value={form.office.mapQuery}
                    onChange={(event) =>
                      updateOffice(
                        "mapQuery",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className="save-bar">
              <label className="master-toggle">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      active:
                        event.target.checked,
                    }))
                  }
                />

                <span>
                  Show location content
                </span>
              </label>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save location"}
              </button>
            </section>

            {message && (
              <div className="message success">
                {message}
              </div>
            )}

            {error && (
              <div className="message error">
                {error}
              </div>
            )}
          </form>
        )}
      </div>

      <style jsx>{`
        .location-page {
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

        .page-content {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
          padding: 38px 0 60px;
        }

        .page-intro {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .eyebrow,
        .section-label {
          display: block;
          color: #a18455;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .page-intro h1 {
          margin: 8px 0 7px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 38px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .page-intro p {
          margin: 0;
          max-width: 650px;
          color: #77736b;
          font-size: 12px;
          line-height: 1.7;
        }

        .status-pill {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
        }

        .status-pill.active {
          background: #e3ebdf;
          color: #4c6248;
        }

        .status-pill.inactive {
          background: #e7e3dc;
          color: #77736b;
        }

        .loading-card,
        .form-section,
        .save-bar,
        .message {
          border: 1px solid #dfdbd4;
          background: #faf9f6;
          box-shadow: 0 10px 30px
            rgba(47, 43, 36, 0.035);
        }

        .loading-card {
          padding: 28px;
          color: #77736b;
          font-size: 11px;
        }

        .form-section {
          padding: 26px;
          margin-bottom: 16px;
        }

        .section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 7px 0 5px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 23px;
          line-height: 1.15;
          font-weight: 500;
        }

        .section-heading p {
          margin: 0;
          color: #858078;
          font-size: 10px;
          line-height: 1.6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .field-full {
          grid-column: 1 / -1;
        }

        .field > span,
        .order-box > span {
          color: #77736b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d8d4cc;
          border-radius: 6px;
          background: #fffefa;
          color: #252623;
          outline: none;
          font: inherit;
          font-size: 11px;
          padding: 11px 12px;
        }

        textarea {
          resize: vertical;
          min-height: 88px;
          line-height: 1.6;
        }

        input:focus,
        textarea:focus {
          border-color: #b79a67;
          box-shadow: 0 0 0 3px
            rgba(183, 154, 103, 0.1);
        }

        .secondary-button {
          flex: 0 0 auto;
          min-height: 36px;
          padding: 0 12px;
          border: 1px solid #cfc9bf;
          border-radius: 6px;
          background: #fffefa;
          color: #3b3b37;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
        }

        .connectivity-list {
          display: grid;
          gap: 10px;
        }

        .connectivity-row {
          display: grid;
          grid-template-columns: 70px 150px minmax(
              180px,
              1fr
            ) auto auto;
          gap: 10px;
          align-items: end;
          padding: 13px;
          border: 1px solid #e1ddd6;
          background: #f6f4ef;
        }

        .order-box {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .order-box input {
          width: 70px;
        }

        .toggle-field {
          display: flex;
          align-items: center;
          gap: 7px;
          min-height: 39px;
          padding: 0 5px;
          color: #55534e;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .toggle-field input,
        .master-toggle input {
          width: 15px;
          height: 15px;
          accent-color: #8e744a;
        }

        .remove-button {
          min-height: 38px;
          padding: 0 10px;
          border: 1px solid #d7d0c6;
          border-radius: 6px;
          background: transparent;
          color: #817a70;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
        }

        .remove-button:hover {
          background: #eeeae3;
        }

        .save-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px 18px;
        }

        .master-toggle {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #514f49;
          font-size: 10px;
          font-weight: 700;
        }

        .save-button {
          min-height: 40px;
          padding: 0 18px;
          border: 0;
          border-radius: 6px;
          background: #1a1c1b;
          color: #fff;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .save-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .message {
          margin-top: 12px;
          padding: 13px 16px;
          font-size: 10px;
          font-weight: 700;
        }

        .message.success {
          border-color: #cbd9c5;
          background: #edf3ea;
          color: #4c6248;
        }

        .message.error {
          border-color: #e1caca;
          background: #f7ecec;
          color: #8a5757;
        }

        @media (max-width: 900px) {
          .connectivity-row {
            grid-template-columns: 70px 1fr;
          }

          .connectivity-row
            .field.destination-field {
            grid-column: 2;
          }

          .toggle-field {
            grid-column: 2;
          }

          .remove-button {
            grid-column: 2;
            justify-self: start;
          }
        }

        @media (max-width: 720px) {
          .page-header {
            padding: 0 20px;
          }

          .page-content {
            width: min(
              calc(100% - 28px),
              680px
            );
            padding-top: 28px;
          }

          .page-intro {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-section {
            padding: 18px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field-full {
            grid-column: auto;
          }

          .section-heading {
            flex-direction: column;
          }

          .save-bar {
            align-items: stretch;
            flex-direction: column;
          }

          .save-button {
            width: 100%;
          }
        }

        @media (max-width: 560px) {
          .brand-logo {
            width: 94px;
          }

          .divider {
            display: none;
          }

          .page-name {
            font-size: 10px;
          }

          .connectivity-row {
            grid-template-columns: 1fr;
          }

          .connectivity-row
            .field.destination-field,
          .toggle-field,
          .remove-button {
            grid-column: auto;
          }

          .order-box input {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
