/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import { getBrowserApiUrl } from "../lib/api";

type Property = {
  _id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: string;
};

type Enquiry = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyId: string;
  propertyTitle?: string;
  status?: "New" | "Contacted" | "Closed";
  createdAt: string;
};

type ContactEnquiry = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: "New" | "Contacted" | "Closed";
  createdAt: string;
};

const API_URL = getBrowserApiUrl();;

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [contactEnquiries, setContactEnquiries] = useState<
    ContactEnquiry[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================
  // LOAD DASHBOARD
  // =========================

  const loadDashboard = async () => {
    try {
      const [
        propertiesRes,
        enquiriesRes,
        contactEnquiriesRes,
      ] = await Promise.all([
        fetch(`${API_URL}/properties`),

        fetch(`${API_URL}/enquiries`, {
          credentials: "include",
        }),

        fetch(`${API_URL}/contact-enquiries`, {
          credentials: "include",
        }),
      ]);

      if (
        enquiriesRes.status === 401 ||
        contactEnquiriesRes.status === 401
      ) {
        window.location.href = "/admin/login";
        return;
      }

      const propertiesData = await propertiesRes.json();
      const enquiriesData = await enquiriesRes.json();
      const contactEnquiriesData =
        await contactEnquiriesRes.json();

      setProperties(propertiesData.data || []);
      setEnquiries(enquiriesData.data || []);
      setContactEnquiries(
        contactEnquiriesData.data || []
      );
    } catch (error) {
      console.error("Dashboard loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================
  // DELETE PROPERTY
  // =========================

  const handleDelete = async (
    propertyId: string,
    propertyTitle: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${propertyTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(propertyId);

      const res = await fetch(
        `${API_URL}/properties/${propertyId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete property"
        );
      }

      setProperties((prev) =>
        prev.filter(
          (property) => property._id !== propertyId
        )
      );
    } catch (error) {
      console.error("Delete property failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete property"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // UPDATE PROPERTY ENQUIRY STATUS
  // =========================

  const handleEnquiryStatusChange = async (
    enquiryId: string,
    status: "New" | "Contacted" | "Closed"
  ) => {
    try {
      const res = await fetch(
        `${API_URL}/enquiries/${enquiryId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update enquiry status"
        );
      }

      setEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry._id === enquiryId
            ? {
                ...enquiry,
                status,
              }
            : enquiry
        )
      );
    } catch (error) {
      console.error("Status update failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update enquiry status"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
          <p className="text-base font-semibold text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* BRAND */}

            <div>
              <a
                href="/admin"
                className="inline-block text-2xl font-bold tracking-tight sm:text-3xl"
              >
                PROPERTY
                <span className="text-amber-500">HUB</span>
              </a>

              <p className="mt-1 text-sm text-slate-500">
                Admin Dashboard
              </p>
            </div>

            {/* ACTIONS */}

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
              <a
                href="/admin/properties/new"
                className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-2 text-center text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-4 sm:text-sm"
              >
                + Add Property
              </a>

              <a
                href="/"
                className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-center text-xs font-semibold text-slate-800 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
              >
                View Website
              </a>

              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-2 text-center text-xs font-semibold text-white transition hover:bg-red-700 sm:px-4 sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* TITLE */}

        <div className="mb-7 sm:mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Property Management
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard Overview
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your properties and customer enquiries
            from one place.
          </p>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Total Properties
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950 sm:mt-3 sm:text-4xl">
              {properties.length}
            </p>
          </div>

          {/* PROPERTY ENQUIRIES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Property Enquiries
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950 sm:mt-3 sm:text-4xl">
              {enquiries.length}
            </p>
          </div>

          {/* CONTACT ENQUIRIES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Contact Enquiries
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950 sm:mt-3 sm:text-4xl">
              {contactEnquiries.length}
            </p>
          </div>

          {/* AVAILABLE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Available Properties
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950 sm:mt-3 sm:text-4xl">
              {
                properties.filter(
                  (property) =>
                    property.status !== "Sold"
                ).length
              }
            </p>
          </div>
        </div>

        {/* ================= PROPERTIES ================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-10">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Properties
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Recently added properties
              </p>
            </div>

            <a
              href="/admin/properties/new"
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white transition hover:bg-amber-600 sm:w-fit"
            >
              + Add Property
            </a>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                    Property
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                    Location
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                    Price
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                    Type
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  properties.map((property) => (
                    <tr
                      key={property._id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="max-w-xs px-5 py-4 font-semibold text-slate-900">
                        {property.title}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {property.location}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {property.price}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {property.type}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            property.status === "Sold"
                              ? "bg-red-100 text-red-700"
                              : property.status ===
                                  "Under Construction"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {property.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/properties/edit/${property._id}`}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            ✏️ Edit
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                property._id,
                                property.title
                              )
                            }
                            disabled={
                              deletingId === property._id
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === property._id
                              ? "Deleting..."
                              : "🗑️ Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500 sm:hidden">
            Swipe horizontally to view all property details.
          </div>
        </div>

        {/* ================= PROPERTY ENQUIRIES ================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-10">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-slate-900">
              Customer Enquiries
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Recent enquiries from potential buyers
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {enquiries.length === 0 ? (
              <p className="p-5 text-sm text-slate-500 sm:p-6">
                No enquiries found.
              </p>
            ) : (
              enquiries.map((enquiry) => (
                <div
                  key={enquiry._id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900">
                        {enquiry.name}
                      </h4>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {enquiry.email} · {enquiry.phone}
                      </p>

                      {enquiry.propertyTitle && (
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          Property:{" "}
                          {enquiry.propertyTitle}
                        </p>
                      )}
                    </div>

                    <div className="flex w-full flex-col items-start gap-2 md:w-auto md:items-end">
                      <p className="text-sm text-slate-400">
                        {new Date(
                          enquiry.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <select
                        value={enquiry.status || "New"}
                        onChange={(e) =>
                          handleEnquiryStatusChange(
                            enquiry._id,
                            e.target.value as
                              | "New"
                              | "Contacted"
                              | "Closed"
                          )
                        }
                        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 md:w-auto"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">
                          Contacted
                        </option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {enquiry.message ||
                      "No message provided."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= CONTACT ENQUIRIES ================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-10">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-slate-900">
              Contact Enquiries
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enquiries submitted through the Contact page
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {contactEnquiries.length === 0 ? (
              <div className="p-5 sm:p-6">
                <p className="text-sm text-slate-500">
                  No contact enquiries found.
                </p>
              </div>
            ) : (
              contactEnquiries.map((contact) => (
                <div
                  key={contact._id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* CONTACT INFO */}

                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-slate-900">
                        {contact.name}
                      </h4>

                      <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500">
                        <a
                          href={`mailto:${contact.email}`}
                          className="w-fit break-all transition hover:text-amber-600"
                        >
                          📧 {contact.email}
                        </a>

                        <a
                          href={`tel:${contact.phone}`}
                          className="w-fit transition hover:text-amber-600"
                        >
                          📞 {contact.phone}
                        </a>
                      </div>
                    </div>

                    {/* DATE + STATUS */}

                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <p className="text-sm text-slate-400">
                        {new Date(
                          contact.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          contact.status === "New"
                            ? "bg-blue-100 text-blue-700"
                            : contact.status ===
                                "Contacted"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>
                  </div>

                  {/* MESSAGE */}

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Message
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {contact.message ||
                        "No message provided."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}