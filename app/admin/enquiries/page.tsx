"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../../lib/api";

type EnquiryStatus =
  | "New"
  | "Contacted"
  | "Closed";

type ResidenceEnquiry = {
  _id: string;
  propertyTitle?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: EnquiryStatus;
  createdAt?: string;
};

type ContactEnquiry = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status?: EnquiryStatus;
  createdAt?: string;
};

type UnifiedEnquiry = {
  id: string;
  source: "Residence" | "Contact";
  propertyTitle?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: EnquiryStatus;
  createdAt?: string;
};

const statusOptions: EnquiryStatus[] = [
  "New",
  "Contacted",
  "Closed",
];

export default function EnquiriesPage() {
  const [residenceEnquiries, setResidenceEnquiries] =
    useState<ResidenceEnquiry[]>([]);

  const [contactEnquiries, setContactEnquiries] =
    useState<ContactEnquiry[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] =
    useState<"All" | "Residence" | "Contact">(
      "All"
    );

  const [statusFilter, setStatusFilter] =
    useState<"All" | EnquiryStatus>("All");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadEnquiries() {
    try {
      setLoading(true);
      setError("");

      const api = getBrowserApiUrl();

      const [
        residenceResponse,
        contactResponse,
      ] = await Promise.all([
        fetch(`${api}/enquiries`, {
          credentials: "include",
          cache: "no-store",
        }),

        fetch(`${api}/contact-enquiries`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const residenceData =
        await residenceResponse.json();

      const contactData =
        await contactResponse.json();

      if (
        !residenceResponse.ok &&
        residenceResponse.status !== 401
      ) {
        throw new Error(
          residenceData?.message ||
            "Unable to load residence enquiries."
        );
      }

      if (
        !contactResponse.ok &&
        contactResponse.status !== 401
      ) {
        throw new Error(
          contactData?.message ||
            "Unable to load contact enquiries."
        );
      }

      setResidenceEnquiries(
        Array.isArray(residenceData?.data)
          ? residenceData.data
          : []
      );

      setContactEnquiries(
        Array.isArray(contactData?.data)
          ? contactData.data
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEnquiries();
  }, []);

  const enquiries = useMemo<UnifiedEnquiry[]>(
    () => {
      const residenceItems =
        residenceEnquiries.map((item) => ({
          id: item._id,
          source: "Residence" as const,
          propertyTitle: item.propertyTitle,
          name: item.name,
          phone: item.phone,
          email: item.email,
          message: item.message,
          status: item.status || "New",
          createdAt: item.createdAt,
        }));

      const contactItems =
        contactEnquiries.map((item) => ({
          id: item._id,
          source: "Contact" as const,
          name: item.name,
          phone: item.phone,
          email: item.email,
          message: item.message,
          status: item.status || "New",
          createdAt: item.createdAt,
        }));

      return [
        ...residenceItems,
        ...contactItems,
      ].sort((a, b) => {
        const aDate = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const bDate = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return bDate - aDate;
      });
    },
    [residenceEnquiries, contactEnquiries]
  );

  const stats = useMemo(() => {
    return {
      total: enquiries.length,

      newCount: enquiries.filter(
        (item) => item.status === "New"
      ).length,

      contacted: enquiries.filter(
        (item) => item.status === "Contacted"
      ).length,

      closed: enquiries.filter(
        (item) => item.status === "Closed"
      ).length,
    };
  }, [enquiries]);

  const filteredEnquiries =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return enquiries.filter((item) => {
        const matchesSource =
          sourceFilter === "All" ||
          item.source === sourceFilter;

        const matchesStatus =
          statusFilter === "All" ||
          item.status === statusFilter;

        const haystack = [
          item.name,
          item.phone,
          item.email,
          item.propertyTitle,
          item.message,
          item.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          haystack.includes(query);

        return (
          matchesSource &&
          matchesStatus &&
          matchesSearch
        );
      });
    }, [
      enquiries,
      search,
      sourceFilter,
      statusFilter,
    ]);

  async function updateStatus(
    item: UnifiedEnquiry,
    status: EnquiryStatus
  ) {
    try {
      setUpdatingId(item.id);
      setMessage("");
      setError("");

      const endpoint =
        item.source === "Residence"
          ? `/enquiries/${item.id}/status`
          : `/contact-enquiries/${item.id}/status`;

      const response = await fetch(
        `${getBrowserApiUrl()}${endpoint}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to update enquiry status."
        );
      }

      if (item.source === "Residence") {
        setResidenceEnquiries((current) =>
          current.map((entry) =>
            entry._id === item.id
              ? { ...entry, status }
              : entry
          )
        );
      } else {
        setContactEnquiries((current) =>
          current.map((entry) =>
            entry._id === item.id
              ? { ...entry, status }
              : entry
          )
        );
      }

      setMessage(
        "Enquiry status updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update enquiry status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(value?: string) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function statusClass(
    status: EnquiryStatus
  ) {
    return status.toLowerCase();
  }

  return (
    <main className="enquiries-page">
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
            Enquiries
          </span>
        </div>
      </header>

      <div className="page-content">
        <div className="page-intro">
          <div>
            <span className="eyebrow">
              LEAD MANAGEMENT
            </span>

            <h1>Enquiries</h1>

            <p>
              Review website enquiries, contact
              requests and lead status from one
              workspace.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card dark">
            <span>Total Enquiries</span>
            <strong>
              {loading ? "—" : stats.total}
            </strong>
            <small>All website leads</small>
          </div>

          <div className="stat-card">
            <span>New</span>
            <strong>
              {loading ? "—" : stats.newCount}
            </strong>
            <small>Needs attention</small>
          </div>

          <div className="stat-card">
            <span>Contacted</span>
            <strong>
              {loading ? "—" : stats.contacted}
            </strong>
            <small>In progress</small>
          </div>

          <div className="stat-card">
            <span>Closed</span>
            <strong>
              {loading ? "—" : stats.closed}
            </strong>
            <small>Completed leads</small>
          </div>
        </div>

        <section className="list-section">
          <div className="list-head">
            <div>
              <span className="section-label">
                LEAD INBOX
              </span>

              <h2>
                Recent enquiries
              </h2>
            </div>

            <div className="filters">
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search name, phone, email..."
              />

              <select
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(
                    event.target
                      .value as
                      | "All"
                      | "Residence"
                      | "Contact"
                  )
                }
              >
                <option value="All">
                  All sources
                </option>

                <option value="Residence">
                  Residence
                </option>

                <option value="Contact">
                  Contact
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as
                      | "All"
                      | EnquiryStatus
                  )
                }
              >
                <option value="All">
                  All statuses
                </option>

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
            </div>
          </div>

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

          {loading ? (
            <div className="empty-state">
              <span>Loading enquiries...</span>
            </div>
          ) : filteredEnquiries.length ===
            0 ? (
            <div className="empty-state">
              <strong>
                No enquiries found
              </strong>

              <span>
                New website leads will appear
                here automatically.
              </span>
            </div>
          ) : (
            <div className="enquiry-list">
              {filteredEnquiries.map(
                (item) => (
                  <article
                    key={`${item.source}-${item.id}`}
                    className="enquiry-card"
                  >
                    <div className="enquiry-main">
                      <div className="enquiry-top">
                        <div>
                          <span
                            className={`source-tag ${item.source.toLowerCase()}`}
                          >
                            {item.source}
                          </span>

                          <h3>
                            {item.name}
                          </h3>

                          {item.propertyTitle && (
                            <p className="property-name">
                              {item.propertyTitle}
                            </p>
                          )}
                        </div>

                        <span
                          className={`status-tag ${statusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="contact-grid">
                        <a
                          href={`tel:${item.phone}`}
                        >
                          {item.phone}
                        </a>

                        {item.email && (
                          <a
                            href={`mailto:${item.email}`}
                          >
                            {item.email}
                          </a>
                        )}

                        <span>
                          {formatDate(
                            item.createdAt
                          )}
                        </span>
                      </div>

                      {item.message && (
                        <div className="message-text">
                          {item.message}
                        </div>
                      )}
                    </div>

                    <div className="enquiry-actions">
                      <label>
                        <span>
                          Update status
                        </span>

                        <select
                          value={item.status}
                          disabled={
                            updatingId === item.id
                          }
                          onChange={(event) =>
                            void updateStatus(
                              item,
                              event.target
                                .value as EnquiryStatus
                            )
                          }
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

                      <a
                        href={`tel:${item.phone}`}
                        className="call-button"
                      >
                        Call lead
                      </a>
                    </div>
                  </article>
                )
              )}
            </div>
          )}

          {!loading &&
            filteredEnquiries.length > 0 && (
              <div className="list-footer">
                Showing{" "}
                <strong>
                  {filteredEnquiries.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {enquiries.length}
                </strong>{" "}
                enquiries
              </div>
            )}
        </section>
      </div>

      <style jsx>{`
        .enquiries-page {
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
          color: #827d74;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
        }

        .brand-row {
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
          width: min(
            1180px,
            calc(100% - 48px)
          );
          margin: 0 auto;
          padding: 38px 0 60px;
        }

        .page-intro {
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
          font-family: Georgia,
            "Times New Roman", serif;
          font-size: 38px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: -0.035em;
        }

        .page-intro p {
          margin: 0;
          max-width: 680px;
          color: #77736b;
          font-size: 12px;
          line-height: 1.7;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          min-height: 128px;
          padding: 19px 18px;
          border: 1px solid #dfdbd4;
          background: #faf9f6;
          box-shadow: 0 10px 28px
            rgba(47, 43, 36, 0.035);
        }

        .stat-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 3px;
          background: #c2a46b;
        }

        .stat-card.dark {
          background: #1a1c1b;
          color: #fff;
          border-color: #1a1c1b;
        }

        .stat-card.dark::before {
          background: #c2a46b;
        }

        .stat-card span {
          display: block;
          color: #77736b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .stat-card.dark span {
          color: #bfbab1;
        }

        .stat-card strong {
          display: block;
          margin-top: 12px;
          font-family: Georgia,
            "Times New Roman", serif;
          font-size: 35px;
          line-height: 1;
          font-weight: 500;
        }

        .stat-card small {
          display: block;
          margin-top: 9px;
          color: #99958d;
          font-size: 9px;
        }

        .stat-card.dark small {
          color: #aaa69e;
        }

        .list-section {
          border: 1px solid #dfdbd4;
          background: #faf9f6;
          box-shadow: 0 10px 30px
            rgba(47, 43, 36, 0.035);
        }

        .list-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 21px 22px;
          border-bottom: 1px solid #e3dfd8;
        }

        .list-head h2 {
          margin: 7px 0 0;
          font-family: Georgia,
            "Times New Roman", serif;
          font-size: 24px;
          line-height: 1.1;
          font-weight: 500;
        }

        .filters {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .filters input,
        .filters select,
        .enquiry-actions select {
          min-height: 37px;
          box-sizing: border-box;
          border: 1px solid #d7d2ca;
          border-radius: 6px;
          background: #fffefa;
          color: #353632;
          outline: none;
          font: inherit;
          font-size: 10px;
          padding: 0 10px;
        }

        .filters input {
          width: 230px;
        }

        .filters select {
          min-width: 122px;
        }

        .filters input:focus,
        .filters select:focus,
        .enquiry-actions select:focus {
          border-color: #b79a67;
          box-shadow: 0 0 0 3px
            rgba(183, 154, 103, 0.1);
        }

        .message {
          margin: 12px 16px 0;
          padding: 11px 13px;
          border: 1px solid;
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

        .enquiry-list {
          display: grid;
        }

        .enquiry-card {
          display: grid;
          grid-template-columns: minmax(
              0,
              1fr
            ) 190px;
          gap: 20px;
          padding: 20px 22px;
          border-bottom: 1px solid #e5e1da;
        }

        .enquiry-card:last-child {
          border-bottom: 0;
        }

        .enquiry-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .source-tag,
        .status-tag {
          display: inline-flex;
          align-items: center;
          min-height: 21px;
          padding: 0 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .source-tag {
          margin-bottom: 8px;
          background: #ebe7df;
          color: #746d62;
        }

        .source-tag.residence {
          background: #e9e4d9;
          color: #806947;
        }

        .source-tag.contact {
          background: #e2e9e0;
          color: #527052;
        }

        .status-tag.new {
          background: #f2e6cf;
          color: #896c3d;
        }

        .status-tag.contacted {
          background: #dfe8ef;
          color: #52697a;
        }

        .status-tag.closed {
          background: #e5e4e1;
          color: #686963;
        }

        .enquiry-top h3 {
          margin: 0;
          color: #252623;
          font-size: 17px;
          font-weight: 700;
        }

        .property-name {
          margin: 5px 0 0;
          color: #8a847b;
          font-size: 10px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: auto auto 1fr;
          gap: 12px;
          margin-top: 15px;
        }

        .contact-grid a,
        .contact-grid span {
          color: #65625c;
          text-decoration: none;
          font-size: 10px;
          line-height: 1.5;
        }

        .contact-grid a:hover {
          color: #8f7246;
        }

        .message-text {
          margin-top: 13px;
          padding: 11px 12px;
          border-left: 2px solid #c2a46b;
          background: #f4f1eb;
          color: #716d65;
          font-size: 10px;
          line-height: 1.65;
        }

        .enquiry-actions {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 9px;
        }

        .enquiry-actions label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .enquiry-actions label > span {
          color: #88837b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .enquiry-actions select {
          width: 100%;
        }

        .call-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          border-radius: 6px;
          background: #1a1c1b;
          color: #fff;
          text-decoration: none;
          font-size: 9px;
          font-weight: 800;
        }

        .call-button:hover {
          background: #2b2d2b;
        }

        .list-footer {
          padding: 13px 22px;
          border-top: 1px solid #e5e1da;
          color: #8d887f;
          font-size: 9px;
        }

        .list-footer strong {
          color: #514e48;
        }

        .empty-state {
          min-height: 190px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #969189;
          text-align: center;
        }

        .empty-state strong {
          color: #4a4a45;
          font-size: 12px;
        }

        .empty-state span {
          font-size: 9px;
        }

        @media (max-width: 980px) {
          .stats-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .list-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .filters {
            width: 100%;
            justify-content: flex-start;
          }

          .filters input {
            flex: 1;
            min-width: 180px;
          }
        }

        @media (max-width: 760px) {
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

          .enquiry-card {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .enquiry-actions {
            flex-direction: row;
            align-items: flex-end;
          }

          .enquiry-actions label {
            flex: 1;
          }

          .call-button {
            min-width: 110px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 5px;
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

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .list-head {
            padding: 17px;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .filters input,
          .filters select {
            width: 100%;
          }

          .enquiry-card {
            padding: 17px;
          }

          .enquiry-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .call-button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
