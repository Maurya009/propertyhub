/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FavoriteButton from "./components/FavoriteButton";
export const dynamic = "force-dynamic";


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
  image: string;
};

const locations = [
  {
    name: "Noida",
    properties: "120+ Properties",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Greater Noida",
    properties: "85+ Properties",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Gurgaon",
    properties: "95+ Properties",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
  },
];

export default async function Home() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  let properties: Property[] = [];

  try {
    const res = await fetch(`${API_URL}/properties`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      properties = (data.data || []).slice(0, 3);
    }
  } catch (error) {
    console.error("Failed to load homepage properties:", error);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header variant="overlay" />

      {/* HERO */}
      <section className="relative flex min-h-180 items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2200&q=85')",
          }}
        />

        <div className="absolute inset-0 bg-slate-950/65" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
              Find Your Perfect Property
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
              Find a place
              <br />
              you&apos;ll call <span className="text-amber-400">home.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Discover carefully selected properties in the best locations.
              Find a home that matches your lifestyle and future.
            </p>
          </div>

          {/* SEARCH BOX */}
          <form
            action="/properties"
            method="GET"
            className="mt-12 max-w-5xl rounded-2xl bg-white p-3 shadow-2xl"
          >
            <div className="grid gap-3 md:grid-cols-4">
              {/* LOCATION */}
              <div className="rounded-xl border border-slate-200 px-5 py-3">
                <label
                  htmlFor="home-location"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  Location
                </label>

                <select
                  id="home-location"
                  name="location"
                  defaultValue="All"
                  className="mt-1 w-full bg-transparent font-medium text-slate-900 outline-none"
                >
                  <option value="All">All Locations</option>
                  <option value="Noida">Noida</option>
                  <option value="Greater Noida">Greater Noida</option>
                  <option value="Gurgaon">Gurgaon</option>
                </select>
              </div>

              {/* PROPERTY TYPE */}
              <div className="rounded-xl border border-slate-200 px-5 py-3">
                <label
                  htmlFor="home-type"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  Property Type
                </label>

                <select
                  id="home-type"
                  name="type"
                  defaultValue="All"
                  className="mt-1 w-full bg-transparent font-medium text-slate-900 outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>

              {/* SEARCH */}
              <div className="rounded-xl border border-slate-200 px-5 py-3">
                <label
                  htmlFor="home-search"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  Search
                </label>

                <input
                  id="home-search"
                  name="search"
                  type="text"
                  placeholder="Property or location"
                  className="mt-1 w-full bg-transparent font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* SEARCH BUTTON */}
              <button
                type="submit"
                className="flex items-center justify-center rounded-xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800"
              >
                Search Property
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section
        id="properties"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Featured Properties
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Properties worth exploring
            </h2>

            <p className="mt-4 max-w-2xl text-slate-500">
              Explore some of our handpicked properties in premium locations.
            </p>
          </div>

          <Link
            href="/properties"
            className="w-fit rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold transition hover:border-slate-950"
          >
            View All Properties →
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <h3 className="text-xl font-bold">Properties coming soon</h3>

            <p className="mt-2 text-slate-500">
              New properties will appear here once they are added.
            </p>

            <Link
              href="/properties"
              className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <article
                key={property._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold">
                    {property.status || "For Sale"}
                  </span>

                  {/* WORKING FAVOURITE BUTTON */}
                  <FavoriteButton propertyId={property._id} />
                </div>

                <div className="p-6">
                  <p className="text-sm text-slate-500">
                    📍 {property.location}
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {property.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-500">
                    {property.beds} Beds • {property.baths} Baths •{" "}
                    {property.area}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    <p className="text-xl font-bold">{property.price}</p>

                    <Link
                      href={`/properties/${property._id}`}
                      className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Popular Locations
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Explore properties by location
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {locations.map((location) => (
              <Link
                key={location.name}
                href={`/properties?location=${encodeURIComponent(
                  location.name
                )}`}
                className="group relative h-80 overflow-hidden rounded-2xl"
              >
                <img
                  src={location.image}
                  alt={location.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold">{location.name}</h3>

                  <p className="mt-1 text-sm text-slate-200">
                    {location.properties}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Why Choose Us
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Property buying made simpler.
            </h2>

            <p className="mt-6 leading-8 text-slate-500">
              We help buyers discover properties that fit their requirements,
              budget and lifestyle while providing guidance throughout the
              buying journey.
            </p>

            <div className="mt-8 space-y-5">
              {[
                [
                  "01",
                  "Verified Properties",
                  "Quality listings with accurate property information.",
                ],
                [
                  "02",
                  "Expert Assistance",
                  "Get guidance from experienced property professionals.",
                ],
                [
                  "03",
                  "Transparent Process",
                  "Clear communication from enquiry to final decision.",
                ],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                    {number}
                  </div>

                  <div>
                    <h3 className="font-bold">{title}</h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"
              alt="Modern property"
              className="h-140 w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="mx-auto max-w-7xl px-6 pb-24 lg:px-8"
      >
        <div className="overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 text-center md:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Let&apos;s Find Your Property
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
            Looking for your next property?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-slate-400">
            Tell us what you are looking for and our property experts will help
            you find suitable options.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-amber-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Get Property Assistance
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}