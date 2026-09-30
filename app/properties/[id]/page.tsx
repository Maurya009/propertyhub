/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EnquiryForm from "./EnquiryForm";
import PropertyGallery from "./PropertyGallery";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getServerApiUrl } from "../../lib/api";

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

const API_URL = getServerApiUrl();

/*
  Replace this number with your real business WhatsApp/call number.
  Format:
  Country code + number
  Example India: 919876543210
  Do NOT use +, spaces or hyphens.
*/
import { site } from "../../lib/site";

const CONTACT_PHONE = site.whatsapp;

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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return {
      title: "Property not found",
    };
  }

  const bhk = property.beds > 0 ? `${property.beds} BHK ` : "";

  const summary = `${bhk}${property.type} in ${property.location} for ${property.price}. ${property.description}`;

  const description =
    summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;

  return {
    title: `${property.title}, ${property.location}`,
    description,
    openGraph: {
      title: property.title,
      description,
      images: property.image ? [property.image] : [],
    },
  };
}

export default async function PropertyDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header cta={{ label: "Enquire Now", href: "#enquiry" }} />

      {/* BACK */}
      <section className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <a
          href="/properties"
          className="text-sm font-medium text-slate-500 transition hover:text-amber-600"
        >
          ← Back to Properties
        </a>
      </section>

      {/* GALLERY */}
<section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
  <PropertyGallery
    images={property.images?.length ? property.images : [property.image]}
    title={property.title}
  />
</section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}
          <div>
            {/* STATUS */}
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                For Sale
              </span>

              <span className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
                {property.status}
              </span>
            </div>

            {/* LOCATION */}
            <p className="mt-6 text-sm font-medium text-slate-500">
              📍 {property.location}
            </p>

            {/* TITLE */}
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              {property.title}
            </h1>

            {/* PRICE */}
            <p className="mt-5 text-3xl font-bold">{property.price}</p>

            {/* STATS */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-slate-200 py-6 sm:grid-cols-4">
              <div>
                <p className="text-sm text-slate-400">
                  Bedrooms
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {property.beds}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Bathrooms
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {property.baths}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Area
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {property.area}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Type
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {property.type}
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold">
                About This Property
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-slate-600">
                {property.description}
              </p>
            </div>

            {/* AMENITIES */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold">
                Amenities & Features
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      ✓
                    </span>

                    <span className="font-medium">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* LOCATION */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold">
                Location
              </h2>

              <div className="mt-5 flex h-72 items-center justify-center rounded-2xl bg-slate-200">
                <div className="text-center">
                  <p className="text-4xl">📍</p>

                  <p className="mt-3 font-semibold">
                    {property.location}
                  </p>

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

              {/* PROPERTY MANAGER */}
              <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white">
                  PM
                </div>

                <div>
                  <p className="font-semibold">
                    Property Manager
                  </p>

                  <p className="text-sm text-slate-500">
                  YM REALTY
                  </p>
                </div>
              </div>

              {/* ENQUIRY FORM */}
              <EnquiryForm propertyId={property._id} />

              {/* CONTACT BUTTONS */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* CALL */}
                <a
                  href={`tel:+${CONTACT_PHONE}`}
                  className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 font-semibold transition hover:bg-slate-50"
                >
                  📞 Call
                </a>

                {/* WHATSAPP */}
                <a
                  href={`https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent(
                    `Hi, I am interested in ${property.title} in ${property.location}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}