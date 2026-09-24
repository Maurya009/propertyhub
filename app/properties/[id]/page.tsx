 
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */

import { notFound } from "next/navigation";
import EnquiryForm from "./EnquiryForm";

type Property = {
  _id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  beds: number;
  baths: number;
  area: string;
  status: string;
  description: string;
  image: string;
  images: string[];
  amenities: string[];
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getProperty(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_URL}/properties/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <a href="/" className="text-2xl font-bold">
            PROPERTY<span className="text-amber-500">HUB</span>
          </a>

          <nav className="hidden gap-8 text-sm font-medium md:flex">
            <a href="/" className="hover:text-amber-600">
              Home
            </a>

            <a href="/properties" className="text-amber-600">
              Properties
            </a>

            <a href="/#locations" className="hover:text-amber-600">
              Locations
            </a>

            <a href="/#about" className="hover:text-amber-600">
              About Us
            </a>

            <a href="/#contact" className="hover:text-amber-600">
              Contact
            </a>
          </nav>

          <a
            href="#enquiry"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Enquire Now
          </a>
        </div>
      </header>

      {/* BACK */}
      <section className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <a
          href="/properties"
          className="text-sm font-medium text-slate-500 hover:text-amber-600"
        >
          ← Back to Properties
        </a>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-105 overflow-hidden rounded-2xl md:col-span-2">
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="grid gap-4">
            <div className="h-50.5 overflow-hidden rounded-2xl">
              <img
                src={property.images[1]}
                alt={`${property.title} interior`}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="relative h-50.5 overflow-hidden rounded-2xl">
              <img
                src={property.images[2]}
                alt={`${property.title} room`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold">
                  View All Photos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}
          <div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                For Sale
              </span>

              <span className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
                {property.status}
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              📍 {property.location}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              {property.title}
            </h1>

            <p className="mt-5 text-3xl font-bold">{property.price}</p>

            {/* STATS */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-slate-200 py-6 sm:grid-cols-4">
              <div>
                <p className="text-sm text-slate-400">Bedrooms</p>
                <p className="mt-1 text-lg font-semibold">{property.beds}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Bathrooms</p>
                <p className="mt-1 text-lg font-semibold">{property.baths}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Area</p>
                <p className="mt-1 text-lg font-semibold">{property.area}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Type</p>
                <p className="mt-1 text-lg font-semibold">{property.type}</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold">About This Property</h2>

              <p className="mt-4 max-w-3xl leading-8 text-slate-600">
                {property.description}
              </p>
            </div>

            {/* AMENITIES */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold">Amenities & Features</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      ✓
                    </span>

                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LOCATION */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold">Location</h2>

              <div className="mt-5 flex h-72 items-center justify-center rounded-2xl bg-slate-200">
                <div className="text-center">
                  <p className="text-4xl">📍</p>

                  <p className="mt-3 font-semibold">{property.location}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    Google Maps will be integrated here
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div
              id="enquiry"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                Interested in this property?
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Contact Property Expert
              </h2>

              <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white">
                  PM
                </div>

                <div>
                  <p className="font-semibold">Property Manager</p>

                  <p className="text-sm text-slate-500">PROPERTYHUB</p>
                </div>
              </div>

              {/* ENQUIRY FORM */}
              <EnquiryForm propertyId={property._id} />

              {/* CONTACT BUTTONS */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-xl border border-slate-200 px-4 py-3 font-semibold">
                  📞 Call
                </button>

                <button className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white">
                  WhatsApp
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
          © 2026 PROPERTYHUB. All rights reserved.
        </div>
      </footer>
    </main>
  );
}