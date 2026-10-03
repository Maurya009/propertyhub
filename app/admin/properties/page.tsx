/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../../lib/api";

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
  floorPlan?: string;
  image?: string;
};

const bhkOptions = ["All", "2 BHK", "3 BHK"];
const statusOptions = ["All", "Available", "Coming Soon", "Sold Out"];

export default function ResidencesPage() {
  const [residences, setResidences] = useState<Residence[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [bhkFilter, setBhkFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  async function loadResidences() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${getBrowserApiUrl()}/properties`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load residences."
        );
      }

      setResidences(
        Array.isArray(data.data) ? data.data : []
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load residences."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResidences();
  }, []);

  const filteredResidences = useMemo(() => {
    const query = search.trim().toLowerCase();

    return residences.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.title,
          item.location,
          item.bhk,
          item.unitType,
          item.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );

      const matchesBhk =
        bhkFilter === "All" ||
        String(item.bhk) === bhkFilter;

      const matchesStatus =
        statusFilter === "All" ||
        String(item.status) === statusFilter;

      return (
        matchesSearch &&
        matchesBhk &&
        matchesStatus
      );
    });
  }, [
    residences,
    search,
    bhkFilter,
    statusFilter,
  ]);

  async function deleteResidence(item: Residence) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      setMessage("");

      const response = await fetch(
        `${getBrowserApiUrl()}/properties/${item._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete residence."
        );
      }

      setResidences((current) =>
        current.filter(
          (residence) =>
            residence._id !== item._id
        )
      );

      setMessage("Residence deleted successfully.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete residence."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getStatusClass(status?: string) {
    if (status === "Sold Out") return "sold";
    if (status === "Coming Soon") return "soon";
    return "available";
  }

  const twoBhkCount = residences.filter(
    (item) =>
      String(item.bhk)
        .toLowerCase()
        .includes("2 bhk")
  ).length;

  const threeBhkCount = residences.filter(
    (item) =>
      String(item.bhk)
        .toLowerCase()
        .includes("3 bhk")
  ).length;

  return (
    <main className="residences-page">
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
            Residences
          </span>
        </div>

        <Link
          href="/admin/properties/new"
          className="add-button"
        >
          + Add Residence
        </Link>
      </header>

      <div className="page-container">
        <section className="summary-grid">
          <div className="summary-card">
            <span>Total Residences</span>
            <strong>
              {loading ? "—" : residences.length}
            </strong>
          </div>

          <div className="summary-card">
            <span>2 BHK</span>
            <strong>
              {loading ? "—" : twoBhkCount}
            </strong>
          </div>

          <div className="summary-card">
            <span>3 BHK</span>
            <strong>
              {loading ? "—" : threeBhkCount}
            </strong>
          </div>
        </section>

        <section className="filters">
          <div className="search">
            <span>⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search residences..."
            />
          </div>

          <select
            value={bhkFilter}
            onChange={(event) =>
              setBhkFilter(event.target.value)
            }
          >
            {bhkOptions.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option === "All"
                  ? "All BHK"
                  : option}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            {statusOptions.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option === "All"
                  ? "All Status"
                  : option}
              </option>
            ))}
          </select>
        </section>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <section className="inventory">
          <div className="inventory-header">
            <div>
              <span>INVENTORY</span>
              <h2>Website residences</h2>
            </div>

            <small>
              {filteredResidences.length} shown
            </small>
          </div>

          {loading ? (
            <div className="empty">
              Loading residences…
            </div>
          ) : residences.length === 0 ? (
            <div className="empty empty-large">
              <div className="empty-symbol">+</div>

              <h3>No residences added yet</h3>

              <p>
                Add a 2 BHK or 3 BHK residence to
                start managing your website inventory.
              </p>

              <Link
                href="/admin/properties/new"
                className="button primary"
              >
                Add Residence
              </Link>
            </div>
          ) : filteredResidences.length === 0 ? (
            <div className="empty empty-large">
              <h3>No matching residences</h3>

              <p>
                Try changing the search or filters.
              </p>
            </div>
          ) : (
            <div className="residence-list">
              {filteredResidences.map((item) => (
                <article
                  className="residence-row"
                  key={item._id}
                >
                  <div className="residence-visual">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                      />
                    ) : (
                      <div className="no-image">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="residence-content">
                    <div className="residence-top">
                      <span className="configuration">
                        {item.bhk || "Residence"}
                        {item.unitType
                          ? ` · ${item.unitType}`
                          : ""}
                      </span>

                      <span
                        className={`status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status ||
                          "Available"}
                      </span>
                    </div>

                    <h3>{item.title}</h3>

                    <p className="location">
                      {item.location ||
                        "Sector 89A, Gurugram"}
                    </p>

                    <div className="areas">
                      <div>
                        <span>Carpet Area</span>
                        <strong>
                          {item.carpetArea || "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Balcony Area</span>
                        <strong>
                          {item.balconyArea || "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Super Area</span>
                        <strong>
                          {item.superArea || "—"}
                        </strong>
                      </div>
                    </div>

                    <div className="actions">
                    <Link
                          href={`/admin/properties/${item._id}/edit`}
                          className="action edit"
                        >
                          Edit
                        </Link>

                      <button
                        type="button"
                        className="action delete"
                        disabled={
                          deletingId === item._id
                        }
                        onClick={() =>
                          void deleteResidence(item)
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
        .residences-page {
          min-height: 100vh;
          background: #f3eee6;
          color: #1c1b19;
          padding: 30px 24px 60px;
        }

        .page-container {
          width: min(1180px, 100%);
          margin: 0 auto;
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

        .add-button {
          justify-self: end;
          min-height: 37px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 6px;
          background: #1a1c1b;
          color: #ffffff;
          text-decoration: none;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .add-button:hover {
          background: #2b2d2b;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 20px 0;
        }

        .summary-card {
          min-height: 88px;
          padding: 15px 17px;
          background: #fffdf8;
          border: 1px solid
            rgba(28, 27, 25, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .summary-card span {
          color: #8c8070;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .summary-card strong {
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 28px;
          font-weight: 500;
          line-height: 1;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 160px 175px;
          gap: 9px;
          margin-bottom: 12px;
        }

        .search,
        .filters select {
          height: 43px;
          background: #fffdf8;
          border: 1px solid
            rgba(28, 27, 25, 0.12);
        }

        .search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
        }

        .search > span {
          color: #9a8e7d;
        }

        .search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font: inherit;
          font-size: 12px;
        }

        .filters select {
          padding: 0 10px;
          color: #5e554b;
          outline: 0;
          font: inherit;
          font-size: 11px;
        }

        .message {
          margin-bottom: 12px;
          padding: 10px 12px;
          background: #eee4d8;
          color: #6d5e4e;
          font-size: 11px;
        }

        .inventory {
          background: #fffdf8;
          border: 1px solid
            rgba(28, 27, 25, 0.09);
        }

        .inventory-header {
          min-height: 76px;
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid
            rgba(28, 27, 25, 0.08);
        }

        .inventory-header > div > span {
          color: #8c7f6f;
          font-size: 9px;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .inventory-header h2 {
          margin: 5px 0 0;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 24px;
          font-weight: 500;
        }

        .inventory-header small {
          color: #95897a;
          font-size: 10px;
        }

        .residence-list {
          display: flex;
          flex-direction: column;
        }

        .residence-row {
          display: grid;
          grid-template-columns: 200px 1fr;
          min-height: 205px;
          border-bottom: 1px solid
            rgba(28, 27, 25, 0.08);
        }

        .residence-row:last-child {
          border-bottom: 0;
        }

        .residence-visual {
          min-height: 205px;
          background: #eee7dd;
        }

        .residence-visual img,
        .no-image {
          width: 100%;
          height: 100%;
          min-height: 205px;
          display: block;
          object-fit: cover;
        }

        .no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a09383;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .residence-content {
          padding: 19px 21px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .residence-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .configuration {
          color: #8a7d6c;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.11em;
        }

        .status {
          padding: 5px 7px;
          font-size: 8px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .status.available {
          color: #52685a;
          background: #e6eee8;
        }

        .status.soon {
          color: #76592f;
          background: #f1e7d5;
        }

        .status.sold {
          color: #70685d;
          background: #ebe7e0;
        }

        .residence-content h3 {
          margin: 8px 0 4px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 25px;
          font-weight: 500;
        }

        .location {
          margin: 0 0 15px;
          color: #877b6d;
          font-size: 11px;
        }

        .areas {
          display: flex;
          gap: 30px;
          padding-top: 12px;
          border-top: 1px solid
            rgba(28, 27, 25, 0.08);
        }

        .areas div span,
        .areas div strong {
          display: block;
        }

        .areas div span {
          margin-bottom: 4px;
          color: #988c7c;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .areas div strong {
          color: #4f483f;
          font-size: 11px;
          font-weight: 500;
        }

        .actions {
          display: flex;
          gap: 7px;
          margin-top: 14px;
        }

        .action {
          padding: 8px 12px;
          border: 1px solid
            rgba(28, 27, 25, 0.13);
          background: transparent;
          font: inherit;
          font-size: 10px;
          cursor: pointer;
        }

        .action.edit {
          color: #1c1b19;
          background: #f7f2e9;
          border-color: rgba(28, 27, 25, 0.14);
          text-decoration: none;
          cursor: pointer;
        }

        .action.edit:hover {
          background: #eee6d9;
        }

        .action.delete {
          background: #f5e8e4;
          color: #753f37;
          border-color: rgba(
            117,
            63,
            55,
            0.18
          );
        }

        .action:disabled {
          opacity: 0.5;
        }

        .empty {
          min-height: 130px;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #867a6b;
        }

        .empty-large {
          min-height: 330px;
          align-items: center;
          text-align: center;
        }

        .empty-symbol {
          width: 45px;
          height: 45px;
          margin-bottom: 10px;
          border: 1px solid
            rgba(28, 27, 25, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 23px;
        }

        .empty h3 {
          margin: 0 0 5px;
          color: #433c34;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 22px;
          font-weight: 500;
        }

        .empty p {
          max-width: 420px;
          margin: 0 0 14px;
          color: #8b7f70;
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 800px) {
          .page-header {
            padding: 0 20px;
          }

          .filters {
            grid-template-columns: 1fr 1fr;
          }

          .search {
            grid-column: 1 / -1;
          }

          .residence-row {
            grid-template-columns: 145px 1fr;
          }
        }

        @media (max-width: 600px) {
          .residences-page {
            padding: 0 0 45px;
          }

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
            grid-template-columns: repeat(3, 1fr);
          }

          .filters,
          .residence-row {
            grid-template-columns: 1fr;
          }

          .residence-visual {
            min-height: 180px;
          }

          .residence-visual img,
          .no-image {
            min-height: 180px;
          }

          .areas {
            gap: 18px;
            flex-wrap: wrap;
          }
        }
      `}
      </style>
    </main>
  );
}
