/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
      const token = localStorage.getItem("adminToken");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const [
        propertiesRes,
        enquiriesRes,
        contactEnquiriesRes,
      ] = await Promise.all([
        fetch(`${API_URL}/properties`),

        fetch(`${API_URL}/enquiries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/contact-enquiries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (
        enquiriesRes.status === 401 ||
        contactEnquiriesRes.status === 401
      ) {
        localStorage.removeItem("adminToken");
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
      console.error(
        "Dashboard loading failed:",
        error
      );
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
      const token = localStorage.getItem("adminToken");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      setDeletingId(propertyId);

      const res = await fetch(
        `${API_URL}/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
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
      console.error(
        "Delete property failed:",
        error
      );

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
      const token = localStorage.getItem("adminToken");

      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const res = await fetch(
        `${API_URL}/enquiries/${enquiryId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
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
      console.error(
        "Status update failed:",
        error
      );

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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </main>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              PROPERTY
              <span className="text-amber-500">
                HUB
              </span>
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Admin Dashboard
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">

            <a
              href="/admin/properties/new"
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Add Property
            </a>

            <a
              href="/"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View Website
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-slate-500">
            Manage your properties and customer
            enquiries.
          </p>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Properties
            </p>

            <p className="mt-3 text-4xl font-bold">
              {properties.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Property Enquiries
            </p>

            <p className="mt-3 text-4xl font-bold">
              {enquiries.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Contact Enquiries
            </p>

            <p className="mt-3 text-4xl font-bold">
              {contactEnquiries.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Available Properties
            </p>

            <p className="mt-3 text-4xl font-bold">
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

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">

            <div>
              <h3 className="text-xl font-bold">
                Properties
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Recently added properties
              </p>
            </div>

            <a
              href="/admin/properties/new"
              className="w-fit rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              + Add Property
            </a>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-250 text-left">

              <thead className="bg-slate-50">
                <tr>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Property
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Location
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Price
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
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
                      className="border-t border-slate-100"
                    >

                      <td className="px-6 py-4 font-semibold">
                        {property.title}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {property.location}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {property.price}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {property.type}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {property.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <a
                            href={`/admin/properties/edit/${property._id}`}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
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
                              deletingId ===
                              property._id
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            property._id
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

        </div>

        {/* ================= PROPERTY ENQUIRIES ================= */}

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <h3 className="text-xl font-bold">
              Customer Enquiries
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Recent enquiries from potential buyers
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {enquiries.length === 0 ? (

              <p className="p-6 text-sm text-slate-500">
                No enquiries found.
              </p>

            ) : (

              enquiries.map((enquiry) => (

                <div
                  key={enquiry._id}
                  className="p-6"
                >

                  <div className="flex flex-col justify-between gap-5 md:flex-row">

                    <div className="min-w-0">

                      <h4 className="font-semibold">
                        {enquiry.name}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {enquiry.email} ·{" "}
                        {enquiry.phone}
                      </p>

                      {enquiry.propertyTitle && (
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          Property:{" "}
                          {enquiry.propertyTitle}
                        </p>
                      )}

                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">

                      <p className="text-sm text-slate-400">
                        {new Date(
                          enquiry.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <select
                        value={
                          enquiry.status || "New"
                        }
                        onChange={(e) =>
                          handleEnquiryStatusChange(
                            enquiry._id,
                            e.target.value as
                              | "New"
                              | "Contacted"
                              | "Closed"
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-amber-400"
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

                    </div>

                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {enquiry.message ||
                      "No message provided."}
                  </p>

                </div>

              ))

            )}

          </div>

        </div>

        {/* ================= CONTACT ENQUIRIES ================= */}

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <h3 className="text-xl font-bold">
              Contact Enquiries
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enquiries submitted through the Contact page
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {contactEnquiries.length === 0 ? (

              <div className="p-6">
                <p className="text-sm text-slate-500">
                  No contact enquiries found.
                </p>
              </div>

            ) : (

              contactEnquiries.map((contact) => (

                <div
                  key={contact._id}
                  className="p-6"
                >

                  <div className="flex flex-col justify-between gap-5 lg:flex-row">

                    {/* CONTACT INFO */}

                    <div className="min-w-0">

                      <h4 className="text-lg font-semibold">
                        {contact.name}
                      </h4>

                      <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500">

                        <a
                          href={`mailto:${contact.email}`}
                          className="w-fit hover:text-amber-600"
                        >
                          📧 {contact.email}
                        </a>

                        <a
                          href={`tel:${contact.phone}`}
                          className="w-fit hover:text-amber-600"
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