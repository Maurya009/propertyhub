/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Image from "next/image";
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

const API_URL = getBrowserApiUrl();

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [contactEnquiries, setContactEnquiries] = useState<
    ContactEnquiry[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  // =========================
  // CHANGE PASSWORD STATES
  // =========================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [changingPassword, setChangingPassword] =
    useState(false);

  // =========================
  // CHANGE EMAIL STATES
  // =========================

  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  // =========================
  // LOAD DASHBOARD
  // =========================

  const loadDashboard = async () => {
    try {
      const [
        adminRes,
        propertiesRes,
        enquiriesRes,
        contactEnquiriesRes,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/me`, {
          credentials: "include",
        }),
  
        fetch(`${API_URL}/properties`),
  
        fetch(`${API_URL}/enquiries`, {
          credentials: "include",
        }),
  
        fetch(`${API_URL}/contact-enquiries`, {
          credentials: "include",
        }),
      ]);
  
      if (
        adminRes.status === 401 ||
        enquiriesRes.status === 401 ||
        contactEnquiriesRes.status === 401
      ) {
        window.location.href = "/admin/login";
        return;
      }
  
      const adminData =
        await adminRes.json();
  
      const propertiesData =
        await propertiesRes.json();
  
      const enquiriesData =
        await enquiriesRes.json();
  
      const contactEnquiriesData =
        await contactEnquiriesRes.json();
  
      if (
        adminData.success &&
        adminData.data?.email
      ) {
        setCurrentEmail(adminData.data.email);
      }
  
      setProperties(
        propertiesData.data || []
      );
  
      setEnquiries(
        enquiriesData.data || []
      );
  
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
          data.message ||
            "Failed to delete property"
        );
      }

      setProperties((prev) =>
        prev.filter(
          (property) =>
            property._id !== propertyId
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
  // ENQUIRY STATUS
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
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      alert(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch(
        `${API_URL}/admin/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        alert(
          data.message ||
            "Your session has expired. Please login again."
        );

        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to change password"
        );
      }

      alert("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Change password failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // =========================
  // CHANGE EMAIL
  // =========================

  const handleChangeEmail = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!newEmail || !emailPassword) {
      alert(
        "Please enter the new email and current password."
      );
      return;
    }

    try {
      setChangingEmail(true);

      const res = await fetch(
        `${API_URL}/admin/change-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: emailPassword,
            newEmail,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        alert(
          data.message ||
            "Your session has expired. Please login again."
        );

        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to change email"
        );
      }

      alert(
        "Admin email changed successfully."
      );

      setCurrentEmail(
        data.data?.email || newEmail
      );

      setNewEmail("");
      setEmailPassword("");
    } catch (error) {
      console.error(
        "Change email failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to change email"
      );
    } finally {
      setChangingEmail(false);
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
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      window.location.href = "/admin/login";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f2e9] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#e5dac8] border-t-[#b38a3e]" />

          <p className="text-base font-semibold text-[#6d6256]">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#2f271f]">
      {/* ================= HEADER ================= */}

      <header className="border-b border-[#e5dac8] bg-[#fffdf9]/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <a
                href="/admin"
                aria-label="YM Realty Admin Dashboard"
                className="inline-flex items-center"
              >
                <Image
                  src="/images/ym-realty-logo.png"
                  alt="YM Realty"
                  width={190}
                  height={95}
                  priority
                  className="h-16 w-auto object-contain sm:h-[72px]"
                />
              </a>

              <p className="mt-1 text-sm text-[#81766a]">
                Admin Dashboard
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
              <a
                href="/admin/properties/new"
                className="flex min-h-11 items-center justify-center rounded-xl bg-[#2f271f] px-2 text-center text-xs font-semibold text-white transition hover:bg-[#211b16] sm:px-4 sm:text-sm"
              >
                + Add Property
              </a>

              <a
                href="/"
                className="flex min-h-11 items-center justify-center rounded-xl border border-[#e5dac8] bg-[#fffdf9] px-2 text-center text-xs font-semibold text-[#3d3329] transition hover:bg-[#f7f2e9] sm:px-4 sm:text-sm"
              >
                View Website
              </a>

              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-11 items-center justify-center rounded-xl bg-[#7b2f2f] px-2 text-center text-xs font-semibold text-white transition hover:bg-[#642525] sm:px-4 sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= DASHBOARD ================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 sm:mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#9a742f]">
            Property Management
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-[#2f271f] sm:text-4xl">
            Dashboard Overview
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#81766a] sm:text-base">
            Manage your properties and customer
            enquiries from one place.
          </p>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#e5dac8] bg-[#fffdf9] p-4 shadow-[0_10px_30px_rgba(80,60,30,0.06)] sm:p-6">
            <p className="text-xs font-medium text-[#81766a] sm:text-sm">
              Total Properties
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2f271f] sm:mt-3 sm:text-4xl">
              {properties.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5dac8] bg-[#fffdf9] p-4 shadow-[0_10px_30px_rgba(80,60,30,0.06)] sm:p-6">
            <p className="text-xs font-medium text-[#81766a] sm:text-sm">
              Property Enquiries
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2f271f] sm:mt-3 sm:text-4xl">
              {enquiries.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5dac8] bg-[#fffdf9] p-4 shadow-[0_10px_30px_rgba(80,60,30,0.06)] sm:p-6">
            <p className="text-xs font-medium text-[#81766a] sm:text-sm">
              Contact Enquiries
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2f271f] sm:mt-3 sm:text-4xl">
              {contactEnquiries.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5dac8] bg-[#fffdf9] p-4 shadow-[0_10px_30px_rgba(80,60,30,0.06)] sm:p-6">
            <p className="text-xs font-medium text-[#81766a] sm:text-sm">
              Available Properties
            </p>

            <p className="mt-2 text-3xl font-bold text-[#2f271f] sm:mt-3 sm:text-4xl">
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

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e5dac8] bg-[#fffdf9] shadow-[0_14px_40px_rgba(80,60,30,0.07)] sm:mt-10">
          <div className="flex flex-col gap-4 border-b border-[#e5dac8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-xl font-bold text-[#2f271f]">
                Properties
              </h3>

              <p className="mt-1 text-sm text-[#81766a]">
                Recently added properties
              </p>
            </div>

            <a
              href="/admin/properties/new"
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#b38a3e] px-4 text-sm font-semibold text-white transition hover:bg-[#96702f] sm:w-fit"
            >
              + Add Property
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#fbf7ef]">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-[#4b4035]">
                    Property
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-[#4b4035]">
                    Location
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-[#4b4035]">
                    Price
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-[#4b4035]">
                    Type
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-[#4b4035]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-[#4b4035]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-[#81766a]"
                    >
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  properties.map((property) => (
                    <tr
                      key={property._id}
                      className="border-t border-[#eee6d9] transition hover:bg-[#f7f2e9]"
                    >
                      <td className="max-w-xs px-5 py-4 font-semibold text-[#2f271f]">
                        {property.title}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#6d6256]">
                        {property.location}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#2f271f]">
                        {property.price}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#6d6256]">
                        {property.type}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            property.status ===
                            "Sold"
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
                            className="rounded-lg border border-[#d7c39b] bg-[#fbf5e9] px-3 py-2 text-xs font-semibold text-[#7b5d29] transition hover:bg-[#f1e5cf]"
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
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="border-t border-[#eee6d9] bg-[#f7f2e9] px-5 py-3 text-xs text-[#81766a] sm:hidden">
            Swipe horizontally to view all property
            details.
          </div>
        </div>

        {/* ================= CUSTOMER ENQUIRIES ================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e5dac8] bg-[#fffdf9] shadow-[0_14px_40px_rgba(80,60,30,0.07)] sm:mt-10">
          <div className="border-b border-[#e5dac8] p-5 sm:p-6">
            <h3 className="text-xl font-bold text-[#2f271f]">
              Customer Enquiries
            </h3>

            <p className="mt-1 text-sm text-[#81766a]">
              Recent enquiries from potential buyers
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {enquiries.length === 0 ? (
              <p className="p-5 text-sm text-[#81766a] sm:p-6">
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
                      <h4 className="font-semibold text-[#2f271f]">
                        {enquiry.name}
                      </h4>

                      <p className="mt-1 break-words text-sm text-[#81766a]">
                        {enquiry.email} ·{" "}
                        {enquiry.phone}
                      </p>

                      {enquiry.propertyTitle && (
                        <p className="mt-2 text-sm font-medium text-[#4b4035]">
                          Property:{" "}
                          {enquiry.propertyTitle}
                        </p>
                      )}
                    </div>

                    <div className="flex w-full flex-col items-start gap-2 md:w-auto md:items-end">
                      <p className="text-sm text-[#a1978b]">
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
                        className="min-h-11 w-full rounded-xl border border-[#e5dac8] bg-[#fffdf9] px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#b38a3e] focus:ring-4 focus:ring-[#b38a3e]/10 md:w-auto"
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

                  <p className="mt-4 rounded-xl bg-[#f7f2e9] p-4 text-sm leading-6 text-[#6d6256]">
                    {enquiry.message ||
                      "No message provided."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= CONTACT ENQUIRIES ================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e5dac8] bg-[#fffdf9] shadow-[0_14px_40px_rgba(80,60,30,0.07)] sm:mt-10">
          <div className="border-b border-[#e5dac8] p-5 sm:p-6">
            <h3 className="text-xl font-bold text-[#2f271f]">
              Contact Enquiries
            </h3>

            <p className="mt-1 text-sm text-[#81766a]">
              Enquiries submitted through the Contact
              page
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {contactEnquiries.length === 0 ? (
              <div className="p-5 sm:p-6">
                <p className="text-sm text-[#81766a]">
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
                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-[#2f271f]">
                        {contact.name}
                      </h4>

                      <div className="mt-2 flex flex-col gap-2 text-sm text-[#81766a]">
                        <a
                          href={`mailto:${contact.email}`}
                          className="w-fit break-all transition hover:text-[#96702f]"
                        >
                          📧 {contact.email}
                        </a>

                        <a
                          href={`tel:${contact.phone}`}
                          className="w-fit transition hover:text-[#96702f]"
                        >
                          📞 {contact.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <p className="text-sm text-[#a1978b]">
                        {new Date(
                          contact.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          contact.status ===
                          "New"
                            ? "bg-blue-100 text-[#6d5736]"
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

                  <div className="mt-5 rounded-xl bg-[#f7f2e9] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#a1978b]">
                      Message
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#4b4035]">
                      {contact.message ||
                        "No message provided."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= ACCOUNT SECURITY ================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e5dac8] bg-[#fffdf9] shadow-[0_14px_40px_rgba(80,60,30,0.07)] sm:mt-10">
          <div className="border-b border-[#e5dac8] bg-[#f7f2e9] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">
                🔐
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#2f271f]">
                  Account Security
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#81766a]">
                  Manage your admin email address and
                  password securely.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-2">
            {/* ================= CHANGE EMAIL ================= */}

            <div className="border-b border-[#e5dac8] p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="mb-5">
                <h4 className="text-lg font-bold text-[#2f271f]">
                  Change Admin Email
                </h4>

                <p className="mt-1 text-sm leading-6 text-[#81766a]">
                  Update the email address used for
                  your admin account.
                </p>
              </div>

              <form
                onSubmit={handleChangeEmail}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="currentEmail"
                    className="mb-2 block text-sm font-semibold text-[#4b4035]"
                  >
                    Current Email
                  </label>

                  <input
                    id="currentEmail"
                    type="email"
                    value={currentEmail}
                    onChange={(e) =>
                      setCurrentEmail(
                        e.target.value
                      )
                    }
                    placeholder="Current admin email"
                    autoComplete="email"
                    className="min-h-11 w-full rounded-xl border border-[#e5dac8] bg-[#f7f2e9] px-4 py-3 text-sm text-[#2f271f] outline-none transition placeholder:text-[#a1978b] focus:border-[#b38a3e] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#b38a3e]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newEmail"
                    className="mb-2 block text-sm font-semibold text-[#4b4035]"
                  >
                    New Email
                  </label>

                  <input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) =>
                      setNewEmail(
                        e.target.value
                      )
                    }
                    placeholder="Enter new email address"
                    autoComplete="email"
                    className="min-h-11 w-full rounded-xl border border-[#e5dac8] bg-[#fffdf9] px-4 py-3 text-sm text-[#2f271f] outline-none transition placeholder:text-[#a1978b] focus:border-[#b38a3e] focus:ring-4 focus:ring-[#b38a3e]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="emailPassword"
                    className="mb-2 block text-sm font-semibold text-[#4b4035]"
                  >
                    Current Password
                  </label>

                  <input
                    id="emailPassword"
                    type="password"
                    value={emailPassword}
                    onChange={(e) =>
                      setEmailPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="min-h-11 w-full rounded-xl border border-[#e5dac8] bg-[#fffdf9] px-4 py-3 text-sm text-[#2f271f] outline-none transition placeholder:text-[#a1978b] focus:border-[#b38a3e] focus:ring-4 focus:ring-[#b38a3e]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingEmail}
                  className="min-h-11 w-full rounded-xl bg-[#2f271f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#211b16] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingEmail
                    ? "Updating Email..."
                    : "Update Email"}
                </button>
              </form>
            </div>

            {/* ================= CHANGE PASSWORD ================= */}

            <div className="p-5 sm:p-6">
              <div className="mb-5">
                <h4 className="text-lg font-bold text-[#2f271f]">
                  Change Password
                </h4>

                <p className="mt-1 text-sm leading-6 text-[#81766a]">
                  Change your admin password to keep
                  your account secure.
                </p>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-[#4b4035]"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="min-h-11 w-full rounded-xl border border-[#e5dac8] bg-[#fffdf9] px-4 py-3 text-sm text-[#2f271f] outline-none transition placeholder:text-[#a1978b] focus:border-[#b38a3e] focus:ring-4 focus:ring-[#b38a3e]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-[#4b4035]"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="min-h-11 w-full rounded-xl border border-[#e5dac8] bg-[#fffdf9] px-4 py-3 text-sm text-[#2f271f] outline-none transition placeholder:text-[#a1978b] focus:border-[#b38a3e] focus:ring-4 focus:ring-[#b38a3e]/10"
                  />

                  <p className="mt-2 text-xs text-[#81766a]">
                    Minimum 8 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#4b4035]"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="min-h-11 w-full rounded-xl border border-[#e5dac8] bg-[#fffdf9] px-4 py-3 text-sm text-[#2f271f] outline-none transition placeholder:text-[#a1978b] focus:border-[#b38a3e] focus:ring-4 focus:ring-[#b38a3e]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="min-h-11 w-full rounded-xl bg-[#b38a3e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#96702f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-[#e5dac8] bg-[#fbf5e9] px-5 py-4 sm:px-6">
            <p className="text-xs leading-5 text-[#765823]">
              🔒 For security, your current password
              is required before changing your email
              address or password.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}