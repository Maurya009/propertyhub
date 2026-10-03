/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../lib/api";

type Residence = {
  _id: string;
  title: string;
  bhk?: string;
  unitType?: string;
  status?: string;
  superArea?: string;
};

type EnquiryStatus = "New" | "Contacted" | "Closed";

type Enquiry = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status: EnquiryStatus;
  createdAt?: string;
};

type ContactEnquiry = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status?: EnquiryStatus;
  createdAt?: string;
};

type Activity = {
  id: string;
  name: string;
  phone: string;
  type: "Residence" | "Contact";
  status: EnquiryStatus;
  createdAt?: string;
};

export default function AdminDashboard() {
  const [residences, setResidences] = useState<Residence[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [contactEnquiries, setContactEnquiries] = useState<
    ContactEnquiry[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setMessage("");

      const api = getBrowserApiUrl();

      const [
        residencesResponse,
        enquiriesResponse,
        contactResponse,
      ] = await Promise.all([
        fetch(`${api}/properties`, {
          credentials: "include",
        }),
        fetch(`${api}/enquiries`, {
          credentials: "include",
        }),
        fetch(`${api}/contact-enquiries`, {
          credentials: "include",
        }),
      ]);

      const residencesData = await residencesResponse.json();
      const enquiriesData = await enquiriesResponse.json();
      const contactData = await contactResponse.json();

      setResidences(
        Array.isArray(residencesData?.data)
          ? residencesData.data
          : []
      );

      setEnquiries(
        Array.isArray(enquiriesData?.data)
          ? enquiriesData.data
          : []
      );

      setContactEnquiries(
        Array.isArray(contactData?.data)
          ? contactData.data
          : []
      );
    } catch (error) {
      console.error(error);
      setMessage("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const twoBhk = residences.filter((item) =>
      String(item.bhk).toLowerCase().includes("2 bhk")
    ).length;

    const threeBhk = residences.filter((item) =>
      String(item.bhk).toLowerCase().includes("3 bhk")
    ).length;

    const newResidence = enquiries.filter(
      (item) => item.status === "New"
    ).length;

    const newContact = contactEnquiries.filter(
      (item) => !item.status || item.status === "New"
    ).length;

    return {
      residences: residences.length,
      twoBhk,
      threeBhk,
      enquiries: newResidence + newContact,
    };
  }, [residences, enquiries, contactEnquiries]);

  const activities = useMemo<Activity[]>(() => {
    const residenceItems: Activity[] = enquiries.map((item) => ({
      id: item._id,
      name: item.name,
      phone: item.phone,
      type: "Residence",
      status: item.status,
      createdAt: item.createdAt,
    }));

    const contactItems: Activity[] = contactEnquiries.map((item) => ({
      id: item._id,
      name: item.name,
      phone: item.phone,
      type: "Contact",
      status: item.status || "New",
      createdAt: item.createdAt,
    }));

    return [...residenceItems, ...contactItems]
      .sort((a, b) => {
        const aDate = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const bDate = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return bDate - aDate;
      })
      .slice(0, 6);
  }, [enquiries, contactEnquiries]);

  async function updateStatus(
    id: string,
    status: EnquiryStatus
  ) {
    try {
      setUpdatingId(id);

      const response = await fetch(
        `${getBrowserApiUrl()}/enquiries/${id}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update enquiry."
        );
      }

      setEnquiries((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, status }
            : item
        )
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update enquiry."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function logout() {
    try {
      await fetch(`${getBrowserApiUrl()}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/admin/login";
    }
  }

  function formatDate(value?: string) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-mark">
            <img
              src="/brand/ym-realty-logo.png"
              alt="YM Realty"
            />
          </div>

          <div className="sidebar-identity">
            <strong>Admin Portal</strong>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-label">Overview</span>

          <a
            href="#top"
            className="nav-item active"
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
              </svg>
            </span>

            <span>Dashboard</span>
          </a>

          <span className="nav-label">Website</span>

          <Link
            href="/admin/properties"
            className="nav-item"
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 20V8.5L12 4l7 4.5V20" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </span>

            <span>Residences</span>
          </Link>

          <Link
            href="/admin/gallery"
            className="nav-item"
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <circle cx="9" cy="9" r="1.5" />
                <path d="m6 17 4.5-4.5L14 16l2-2 2 3" />
              </svg>
            </span>

            <span>Gallery</span>
          </Link>

          <Link
            href="/admin/content"
            className="nav-item"
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 5h14v14H5z" />
                <path d="M8 9h8M8 13h6" />
              </svg>
            </span>

            <span>Project Content</span>
          </Link>

          <Link
            href="/admin/amenities"
            className="nav-item"
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6 19V9h12v10" />
                <path d="M8 9V6h8v3M9 14h6M9 17h6" />
              </svg>
            </span>

            <span>Amenities</span>
          </Link>

          <Link
            href="/admin/location"
            className="nav-item"
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
                <circle cx="12" cy="11" r="2" />
              </svg>
            </span>

            <span>Location</span>
          </Link>

          <span className="nav-label">Leads</span>

          <Link
            href="/admin/enquiries"
            className="nav-item"
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>

            <span>Enquiries</span>

            {stats.enquiries > 0 && (
              <strong className="nav-count">
                {stats.enquiries}
              </strong>
            )}
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-logout"
            onClick={logout}
          >
            <span>Logout</span>
            <span className="sidebar-arrow">↗</span>
          </button>
        </div>
      </aside>

      <section className="main-area" id="top">
        <header className="main-header">
          <div className="header-copy">
            <div className="breadcrumb">
              <span>ADMIN</span>
            </div>

            <h1>Dashboard</h1>

            <p>
              A central workspace for your website,
              residences and enquiries.
            </p>
          </div>

          <div className="header-tools">
            <div className="session-status">
              <span className="status-dot" />
              <span>Session active</span>
            </div>

            <Link
              href="/"
              className="view-site-button"
            >
              View website
              <span>↗</span>
            </Link>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card primary-stat">
            <div className="stat-card-top">
              <span className="stat-label">
                Total Residences
              </span>

              <span className="stat-symbol">01</span>
            </div>

            <div className="stat-card-bottom">
              <strong>
                {loading ? "—" : stats.residences}
              </strong>

              <small>Current inventory</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">
                2 BHK
              </span>

              <span className="stat-symbol">02</span>
            </div>

            <div className="stat-card-bottom">
              <strong>
                {loading ? "—" : stats.twoBhk}
              </strong>

              <small>Residential units</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">
                3 BHK
              </span>

              <span className="stat-symbol">03</span>
            </div>

            <div className="stat-card-bottom">
              <strong>
                {loading ? "—" : stats.threeBhk}
              </strong>

              <small>Residential units</small>
            </div>
          </div>

          <div className="stat-card enquiry-stat">
            <div className="stat-card-top">
              <span className="stat-label">
                New Enquiries
              </span>

              <span className="stat-symbol">04</span>
            </div>

            <div className="stat-card-bottom">
              <strong>
                {loading ? "—" : stats.enquiries}
              </strong>

              <small>Requires attention</small>
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                WEBSITE MANAGEMENT
              </span>

              <h2>Manage your site</h2>
            </div>

            <p>
              Content, media and project information
            </p>
          </div>

          <div className="module-grid">
            <Link
              href="/admin/properties"
              className="module-card featured-module"
            >
              <div className="module-top">
                <span>01</span>
                <span className="module-icon">↗</span>
              </div>

              <div className="module-content">
                <span className="module-mini-label">
                  INVENTORY
                </span>

                <h3>Residences</h3>

                <p>
                  Add and manage 2 BHK and 3 BHK
                  residences, areas and floor plans.
                </p>
              </div>

              <div className="module-footer">
                <span>Manage residences</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/admin/gallery"
              className="module-card"
            >
              <div className="module-top">
                <span>02</span>
                <span className="module-icon">↗</span>
              </div>

              <div className="module-content">
                <span className="module-mini-label">
                  MEDIA
                </span>

                <h3>Gallery</h3>

                <p>
                  Manage website visuals, categories,
                  featured images and ordering.
                </p>
              </div>

              <div className="module-footer">
                <span>Manage gallery</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/admin/content"
              className="module-card"
            >
              <div className="module-top">
                <span>03</span>
                <span className="module-icon">↗</span>
              </div>

              <div className="module-content">
                <span className="module-mini-label">
                  CONTENT
                </span>

                <h3>Project Content</h3>

                <p>
                  Manage website headlines, text,
                  statistics and page content.
                </p>
              </div>

              <div className="module-footer">
                <span>Manage content</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/admin/amenities"
              className="module-card"
            >
              <div className="module-top">
                <span>04</span>
                <span className="module-icon">↗</span>
              </div>

              <div className="module-content">
                <span className="module-mini-label">
                  LIFESTYLE
                </span>

                <h3>Amenities</h3>

                <p>
                  Add, remove and organise the
                  amenities shown on the website.
                </p>
              </div>

              <div className="module-footer">
                <span>Manage amenities</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/admin/location"
              className="module-card"
            >
              <div className="module-top">
                <span>05</span>
                <span className="module-icon">↗</span>
              </div>

              <div className="module-content">
                <span className="module-mini-label">
                  CONNECTIVITY
                </span>

                <h3>Location</h3>

                <p>
                  Manage connectivity, destinations
                  and location information.
                </p>
              </div>

              <div className="module-footer">
                <span>Manage location</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/admin/enquiries"
              className="module-card dark-module"
            >
              <div className="module-top">
                <span>06</span>
                <span className="module-icon">↗</span>
              </div>

              <div className="module-content">
                <span className="module-mini-label">
                  LEADS
                </span>

                <h3>Enquiries</h3>

                <p>
                  Review website enquiries and update
                  lead status.
                </p>
              </div>

              <div className="module-footer">
                <span>Manage enquiries</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </section>

        <section
          className="dashboard-grid"
          id="enquiries"
        >
          <div className="panel">
            <div className="panel-head">
              <div>
                <span className="section-kicker">
                  LEADS
                </span>

                <h2>Recent enquiries</h2>

                <p>
                  The latest enquiries from your website.
                </p>
              </div>

              <span className="panel-count">
                {activities.length}
              </span>
            </div>

            {loading ? (
              <div className="empty">
                <div className="empty-loader" />
                <span>Loading enquiries…</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="empty">
                <strong>No enquiries yet.</strong>

                <span>
                  Website enquiries will appear here.
                </span>
              </div>
            ) : (
              <div className="list">
                {activities.map((item) => (
                  <div
                    className="list-row enquiry-row"
                    key={`${item.type}-${item.id}`}
                  >
                    <div className="list-main">
                      <strong>{item.name}</strong>

                      <span>
                        {item.type} · {item.phone}
                      </span>
                    </div>

                    <div className="enquiry-meta">
                      <div className="enquiry-top-line">
                        <span
                          className={`status ${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>

                        <small>
                          {formatDate(item.createdAt)}
                        </small>
                      </div>

                      {item.type === "Residence" && (
                        <select
                          value={item.status}
                          disabled={
                            updatingId === item.id
                          }
                          onChange={(event) =>
                            void updateStatus(
                              item.id,
                              event.target
                                .value as EnquiryStatus
                            )
                          }
                        >
                          <option value="New">
                            New
                          </option>

                          <option value="Contacted">
                            Contacted
                          </option>

                          <option value="Closed">
                            Closed
                          </option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {message && (
          <div className="message">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}
      </section>

      <style jsx>{`
        .admin-shell {
          min-height: 100vh;
          display: flex;
          background: #f5f4f1;
          color: #171817;
        }

        /* --------------------------------
           SIDEBAR
        -------------------------------- */

        .sidebar {
          width: 252px;
          min-width: 252px;
          min-height: 100vh;
          padding: 24px 16px 18px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          background: #151616;
          color: #f7f5f0;
          border-right: 1px solid rgba(0, 0, 0, 0.08);
        }

        .sidebar-top {
          padding: 3px 8px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
        }

        .brand-mark {
          display: flex;
          align-items: center;
          min-height: 42px;
          margin-bottom: 16px;
        }

        .brand-mark img {
          width: 126px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .sidebar-identity span {
          display: block;
          margin-bottom: 4px;
          color: rgba(255, 255, 255, 0.38);
          font-size: 8px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .sidebar-identity strong {
          display: block;
          color: rgba(255, 255, 255, 0.88);
          font-size: 13px;
          line-height: 1.2;
          font-weight: 500;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 20px 0;
        }

        .nav-label {
          margin: 14px 9px 7px;
          color: rgba(255, 255, 255, 0.29);
          font-size: 8px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .nav-item {
          min-height: 42px;
          padding: 0 10px;
          border: 1px solid transparent;
          border-radius: 7px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 11px;
          color: rgba(255, 255, 255, 0.57);
          background: transparent;
          text-decoration: none;
          font: inherit;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          transition:
            background 180ms ease,
            color 180ms ease,
            border-color 180ms ease;
        }

        .nav-item:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.045);
          border-color: rgba(255, 255, 255, 0.04);
        }

        .nav-item.active {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.06);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.36);
        }

        .nav-item.active .nav-icon {
          color: #c2a978;
        }

        .nav-icon svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.45;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .nav-item em {
          margin-left: auto;
          padding: 4px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.045);
          color: rgba(255, 255, 255, 0.28);
          font-style: normal;
          font-size: 7px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .nav-item.disabled {
          cursor: default;
          opacity: 0.72;
        }

        .nav-item.disabled:hover {
          color: rgba(255, 255, 255, 0.57);
          background: transparent;
          border-color: transparent;
        }

        .nav-count {
          margin-left: auto;
          min-width: 22px;
          height: 22px;
          padding: 0 5px;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #c2a978;
          color: #171817;
          font-size: 8px;
          font-weight: 800;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.09);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-link,
        .sidebar-logout {
          min-height: 39px;
          padding: 0 10px;
          border: 1px solid transparent;
          border-radius: 7px;
          box-sizing: border-box;
          background: transparent;
          color: rgba(255, 255, 255, 0.53);
          text-decoration: none;
          font: inherit;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition:
            color 180ms ease,
            background 180ms ease;
        }

        .sidebar-link:hover,
        .sidebar-logout:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.04);
        }

        .sidebar-arrow {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.28);
        }

        /* --------------------------------
           MAIN
        -------------------------------- */

        .main-area {
          flex: 1;
          min-width: 0;
          padding: 32px 38px 52px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .main-header {
          min-height: 92px;
          padding-bottom: 25px;
          border-bottom: 1px solid #e2e0dc;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #aaa6a0;
          font-size: 8px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .breadcrumb-line {
          width: 18px;
          height: 1px;
          background: #c5a978;
        }

        .header-copy h1 {
          margin: 9px 0 5px;
          color: #181918;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 41px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .header-copy p {
          margin: 0;
          color: #817e77;
          font-size: 12px;
          line-height: 1.6;
        }

        .header-tools {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 2px;
        }

        .session-status {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #85827b;
          font-size: 9px;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #718778;
          box-shadow: 0 0 0 3px rgba(113, 135, 120, 0.1);
        }

        .view-site-button {
          min-height: 36px;
          padding: 0 12px;
          border: 1px solid #dedbd5;
          border-radius: 6px;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #242522;
          background: #ffffff;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          transition:
            background 180ms ease,
            border-color 180ms ease,
            transform 180ms ease;
        }

        .view-site-button:hover {
          background: #f9f8f5;
          border-color: #cfcac2;
          transform: translateY(-1px);
        }

        .view-site-button span {
          color: #a48c5e;
          font-size: 13px;
        }

        /* --------------------------------
           STATS
        -------------------------------- */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin: 20px 0 42px;
        }

        .stat-card {
          min-height: 125px;
          padding: 18px;
          border: 1px solid #e3e1dc;
          border-radius: 8px;
          box-sizing: border-box;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: #d6d1c8;
          box-shadow: 0 10px 28px rgba(28, 27, 24, 0.055);
        }

        .stat-card.primary-stat {
          background: #191a19;
          border-color: #191a19;
          color: #ffffff;
        }

        .stat-card.enquiry-stat {
          background: #eee7db;
          border-color: #e6ddcf;
        }

        .stat-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .stat-label {
          color: #79766f;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .primary-stat .stat-label {
          color: rgba(255, 255, 255, 0.47);
        }

        .stat-symbol {
          color: #b7afa3;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .primary-stat .stat-symbol {
          color: #c3a978;
        }

        .stat-card-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
        }

        .stat-card strong {
          color: #1a1b19;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 36px;
          line-height: 0.95;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .primary-stat strong {
          color: #ffffff;
        }

        .stat-card small {
          padding-bottom: 2px;
          color: #9a958c;
          font-size: 9px;
          white-space: nowrap;
        }

        .primary-stat small {
          color: rgba(255, 255, 255, 0.38);
        }

        /* --------------------------------
           MANAGEMENT MODULES
        -------------------------------- */

        .section-block {
          margin-bottom: 14px;
        }

        .section-heading {
          margin-bottom: 17px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .section-kicker {
          display: block;
          color: #a08c6c;
          font-size: 8px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .section-heading h2 {
          margin: 7px 0 0;
          color: #1a1b19;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.025em;
        }

        .section-heading p {
          margin: 0;
          color: #9a968e;
          font-size: 10px;
        }

        .module-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .module-card {
          min-height: 190px;
          padding: 18px;
          border: 1px solid #e2e0db;
          border-radius: 8px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff;
          color: #191a19;
          text-decoration: none;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .module-card:hover {
          transform: translateY(-3px);
          border-color: #d2cdc4;
          box-shadow: 0 13px 30px rgba(28, 27, 24, 0.065);
        }

        .module-card.featured-module {
          background: #fdfbf7;
          border-color: #ddd5c7;
        }

        .module-card.coming {
          background: #faf9f6;
        }

        .module-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #a8a093;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .module-icon {
          color: #9a8868;
          font-size: 13px;
        }

        .module-content {
          padding: 18px 0 22px;
        }

        .module-mini-label {
          display: block;
          margin-bottom: 7px;
          color: #aaa39a;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .module-content h3 {
          margin: 0 0 7px;
          color: #1b1c1a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          line-height: 1.05;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .module-content p {
          max-width: 290px;
          margin: 0;
          color: #7d7971;
          font-size: 11px;
          line-height: 1.58;
        }

        .module-footer {
          padding-top: 12px;
          border-top: 1px solid #ebe9e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #8e887e;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .dark-module {
          border-color: #191a19;
          background: #191a19;
          color: #ffffff;
        }

        .dark-module .module-top {
          color: rgba(255, 255, 255, 0.3);
        }

        .dark-module .module-icon {
          color: #c1a677;
        }

        .dark-module .module-mini-label {
          color: rgba(255, 255, 255, 0.35);
        }

        .dark-module .module-content h3 {
          color: #ffffff;
        }

        .dark-module .module-content p {
          color: rgba(255, 255, 255, 0.55);
        }

        .dark-module .module-footer {
          color: rgba(255, 255, 255, 0.48);
          border-color: rgba(255, 255, 255, 0.1);
        }

        /* --------------------------------
           LOWER PANELS
        -------------------------------- */

        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .panel {
          min-width: 0;
          padding: 20px;
          border: 1px solid #e2e0db;
          border-radius: 8px;
          background: #ffffff;
        }

        .panel-head {
          min-height: 59px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eceae6;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .panel-head h2 {
          margin: 6px 0 0;
          color: #1b1c1a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .panel-head p {
          margin: 8px 0 0;
          color: #99958d;
          font-size: 9px;
          line-height: 1.5;
        }

        .panel-action {
          min-height: 33px;
          padding: 0 10px;
          border: 1px solid #ddd9d2;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2b2c29;
          background: #fbfaf7;
          text-decoration: none;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          transition:
            background 180ms ease,
            border-color 180ms ease;
        }

        .panel-action:hover {
          background: #f6f4ef;
          border-color: #cbc5bb;
        }

        .panel-action span {
          color: #a78e5c;
          font-size: 12px;
        }

        .panel-count {
          min-width: 29px;
          height: 29px;
          padding: 0 7px;
          box-sizing: border-box;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f1eadf;
          color: #766344;
          font-size: 9px;
          font-weight: 800;
        }

        .list {
          border-top: 1px solid #eceae6;
        }

        .list-row {
          min-height: 66px;
          padding: 10px 0;
          box-sizing: border-box;
          border-bottom: 1px solid #eceae6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .list-main {
          min-width: 0;
        }

        .list-row strong {
          display: block;
          margin-bottom: 5px;
          color: #252623;
          font-size: 11px;
          line-height: 1.35;
          font-weight: 700;
        }

        .list-row span {
          color: #928d84;
          font-size: 9px;
          line-height: 1.4;
        }

        .list-meta {
          flex: 0 0 auto;
          min-width: 88px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          text-align: right;
        }

        .list-meta strong {
          margin: 0;
          color: #5f5a52;
          font-size: 10px;
        }

        .inventory-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #667a6d !important;
          font-size: 8px !important;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .inventory-status i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #768c7c;
        }

        .enquiry-meta {
          flex: 0 0 auto;
          min-width: 155px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 7px;
        }

        .enquiry-top-line {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .enquiry-meta small {
          color: #a29d95;
          font-size: 8px;
        }

        .enquiry-meta select {
          min-height: 25px;
          padding: 0 7px;
          border: 1px solid #e0ddd7;
          border-radius: 5px;
          background: #fbfaf8;
          color: #5e594f;
          outline: none;
          font-size: 8px;
        }

        .status {
          padding: 5px 7px;
          border-radius: 4px;
          font-size: 7px !important;
          line-height: 1 !important;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .status.new {
          background: #f2e8d9;
          color: #7a6038 !important;
        }

        .status.contacted {
          background: #e7eee9;
          color: #557062 !important;
        }

        .status.closed {
          background: #eceae6;
          color: #716c64 !important;
        }

        .empty {
          min-height: 122px;
          border-top: 1px solid #eceae6;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          gap: 6px;
        }

        .empty strong {
          color: #2a2b28;
          font-size: 11px;
        }

        .empty span {
          color: #99958d;
          font-size: 9px;
          line-height: 1.5;
        }

        .empty-loader {
          width: 14px;
          height: 14px;
          margin-bottom: 3px;
          border: 1px solid #d4cec3;
          border-top-color: #a58d60;
          border-radius: 50%;
          animation: dashboardSpin 700ms linear infinite;
        }

        .message {
          margin-top: 11px;
          padding: 11px 13px;
          border: 1px solid #e7d9c6;
          border-radius: 6px;
          background: #f3eadf;
          color: #765f41;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .message button {
          width: 20px;
          height: 20px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #8c7450;
          cursor: pointer;
          font-size: 15px;
          line-height: 1;
        }

        @keyframes dashboardSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* --------------------------------
           TABLET
        -------------------------------- */

        @media (max-width: 1120px) {
          .sidebar {
            width: 220px;
            min-width: 220px;
          }

          .main-area {
            padding: 28px 25px 45px;
          }

          .module-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* --------------------------------
           MOBILE
        -------------------------------- */

        @media (max-width: 760px) {
          .admin-shell {
            display: block;
            min-height: 100vh;
          }

          .sidebar {
            width: 100%;
            min-width: 0;
            min-height: auto;
            padding: 14px;
          }

          .sidebar-top {
            padding: 2px 6px 15px;
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .brand-mark {
            min-height: 35px;
            margin: 0;
          }

          .brand-mark img {
            width: 96px;
          }

          .sidebar-identity {
            padding-left: 14px;
            border-left: 1px solid rgba(255, 255, 255, 0.12);
          }

          .sidebar-identity span {
            font-size: 7px;
          }

          .sidebar-identity strong {
            font-size: 11px;
          }

          .sidebar-nav {
            padding: 12px 0 2px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 3px;
          }

          .nav-label {
            grid-column: 1 / -1;
            margin: 9px 5px 2px;
          }

          .nav-item {
            min-height: 38px;
            padding: 0 8px;
            font-size: 9px;
          }

          .nav-icon {
            width: 17px;
            height: 17px;
            flex-basis: 17px;
          }

          .nav-icon svg {
            width: 13px;
            height: 13px;
          }

          .sidebar-bottom {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-top: 10px;
            padding-top: 10px;
          }

          .main-area {
            padding: 24px 14px 38px;
          }

          .main-header {
            min-height: auto;
            padding-bottom: 20px;
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .header-copy h1 {
            font-size: 35px;
          }

          .header-tools {
            width: 100%;
            justify-content: space-between;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin: 16px 0 34px;
          }

          .stat-card {
            min-height: 110px;
            padding: 14px;
          }

          .stat-card strong {
            font-size: 30px;
          }

          .stat-card-bottom {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

          .section-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
          }

          .module-grid,
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .module-card {
            min-height: 170px;
          }

          .dashboard-grid {
            margin-top: 12px;
          }

          .panel {
            padding: 16px;
          }

          .panel-head {
            gap: 12px;
          }

          .list-row {
            align-items: flex-start;
          }

          .list-meta,
          .enquiry-meta {
            min-width: 0;
          }

          .enquiry-meta {
            max-width: 135px;
          }
        }

        @media (max-width: 480px) {
          .header-tools {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .view-site-button {
            width: 100%;
            justify-content: space-between;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .stat-label {
            font-size: 7px;
          }

          .stat-card strong {
            font-size: 27px;
          }

          .stat-card small {
            font-size: 8px;
          }

          .panel-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .panel-action {
            width: 100%;
            justify-content: center;
          }

          .list-row {
            gap: 10px;
          }

          .list-main {
            max-width: 52%;
          }

          .list-row strong {
            font-size: 10px;
          }

          .list-row span {
            font-size: 8px;
          }

          .enquiry-meta {
            max-width: 45%;
          }

          .enquiry-top-line {
            flex-wrap: wrap;
          }
        }


        /* YM REALTY COLOR REFINEMENT */

        .admin-shell {
          background:
            radial-gradient(
              circle at 78% 8%,
              rgba(195, 169, 116, 0.08),
              transparent 25%
            ),
            #f3f1ec;
        }

        .sidebar {
          background:
            linear-gradient(
              180deg,
              #151716 0%,
              #171918 55%,
              #121413 100%
            );
          border-right: 1px solid rgba(194, 166, 111, 0.16);
        }

        .sidebar-top {
          border-bottom-color: rgba(194, 166, 111, 0.16);
        }

        .brand-mark img {
          filter: none;
        }

        .sidebar-identity span {
          color: rgba(210, 193, 162, 0.56);
        }

        .sidebar-identity strong {
          color: #f3ede2;
        }

        .nav-label {
          color: rgba(194, 166, 111, 0.58);
        }

        .nav-item {
          color: rgba(247, 244, 238, 0.56);
        }

        .nav-item:hover {
          color: #ffffff;
          background: rgba(194, 166, 111, 0.08);
          border-color: rgba(194, 166, 111, 0.1);
        }

        .nav-item.active {
          color: #ffffff;
          background:
            linear-gradient(
              90deg,
              rgba(194, 166, 111, 0.16),
              rgba(194, 166, 111, 0.05)
            );
          border-color: rgba(194, 166, 111, 0.16);
          box-shadow: inset 2px 0 0 #c2a66f;
        }

        .nav-item.active .nav-icon {
          color: #d1b57d;
        }

        .nav-item em {
          background: rgba(194, 166, 111, 0.08);
          color: rgba(211, 191, 155, 0.48);
        }

        .nav-count {
          background: #c2a66f;
          color: #171817;
          box-shadow: 0 4px 12px rgba(194, 166, 111, 0.18);
        }

        .sidebar-bottom {
          border-top-color: rgba(194, 166, 111, 0.15);
        }

        .main-area {
          background: transparent;
        }

        .main-header {
          border-bottom-color: #ddd9d1;
        }

        .breadcrumb {
          color: #a19a8f;
        }

        .breadcrumb-line {
          background: #b99a63;
        }

        .header-copy h1 {
          color: #171918;
        }

        .header-copy p {
          color: #77736b;
        }

        .session-status {
          color: #7f837d;
        }

        .status-dot {
          background: #718979;
          box-shadow: 0 0 0 4px rgba(113, 137, 121, 0.11);
        }

        .view-site-button {
          border-color: #d8d2c8;
          background: #fbfaf7;
        }

        .view-site-button:hover {
          background: #ffffff;
          border-color: #bfae91;
        }

        .view-site-button span {
          color: #ad8e56;
        }

        /* STAT CARDS */

        .stat-card {
          border-color: #dedad2;
          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #fbfaf7 100%
            );
        }

        .stat-card:hover {
          border-color: #cfc5b5;
          box-shadow:
            0 14px 32px rgba(44, 39, 32, 0.07);
        }

        .stat-card:nth-child(2) {
          background:
            linear-gradient(
              145deg,
              #fbf7ef 0%,
              #f3ede1 100%
            );
          border-color: #e1d7c6;
        }

        .stat-card:nth-child(3) {
          background:
            linear-gradient(
              145deg,
              #f7f8f5 0%,
              #e9eee9 100%
            );
          border-color: #dbe2dc;
        }

        .stat-card.enquiry-stat {
          background:
            linear-gradient(
              145deg,
              #eee7d9 0%,
              #e6dece 100%
            );
          border-color: #ded2bc;
        }

        .stat-card.primary-stat {
          background:
            linear-gradient(
              145deg,
              #1c1f1d 0%,
              #141615 100%
            );
          border-color: #1c1f1d;
        }

        .stat-label {
          color: #77736b;
        }

        .stat-symbol {
          color: #aa9a80;
        }

        .primary-stat .stat-label,
        .primary-stat .stat-symbol {
          color: rgba(225, 207, 171, 0.56);
        }

        .stat-card strong {
          color: #222421;
        }

        .primary-stat strong {
          color: #ffffff;
        }

        .stat-card small {
          color: #8d887f;
        }

        .primary-stat small {
          color: rgba(255, 255, 255, 0.42);
        }

        /* SECTION HEADINGS */

        .section-kicker {
          color: #a18455;
        }

        .section-heading h2 {
          color: #171918;
        }

        .section-heading p {
          color: #918c83;
        }

        /* MODULES */

        .module-card {
          border-color: #dfdcd5;
          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #fbfaf7 100%
            );
        }

        .module-card:hover {
          border-color: #cdbfa8;
          box-shadow:
            0 15px 34px rgba(39, 35, 29, 0.075);
        }

        .module-card.featured-module {
          background:
            linear-gradient(
              145deg,
              #fbf6ed 0%,
              #f2eadc 100%
            );
          border-color: #ded0b7;
        }

        .module-card:nth-child(2) {
          background:
            linear-gradient(
              145deg,
              #fafbf9 0%,
              #eef2ef 100%
            );
          border-color: #dce2dd;
        }

        .module-card:nth-child(3),
        .module-card:nth-child(4),
        .module-card:nth-child(5) {
          background: #faf9f6;
        }

        .module-top {
          color: #aaa08f;
        }

        .module-icon {
          color: #aa8c59;
        }

        .module-mini-label {
          color: #a99b87;
        }

        .module-content h3 {
          color: #1a1c1a;
        }

        .module-content p {
          color: #76736c;
        }

        .module-footer {
          border-top-color: rgba(70, 63, 52, 0.1);
          color: #8a8071;
        }

        .dark-module {
          background:
            linear-gradient(
              145deg,
              #1b1e1c 0%,
              #121514 100%
            );
          border-color: #1b1e1c;
          box-shadow:
            inset 0 1px 0 rgba(194, 166, 111, 0.08);
        }

        .dark-module .module-icon {
          color: #c9ab72;
        }

        /* PANELS */

        .panel {
          border-color: #dfdcd6;
          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #fcfbf8 100%
            );
          box-shadow:
            0 6px 22px rgba(35, 31, 26, 0.025);
        }

        .panel-head {
          border-bottom-color: #e8e4dd;
        }

        .panel-action {
          border-color: #d9d3c9;
          background: #faf8f4;
        }

        .panel-action:hover {
          background: #f2eee7;
          border-color: #c5b89f;
        }

        .panel-action span {
          color: #a7864f;
        }

        .panel-count {
          background:
            linear-gradient(
              145deg,
              #eee5d6,
              #e6dccb
            );
          color: #715d3b;
        }

        .list {
          border-top-color: #e8e5df;
        }

        .list-row {
          border-bottom-color: #e9e6e0;
        }

        .list-row strong {
          color: #252723;
        }

        .list-row span {
          color: #918c83;
        }

        .list-meta strong {
          color: #665e52;
        }

        .inventory-status {
          color: #657c6c !important;
        }

        .inventory-status i {
          background: #708878;
          box-shadow: 0 0 0 3px rgba(112, 136, 120, 0.08);
        }

        .enquiry-meta select {
          border-color: #ddd8cf;
          background: #faf9f6;
        }

        .enquiry-meta select:focus {
          outline: none;
          border-color: #bca77d;
          box-shadow: 0 0 0 3px rgba(188, 167, 125, 0.12);
        }

        .status.new {
          background: #f2e5d0;
          color: #87652e !important;
        }

        .status.contacted {
          background: #e2ece5;
          color: #567160 !important;
        }

        .status.closed {
          background: #eceae6;
          color: #716c64 !important;
        }

        .empty {
          border-top-color: #e8e5df;
        }

        .empty-loader {
          border-color: #ddd5c8;
          border-top-color: #a98b58;
        }

        .message {
          border-color: #dfceb2;
          background:
            linear-gradient(
              145deg,
              #f4ecdf,
              #eee3d3
            );
          color: #735d3d;
        }


        /* YM REALTY ATTRACTIVE COLOR PASS */

        .admin-shell {
          background:
            radial-gradient(
              circle at 82% 5%,
              rgba(196, 166, 108, 0.13),
              transparent 24%
            ),
            radial-gradient(
              circle at 20% 90%,
              rgba(112, 137, 121, 0.08),
              transparent 22%
            ),
            #f3f1ec;
        }

        /* HEADER */

        .breadcrumb span:first-child {
          color: #a18455;
        }

        .breadcrumb span:last-child {
          color: #8d8a83;
        }

        .breadcrumb-line {
          background: #c3a46b;
        }

        /* STATS */

        .stat-card {
          position: relative;
          overflow: hidden;
        }

        .stat-card::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          right: -35px;
          bottom: -45px;
          border-radius: 50%;
          border: 1px solid rgba(177, 146, 91, 0.14);
          pointer-events: none;
        }

        .stat-card:nth-child(2)::after {
          border-color: rgba(166, 132, 74, 0.17);
        }

        .stat-card:nth-child(3)::after {
          border-color: rgba(93, 123, 104, 0.16);
        }

        .stat-card:nth-child(4)::after {
          border-color: rgba(157, 126, 78, 0.18);
        }

        .stat-card.primary-stat {
          background:
            linear-gradient(
              145deg,
              #202522 0%,
              #141716 100%
            );
          box-shadow:
            inset 0 2px 0 rgba(202, 173, 116, 0.78),
            0 10px 28px rgba(20, 23, 22, 0.12);
        }

        .stat-card:nth-child(2) {
          background:
            linear-gradient(
              145deg,
              #fffaf0 0%,
              #f1e6d3 100%
            );
          box-shadow:
            inset 0 2px 0 #c3a46b;
        }

        .stat-card:nth-child(3) {
          background:
            linear-gradient(
              145deg,
              #f5faf7 0%,
              #e3eee7 100%
            );
          box-shadow:
            inset 0 2px 0 #75917d;
        }

        .stat-card:nth-child(4) {
          background:
            linear-gradient(
              145deg,
              #f8f0e2 0%,
              #eadeca 100%
            );
          box-shadow:
            inset 0 2px 0 #bd9558;
        }

        .stat-card:nth-child(2) .stat-label {
          color: #846c43;
        }

        .stat-card:nth-child(3) .stat-label {
          color: #5d7465;
        }

        .stat-card:nth-child(4) .stat-label {
          color: #85673d;
        }

        /* MANAGEMENT TITLE */

        .section-kicker {
          color: #a4814d;
        }

        .section-heading h2 {
          color: #191b19;
        }

        /* MODULE CARDS */

        .module-card {
          position: relative;
          overflow: hidden;
        }

        .module-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 2px;
          background: #d8d2c7;
          opacity: 0.7;
          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }

        .module-card:hover::before {
          opacity: 1;
        }

        .module-card.featured-module,
        .module-card:nth-child(2),
        .module-card:nth-child(3),
        .module-card:nth-child(4),
        .module-card:nth-child(5) {
          background: #ffffff;
          border-color: #dfdcd5;
        }

        .module-card.featured-module::before {
          background: #c3a46b;
        }

        .module-card:nth-child(2)::before {
          background: #789384;
        }

        .module-card:nth-child(3)::before {
          background: #a79b8b;
        }

        .module-card:nth-child(4)::before {
          background: #b49463;
        }

        .module-card:nth-child(5)::before {
          background: #7a94a5;
        }

        .dark-module {
          background:
            linear-gradient(
              145deg,
              #202522 0%,
              #121514 100%
            );
          border-color: #202522;
          box-shadow:
            inset 0 2px 0 #bd9b61,
            0 12px 30px rgba(18, 21, 20, 0.12);
        }

        .dark-module::before {
          display: none;
        }

        .module-card:nth-child(4) .module-icon {
          color: #a8844e;
        }

        .module-card:nth-child(5) .module-icon {
          color: #718ea0;
        }

        /* LOWER PANELS */

        .panel {
          position: relative;
          overflow: hidden;
        }

        .panel::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            90deg,
            #c5a66d,
            #ebe3d5,
            transparent
          );
          opacity: 0.7;
        }

        .panel:nth-child(2)::before {
          background: linear-gradient(
            90deg,
            #789283,
            #e2ebe5,
            transparent
          );
        }

        .panel-count {
          background:
            linear-gradient(
              145deg,
              #f1e5cf,
              #e3d3b7
            );
          color: #765d36;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .inventory-status {
          color: #5e7968 !important;
        }

        .inventory-status i {
          background: #708e7b;
        }

        /* LEAD STATUS COLORS */

        .status.new {
          background: #f3e3c9;
          color: #8a632e !important;
          box-shadow: inset 0 0 0 1px rgba(171, 133, 73, 0.09);
        }

        .status.contacted {
          background: #dfece4;
          color: #4e6f5c !important;
          box-shadow: inset 0 0 0 1px rgba(86, 121, 99, 0.08);
        }

        .status.closed {
          background: #e9e7e3;
          color: #6e6a62 !important;
        }

        /* BUTTON ACCENTS */

        .view-site-button {
          box-shadow: 0 3px 12px rgba(42, 38, 31, 0.04);
        }

        .view-site-button:hover {
          box-shadow: 0 7px 18px rgba(46, 41, 32, 0.07);
        }

        .panel-action:hover {
          color: #6f5936;
        }

        /* SIDEBAR GOLD DETAILS */

        .sidebar-top::after {
          content: "";
          display: block;
          width: 28px;
          height: 1px;
          margin-top: 18px;
          background: #bd9d64;
          opacity: 0.7;
        }

        .nav-item.active {
          box-shadow:
            inset 2px 0 0 #c3a46b,
            0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .nav-item.active .nav-icon {
          color: #d4b577;
        }

        .sidebar-link:hover .sidebar-arrow,
        .sidebar-logout:hover .sidebar-arrow {
          color: #c3a46b;
        }

        /* MESSAGE */

        .message {
          border-color: #dcc9a9;
          background:
            linear-gradient(
              145deg,
              #f6ecdc,
              #ede0cb
            );
          color: #735b38;
        }


        /* FINAL STATS CARD UNIFICATION */

        .stats-grid .stat-card,
        .stats-grid .stat-card.primary-stat,
        .stats-grid .stat-card.enquiry-stat,
        .stats-grid .stat-card:nth-child(2),
        .stats-grid .stat-card:nth-child(3),
        .stats-grid .stat-card:nth-child(4) {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          color: #1a1b19;
          border: 1px solid #ddd9d1;
          box-shadow: none;
        }

        .stats-grid .stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #c3a46b;
        }

        .stats-grid .stat-card:nth-child(2)::before {
          background: #b59a69;
        }

        .stats-grid .stat-card:nth-child(3)::before {
          background: #789384;
        }

        .stats-grid .stat-card:nth-child(4)::before {
          background: #a88452;
        }

        .stats-grid .stat-card::after {
          width: 95px;
          height: 95px;
          right: -38px;
          bottom: -48px;
          border-color: rgba(185, 157, 105, 0.12);
        }

        .stats-grid .stat-card:nth-child(3)::after {
          border-color: rgba(111, 139, 120, 0.12);
        }

        .stats-grid .stat-card:hover,
        .stats-grid .stat-card.primary-stat:hover,
        .stats-grid .stat-card.enquiry-stat:hover {
          background: #ffffff;
          border-color: #cfc7ba;
          box-shadow:
            0 12px 28px rgba(38, 34, 29, 0.06);
          transform: translateY(-2px);
        }

        .stats-grid .stat-label {
          color: #77736c;
        }

        .stats-grid .stat-symbol {
          color: #a79a87;
        }

        .stats-grid .stat-card:nth-child(2) .stat-label {
          color: #856d47;
        }

        .stats-grid .stat-card:nth-child(3) .stat-label {
          color: #587161;
        }

        .stats-grid .stat-card:nth-child(4) .stat-label {
          color: #82633c;
        }

        .stats-grid .stat-card strong,
        .stats-grid .stat-card.primary-stat strong {
          color: #20221f;
        }

        .stats-grid .stat-card small,
        .stats-grid .stat-card.primary-stat small {
          color: #918c83;
        }

        .stats-grid .stat-card.primary-stat .stat-label {
          color: #756d61;
        }

        .stats-grid .stat-card.primary-stat .stat-symbol {
          color: #a78b58;
        }

        /* Keep the dashboard's special dark CTA only in modules,
           not in the statistics row. */


        /* FINAL RESIDENCE GALLERY CARD POLISH */

        .module-grid .module-card.featured-module,
        .module-grid .module-card:nth-child(2) {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          background: #ffffff;
          border: 1px solid #ddd9d1;
          border-radius: 9px;
          box-shadow: 0 4px 16px rgba(34, 31, 26, 0.035);
        }

        .module-grid .module-card.featured-module::before,
        .module-grid .module-card:nth-child(2)::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 1;
        }

        .module-grid .module-card.featured-module::before {
          background: #c2a267;
        }

        .module-grid .module-card:nth-child(2)::before {
          background: #789382;
        }

        .module-grid .module-card.featured-module:hover,
        .module-grid .module-card:nth-child(2):hover {
          background: #ffffff;
          border-color: #cfc7b9;
          box-shadow:
            0 16px 34px rgba(38, 34, 28, 0.075);
          transform: translateY(-3px);
        }

        .module-grid .module-card.featured-module .module-mini-label {
          color: #a2814e;
        }

        .module-grid .module-card:nth-child(2) .module-mini-label {
          color: #62806e;
        }

        .module-grid .module-card.featured-module .module-icon {
          color: #ae8b54;
        }

        .module-grid .module-card:nth-child(2) .module-icon {
          color: #6d8b78;
        }

        .module-grid .module-card.featured-module .module-content h3,
        .module-grid .module-card:nth-child(2) .module-content h3 {
          color: #191b19;
        }

        .module-grid .module-card.featured-module .module-content p,
        .module-grid .module-card:nth-child(2) .module-content p {
          color: #77736b;
        }

        .module-grid .module-card.featured-module .module-footer,
        .module-grid .module-card:nth-child(2) .module-footer {
          color: #878075;
          border-top-color: #e9e5de;
        }

        .module-grid .module-card.featured-module .module-footer span:last-child,
        .module-grid .module-card:nth-child(2) .module-footer span:last-child {
          font-size: 14px;
        }

        .module-grid .module-card.featured-module .module-footer span:last-child {
          color: #ae8c56;
        }

        .module-grid .module-card:nth-child(2) .module-footer span:last-child {
          color: #6d8b78;
        }


        /* FINAL RESIDENCE GALLERY CARD BOX FIX */

        .module-grid > .module-card.featured-module,
        .module-grid > .module-card:nth-child(2) {
          position: relative;
          display: flex;
          min-height: 190px;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
          border: 1px solid #d9d4cb !important;
          border-radius: 9px;
          background: #ffffff !important;
          box-shadow:
            0 5px 18px rgba(32, 29, 25, 0.045);
        }

        .module-grid > .module-card.featured-module::before,
        .module-grid > .module-card:nth-child(2)::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 1;
        }

        .module-grid > .module-card.featured-module::before {
          background: #c2a267;
        }

        .module-grid > .module-card:nth-child(2)::before {
          background: #789382;
        }

        .module-grid > .module-card.featured-module:hover,
        .module-grid > .module-card:nth-child(2):hover {
          background: #ffffff !important;
          border-color: #c9c0b2 !important;
          box-shadow:
            0 15px 34px rgba(32, 29, 25, 0.075);
          transform: translateY(-3px);
        }

        .module-grid > .module-card.featured-module .module-content,
        .module-grid > .module-card:nth-child(2) .module-content {
          padding-top: 18px;
          padding-bottom: 22px;
        }

        .module-grid > .module-card.featured-module .module-mini-label {
          color: #a07d47;
        }

        .module-grid > .module-card:nth-child(2) .module-mini-label {
          color: #63806f;
        }

        .module-grid > .module-card.featured-module .module-icon {
          color: #ad8950;
        }

        .module-grid > .module-card:nth-child(2) .module-icon {
          color: #6d8978;
        }

        .module-grid > .module-card.featured-module .module-footer,
        .module-grid > .module-card:nth-child(2) .module-footer {
          border-top-color: #e7e3dc;
        }

        .module-grid > .module-card.featured-module .module-footer span:last-child {
          color: #ae8b55;
        }

        .module-grid > .module-card:nth-child(2) .module-footer span:last-child {
          color: #6c8977;
        }


        /* FINAL ACTION BOX PATTERN */

        .module-grid > .module-card.featured-module .module-footer,
        .module-grid > .module-card:nth-child(2) .module-footer {
          min-height: 42px;
          margin: 0;
          padding: 0 12px;
          box-sizing: border-box;
          border: 1px solid #e2ddd4;
          border-radius: 6px;
          background: #faf8f4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #81796d;
          transition:
            background 180ms ease,
            border-color 180ms ease,
            transform 180ms ease;
        }

        .module-grid > .module-card.featured-module .module-footer {
          border-left: 3px solid #c2a267;
        }

        .module-grid > .module-card:nth-child(2) .module-footer {
          border-left: 3px solid #789382;
        }

        .module-grid > .module-card.featured-module:hover .module-footer {
          background: #f6f0e5;
          border-color: #d5c8b4;
        }

        .module-grid > .module-card:nth-child(2):hover .module-footer {
          background: #f1f5f2;
          border-color: #cddbd2;
        }

        .module-grid > .module-card.featured-module .module-footer span:first-child,
        .module-grid > .module-card:nth-child(2) .module-footer span:first-child {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .module-grid > .module-card.featured-module .module-footer span:last-child,
        .module-grid > .module-card:nth-child(2) .module-footer span:last-child {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #e1ddd5;
          font-size: 12px;
        }

        .module-grid > .module-card.featured-module .module-footer span:last-child {
          color: #aa8750;
        }

        .module-grid > .module-card:nth-child(2) .module-footer span:last-child {
          color: #668271;
        }

        .module-grid > .module-card.featured-module:hover .module-footer span:last-child,
        .module-grid > .module-card:nth-child(2):hover .module-footer span:last-child {
          transform: translateX(2px);
        }


        /* FINAL MANAGE YOUR SITE CONTAINER */

        .section-block {
          position: relative;
          padding: 22px;
          margin-bottom: 16px;
          box-sizing: border-box;
          border: 1px solid #dedbd5;
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #fbfaf7 100%
            );
          box-shadow:
            0 7px 24px rgba(35, 32, 27, 0.035);
        }

        .section-heading {
          margin: 0 0 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e9e6e0;
        }

        .section-heading h2 {
          margin-top: 7px;
        }

        .module-grid {
          gap: 10px;
        }

        .module-grid > .module-card {
          position: relative;
          min-height: 190px;
          padding: 19px;
          box-sizing: border-box;
          overflow: hidden;
          border: 1px solid #ddd9d1 !important;
          border-radius: 8px;
          background: #ffffff !important;
          box-shadow:
            0 4px 15px rgba(35, 32, 27, 0.035);
        }

        .module-grid > .module-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 1;
        }

        .module-grid > .module-card:nth-child(1)::before {
          background: #c2a267;
        }

        .module-grid > .module-card:nth-child(2)::before {
          background: #789382;
        }

        .module-grid > .module-card:nth-child(3)::before {
          background: #aaa092;
        }

        .module-grid > .module-card:nth-child(4)::before {
          background: #b49463;
        }

        .module-grid > .module-card:nth-child(5)::before {
          background: #7b95a5;
        }

        .module-grid > .module-card:nth-child(6) {
          background:
            linear-gradient(
              145deg,
              #1e2220 0%,
              #141716 100%
            ) !important;
          border-color: #1e2220 !important;
        }

        .module-grid > .module-card:nth-child(6)::before {
          background: #c0a06a;
        }

        .module-grid > .module-card:hover {
          border-color: #c9c1b5 !important;
          box-shadow:
            0 14px 30px rgba(35, 32, 27, 0.065);
          transform: translateY(-3px);
        }

        .module-grid > .module-card:nth-child(6):hover {
          border-color: #8e7851 !important;
        }

        .module-grid > .module-card .module-top {
          position: relative;
          z-index: 1;
        }

        .module-grid > .module-card .module-content {
          position: relative;
          z-index: 1;
        }

        .module-grid > .module-card .module-footer {
          position: relative;
          z-index: 1;
        }

        .module-grid > .module-card:not(:nth-child(6)) .module-footer {
          min-height: 40px;
          padding: 0 11px;
          box-sizing: border-box;
          border: 1px solid #e1ddd5;
          border-radius: 6px;
          background: #faf8f4;
        }

        .module-grid > .module-card:nth-child(1) .module-footer {
          border-left: 3px solid #c2a267;
        }

        .module-grid > .module-card:nth-child(2) .module-footer {
          border-left: 3px solid #789382;
        }

        .module-grid > .module-card:nth-child(3) .module-footer {
          border-left: 3px solid #aaa092;
        }

        .module-grid > .module-card:nth-child(4) .module-footer {
          border-left: 3px solid #b49463;
        }

        .module-grid > .module-card:nth-child(5) .module-footer {
          border-left: 3px solid #7b95a5;
        }

        .module-grid > .module-card:not(:nth-child(6)) .module-footer span:last-child {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #e0dbd3;
        }

        .module-grid > .module-card:nth-child(1) .module-footer span:last-child {
          color: #ae8b54;
        }

        .module-grid > .module-card:nth-child(2) .module-footer span:last-child {
          color: #6d8978;
        }

        .module-grid > .module-card:nth-child(3) .module-footer span:last-child,
        .module-grid > .module-card:nth-child(4) .module-footer span:last-child,
        .module-grid > .module-card:nth-child(5) .module-footer span:last-child {
          color: #8f8475;
        }

        .module-grid > .module-card:nth-child(6) .module-footer {
          border-color: rgba(255, 255, 255, 0.11);
        }

        @media (max-width: 760px) {
          .section-block {
            padding: 16px;
            border-radius: 9px;
          }

          .section-heading {
            padding-bottom: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          .stat-card,
          .module-card,
          .view-site-button,
          .nav-item,
          .sidebar-link,
          .sidebar-logout {
            transition: none;
          }

          .empty-loader {
            animation: none;
          }
        }

        /* Final premium module-card system */
        .module-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }

        .module-grid > .module-card {
          min-height: 232px;
          padding: 20px 20px 0 !important;
          border: 1px solid #ded9d1 !important;
          border-radius: 11px !important;
          background: #fffefa !important;
          box-shadow:
            0 8px 22px rgba(35, 32, 27, 0.035),
            0 1px 3px rgba(35, 32, 27, 0.025);
          transform: translateY(0);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .module-grid > .module-card::before {
          height: 3px;
          opacity: 1;
          border-radius: 11px 11px 0 0;
        }

        .module-grid > .module-card:hover {
          transform: translateY(-4px);
          border-color: #c9c1b5 !important;
          box-shadow:
            0 18px 34px rgba(35, 32, 27, 0.075),
            0 3px 7px rgba(35, 32, 27, 0.035);
        }

        .module-grid > .module-card .module-top {
          padding-bottom: 16px;
        }

        .module-grid > .module-card .module-top > span:first-child {
          font-size: 9px;
          letter-spacing: 0.14em;
          color: #a39c91;
        }

        .module-grid > .module-card .module-icon {
          width: 29px;
          height: 29px;
          border-radius: 7px;
          background: #fffefa;
          border: 1px solid #ded8cf;
          color: #93774a;
          font-size: 13px;
        }

        .module-grid > .module-card .module-content {
          padding-top: 6px;
        }

        .module-grid > .module-card .module-mini-label {
          margin-bottom: 9px;
          font-size: 8px;
          letter-spacing: 0.17em;
        }

        .module-grid > .module-card .module-content h3 {
          font-size: 25px;
          line-height: 1.05;
          letter-spacing: -0.025em;
        }

        .module-grid > .module-card .module-content p {
          margin-top: 10px;
          max-width: 340px;
          color: #77736b;
          font-size: 10px;
          line-height: 1.7;
        }

        .module-grid > .module-card .module-footer {
          margin-top: 18px;
          min-height: 40px;
          padding: 0 11px !important;
          box-sizing: border-box;
          border: 1px solid #e2ddd5 !important;
          border-left-width: 3px !important;
          border-radius: 6px;
          background: #faf8f4;
          color: #777168;
        }

        .module-grid > .module-card .module-footer span:first-child {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .module-grid > .module-card .module-footer span:last-child {
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid #e0dad1;
          background: #fffefa;
          font-size: 13px;
          transition: transform 180ms ease;
        }

        .module-grid > .module-card:hover .module-footer span:last-child {
          transform: translateX(2px);
        }

        /* Individual module accents */
        .module-grid > .module-card:nth-child(1)::before {
          background: #c2a267;
        }

        .module-grid > .module-card:nth-child(2)::before {
          background: #789382;
        }

        .module-grid > .module-card:nth-child(3)::before {
          background: #aaa092;
        }

        .module-grid > .module-card:nth-child(4)::before {
          background: #a8b49f;
        }

        .module-grid > .module-card:nth-child(5)::before {
          background: #7b95a5;
        }

        .module-grid > .module-card:nth-child(1) .module-footer {
          border-left-color: #c2a267 !important;
        }

        .module-grid > .module-card:nth-child(2) .module-footer {
          border-left-color: #789382 !important;
        }

        .module-grid > .module-card:nth-child(3) .module-footer {
          border-left-color: #aaa092 !important;
        }

        .module-grid > .module-card:nth-child(4) .module-footer {
          border-left-color: #a8b49f !important;
        }

        .module-grid > .module-card:nth-child(5) .module-footer {
          border-left-color: #7b95a5 !important;
        }

        /* Enquiries gets the same box system with dark treatment */
        .module-grid > .module-card:nth-child(6) {
          min-height: 232px;
          background: #1b1e1c !important;
          border-color: #1b1e1c !important;
          box-shadow:
            0 10px 27px rgba(25, 27, 25, 0.12);
        }

        .module-grid > .module-card:nth-child(6):hover {
          border-color: #3a3e3a !important;
          box-shadow:
            0 18px 38px rgba(25, 27, 25, 0.18);
        }

        .module-grid > .module-card:nth-child(6) .module-top > span:first-child {
          color: #a9a59d;
        }

        .module-grid > .module-card:nth-child(6) .module-icon {
          border-color: #454944;
          background: #282b29;
          color: #d1b57d;
        }

        .module-grid > .module-card:nth-child(6) .module-mini-label {
          color: #c2a46b;
        }

        .module-grid > .module-card:nth-child(6) .module-content h3 {
          color: #fffdf8;
        }

        .module-grid > .module-card:nth-child(6) .module-content p {
          color: #b6b2a9;
        }

        .module-grid > .module-card:nth-child(6) .module-footer {
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.035);
          color: #aaa69e;
        }

        .module-grid > .module-card:nth-child(6) .module-footer span:last-child {
          border-color: rgba(255, 255, 255, 0.12);
          background: #272a28;
          color: #c2a46b;
        }

        @media (max-width: 1050px) {
          .module-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .module-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .module-grid > .module-card,
          .module-grid > .module-card:nth-child(6) {
            min-height: 215px;
          }
        }


        /* ==================================================
           FINAL VISUAL SYSTEM — INDIVIDUAL MODULE BOXES
           ================================================== */

        .section-block {
          padding: 24px !important;
          border: 1px solid #d8d2c8 !important;
          border-radius: 14px !important;
          background: #eeece7 !important;
          box-shadow:
            0 10px 28px rgba(35, 32, 27, 0.045) !important;
        }

        .section-block .section-heading {
          margin-bottom: 20px !important;
          padding: 0 2px 18px !important;
          border-bottom: 1px solid #ddd8cf !important;
        }

        .module-grid {
          display: grid !important;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          ) !important;
          gap: 18px !important;
          margin-top: 0 !important;
        }

        .module-grid > .module-card {
          position: relative !important;
          min-height: 245px !important;
          padding: 20px 20px 0 !important;
          box-sizing: border-box !important;
          overflow: hidden !important;

          border: 1px solid #d4cec3 !important;
          border-radius: 12px !important;

          background: #fffdf9 !important;
          color: #23231f !important;

          box-shadow:
            0 9px 24px rgba(35, 32, 27, 0.065),
            0 2px 5px rgba(35, 32, 27, 0.035) !important;

          transform: translateY(0) !important;

          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease !important;
        }

        .module-grid > .module-card:hover {
          transform: translateY(-5px) !important;
          border-color: #bdb3a3 !important;
          box-shadow:
            0 18px 38px rgba(35, 32, 27, 0.11),
            0 4px 10px rgba(35, 32, 27, 0.045) !important;
        }

        .module-grid > .module-card::before {
          content: "" !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: 4px !important;
          opacity: 1 !important;
          border-radius: 12px 12px 0 0 !important;
        }

        .module-grid > .module-card:nth-child(1)::before {
          background: #c2a267 !important;
        }

        .module-grid > .module-card:nth-child(2)::before {
          background: #789382 !important;
        }

        .module-grid > .module-card:nth-child(3)::before {
          background: #9f968b !important;
        }

        .module-grid > .module-card:nth-child(4)::before {
          background: #a8b49f !important;
        }

        .module-grid > .module-card:nth-child(5)::before {
          background: #7b95a5 !important;
        }

        .module-grid > .module-card:nth-child(6) {
          background: #1c1f1d !important;
          border-color: #1c1f1d !important;
          color: #fffdf8 !important;

          box-shadow:
            0 12px 30px rgba(25, 27, 25, 0.15) !important;
        }

        .module-grid > .module-card:nth-child(6):hover {
          border-color: #4c514c !important;
          box-shadow:
            0 20px 40px rgba(25, 27, 25, 0.22) !important;
        }

        .module-grid > .module-card .module-top {
          position: relative !important;
          z-index: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding-bottom: 18px !important;
        }

        .module-grid > .module-card .module-top > span:first-child {
          color: #9b958a !important;
          font-size: 9px !important;
          font-weight: 800 !important;
          letter-spacing: 0.14em !important;
        }

        .module-grid > .module-card .module-icon {
          width: 30px !important;
          height: 30px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid #ddd7cd !important;
          border-radius: 7px !important;
          background: #fffefa !important;
          color: #917447 !important;
          font-size: 13px !important;
        }

        .module-grid > .module-card .module-content {
          position: relative !important;
          z-index: 1 !important;
          flex: 1 !important;
          padding-top: 7px !important;
        }

        .module-grid > .module-card .module-mini-label {
          display: block !important;
          margin-bottom: 9px !important;
          color: #a18455 !important;
          font-size: 8px !important;
          font-weight: 800 !important;
          letter-spacing: 0.17em !important;
        }

        .module-grid > .module-card .module-content h3 {
          margin: 0 !important;
          color: #252623 !important;
          font-size: 25px !important;
          line-height: 1.05 !important;
          font-weight: 500 !important;
          letter-spacing: -0.025em !important;
        }

        .module-grid > .module-card .module-content p {
          margin: 11px 0 0 !important;
          max-width: 330px !important;
          color: #77736b !important;
          font-size: 10px !important;
          line-height: 1.7 !important;
        }

        .module-grid > .module-card .module-footer {
          position: relative !important;
          z-index: 1 !important;
          min-height: 42px !important;
          margin-top: 18px !important;
          padding: 0 12px !important;
          box-sizing: border-box !important;

          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;

          border: 1px solid #ddd7ce !important;
          border-radius: 7px !important;
          background: #f7f4ee !important;
          color: #777168 !important;
        }

        .module-grid > .module-card .module-footer span:first-child {
          font-size: 8px !important;
          font-weight: 800 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
        }

        .module-grid > .module-card .module-footer span:last-child {
          width: 25px !important;
          height: 25px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;

          border: 1px solid #dfd8cf !important;
          border-radius: 50% !important;
          background: #fffefa !important;
          color: #9a7b49 !important;
          font-size: 12px !important;

          transition:
            transform 180ms ease,
            background 180ms ease !important;
        }

        .module-grid > .module-card:hover
          .module-footer span:last-child {
          transform: translateX(3px) !important;
        }

        /* Dark enquiries card */
        .module-grid > .module-card:nth-child(6)
          .module-top > span:first-child {
          color: #aaa69e !important;
        }

        .module-grid > .module-card:nth-child(6)
          .module-icon {
          border-color: #464a46 !important;
          background: #292c2a !important;
          color: #d0b17b !important;
        }

        .module-grid > .module-card:nth-child(6)
          .module-mini-label {
          color: #c2a46b !important;
        }

        .module-grid > .module-card:nth-child(6)
          .module-content h3 {
          color: #fffdf8 !important;
        }

        .module-grid > .module-card:nth-child(6)
          .module-content p {
          color: #b5b1a9 !important;
        }

        .module-grid > .module-card:nth-child(6)
          .module-footer {
          border-color: rgba(
            255,
            255,
            255,
            0.12
          ) !important;
          background: rgba(
            255,
            255,
            255,
            0.035
          ) !important;
          color: #aaa69e !important;
        }

        .module-grid > .module-card:nth-child(6)
          .module-footer span:last-child {
          border-color: rgba(
            255,
            255,
            255,
            0.13
          ) !important;
          background: #282b29 !important;
          color: #c2a46b !important;
        }

        @media (max-width: 1050px) {
          .module-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            ) !important;
          }
        }

        @media (max-width: 700px) {
          .section-block {
            padding: 17px !important;
          }

          .module-grid {
            grid-template-columns: 1fr !important;
            gap: 13px !important;
          }

          .module-grid > .module-card,
          .module-grid > .module-card:nth-child(6) {
            min-height: 220px !important;
          }
        }


        /* ==================================================
           DEFINITIVE MODULE CARD SEPARATION
           ================================================== */

        :global(.section-block) {
          background: #ece9e3 !important;
          border: 1px solid #d5cfc4 !important;
          border-radius: 14px !important;
          padding: 24px !important;
        }

        :global(.section-block .module-grid) {
          display: grid !important;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          ) !important;
          gap: 20px !important;
          margin: 0 !important;
        }

        :global(.section-block .module-grid > .module-card) {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          min-height: 250px !important;
          margin: 0 !important;
          padding: 21px !important;
          box-sizing: border-box !important;
          overflow: hidden !important;

          border: 1px solid #cbc4b8 !important;
          border-radius: 12px !important;

          background: #ffffff !important;
          color: #252623 !important;

          box-shadow:
            0 10px 26px rgba(40, 36, 30, 0.08),
            0 2px 5px rgba(40, 36, 30, 0.04) !important;

          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;

          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease !important;
        }

        :global(.section-block .module-grid > .module-card:hover) {
          transform: translateY(-5px) !important;
          border-color: #b7ad9f !important;
          box-shadow:
            0 20px 40px rgba(40, 36, 30, 0.13),
            0 5px 12px rgba(40, 36, 30, 0.05) !important;
        }

        :global(.section-block .module-grid > .module-card::before) {
          content: "" !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: 4px !important;
          opacity: 1 !important;
          border-radius: 12px 12px 0 0 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(1)) {
          background: #fffdf8 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(1)::before) {
          background: #c2a267 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(2)) {
          background: #fbfdfb !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(2)::before) {
          background: #789382 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(3)) {
          background: #fcfbfa !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(3)::before) {
          background: #a29a90 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(4)) {
          background: #fbfcf9 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(4)::before) {
          background: #9eaa96 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(5)) {
          background: #fafdff !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(5)::before) {
          background: #7b95a5 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(6)) {
          background: #1b1e1c !important;
          border-color: #1b1e1c !important;
          color: #fffdf8 !important;
          box-shadow:
            0 12px 30px rgba(25, 27, 25, 0.16) !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(6)::before) {
          background: #c2a46b !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(6):hover) {
          border-color: #454a45 !important;
          box-shadow:
            0 20px 42px rgba(25, 27, 25, 0.23) !important;
        }

        :global(.section-block .module-grid > .module-card .module-top) {
          flex: 0 0 auto !important;
          position: relative !important;
          z-index: 2 !important;
          padding-bottom: 17px !important;
        }

        :global(.section-block .module-grid > .module-card .module-content) {
          position: relative !important;
          z-index: 2 !important;
          flex: 1 1 auto !important;
          padding-top: 8px !important;
        }

        :global(.section-block .module-grid > .module-card .module-footer) {
          position: relative !important;
          z-index: 2 !important;
          flex: 0 0 auto !important;
          margin-top: 18px !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(6) .module-content h3) {
          color: #fffdf8 !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(6) .module-content p) {
          color: #b6b2aa !important;
        }

        :global(.section-block .module-grid > .module-card:nth-child(6) .module-footer) {
          border-color: rgba(255, 255, 255, 0.13) !important;
          background: rgba(255, 255, 255, 0.035) !important;
          color: #aaa69e !important;
        }

        @media (max-width: 1050px) {
          :global(.section-block .module-grid) {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            ) !important;
          }
        }

        @media (max-width: 700px) {
          :global(.section-block) {
            padding: 17px !important;
          }

          :global(.section-block .module-grid) {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          :global(.section-block .module-grid > .module-card),
          :global(.section-block .module-grid > .module-card:nth-child(6)) {
            min-height: 220px !important;
          }
        }


        /* ==================================================
           UNIFIED DARK MODULE CARD THEME
           ================================================== */

        :global(.section-block .module-grid > .module-card),
        :global(.section-block .module-grid > .module-card:nth-child(1)),
        :global(.section-block .module-grid > .module-card:nth-child(2)),
        :global(.section-block .module-grid > .module-card:nth-child(3)),
        :global(.section-block .module-grid > .module-card:nth-child(4)),
        :global(.section-block .module-grid > .module-card:nth-child(5)),
        :global(.section-block .module-grid > .module-card:nth-child(6)) {
          background: #1b1e1c !important;
          color: #fffdf8 !important;
          border-color: #2b2f2c !important;
          box-shadow:
            0 12px 30px rgba(25, 27, 25, 0.15),
            0 2px 6px rgba(25, 27, 25, 0.08) !important;
        }

        :global(.section-block .module-grid > .module-card:hover),
        :global(.section-block .module-grid > .module-card:nth-child(1):hover),
        :global(.section-block .module-grid > .module-card:nth-child(2):hover),
        :global(.section-block .module-grid > .module-card:nth-child(3):hover),
        :global(.section-block .module-grid > .module-card:nth-child(4):hover),
        :global(.section-block .module-grid > .module-card:nth-child(5):hover),
        :global(.section-block .module-grid > .module-card:nth-child(6):hover) {
          background: #1b1e1c !important;
          border-color: #55594f !important;
          box-shadow:
            0 20px 42px rgba(25, 27, 25, 0.22),
            0 4px 10px rgba(25, 27, 25, 0.1) !important;
        }

        :global(.section-block .module-grid > .module-card::before),
        :global(.section-block .module-grid > .module-card:nth-child(1)::before),
        :global(.section-block .module-grid > .module-card:nth-child(2)::before),
        :global(.section-block .module-grid > .module-card:nth-child(3)::before),
        :global(.section-block .module-grid > .module-card:nth-child(4)::before),
        :global(.section-block .module-grid > .module-card:nth-child(5)::before),
        :global(.section-block .module-grid > .module-card:nth-child(6)::before) {
          background: #c2a46b !important;
        }

        :global(.section-block .module-grid > .module-card .module-top > span:first-child) {
          color: #aaa69e !important;
        }

        :global(.section-block .module-grid > .module-card .module-icon) {
          border-color: #454944 !important;
          background: #282b29 !important;
          color: #d0b17b !important;
        }

        :global(.section-block .module-grid > .module-card .module-mini-label) {
          color: #c2a46b !important;
        }

        :global(.section-block .module-grid > .module-card .module-content h3) {
          color: #fffdf8 !important;
        }

        :global(.section-block .module-grid > .module-card .module-content p) {
          color: #b6b2aa !important;
        }

        :global(.section-block .module-grid > .module-card .module-footer) {
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.035) !important;
          color: #aaa69e !important;
        }

        :global(.section-block .module-grid > .module-card .module-footer span:last-child) {
          border-color: rgba(255, 255, 255, 0.13) !important;
          background: #282b29 !important;
          color: #c2a46b !important;
        }


        /* FINAL SIDEBAR ACTIONS */

        .sidebar-bottom {
          margin-top: auto !important;
          padding-top: 18px !important;
          border-top: 1px solid rgba(194, 166, 111, 0.15) !important;
        }

        .sidebar-bottom .sidebar-logout {
          width: 100% !important;
          min-height: 42px !important;
          padding: 0 12px !important;
          box-sizing: border-box !important;

          border: 1px solid rgba(194, 166, 111, 0.18) !important;
          border-radius: 7px !important;

          background: rgba(255, 255, 255, 0.025) !important;
          color: rgba(255, 255, 255, 0.6) !important;

          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;

          font-size: 10px !important;
          font-weight: 700 !important;

          transition:
            color 180ms ease,
            background 180ms ease,
            border-color 180ms ease !important;
        }

        .sidebar-bottom .sidebar-logout:hover {
          background: rgba(194, 166, 111, 0.08) !important;
          border-color: rgba(194, 166, 111, 0.34) !important;
          color: rgba(255, 255, 255, 0.92) !important;
        }

        .sidebar-bottom .sidebar-arrow {
          color: rgba(255, 255, 255, 0.28) !important;
          font-size: 13px !important;
        }

        .sidebar-bottom .sidebar-logout:hover .sidebar-arrow {
          color: #c3a46b !important;
        }

        @media (max-width: 760px) {
          .sidebar-bottom {
            margin-top: 10px !important;
            padding-top: 10px !important;
          }

          .sidebar-bottom .sidebar-logout {
            min-height: 40px !important;
          }
        }

      `}</style>
    </main>
  );
}