/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* Convert existing price string into Lakh */
function priceToLakh(price: string): number {
  const cleanPrice = price
    .replace("₹", "")
    .replace(/,/g, "")
    .trim();

  const value = parseFloat(cleanPrice);

  if (Number.isNaN(value)) {
    return 0;
  }

  if (cleanPrice.toLowerCase().includes("crore")) {
    return value * 100;
  }

  return value;
}

/* Apply budget filter without adding priceValue */
function applyBudgetFilter(
  list: Property[],
  minBudget: string,
  maxBudget: string
) {
  const min = Number(minBudget);
  const max = Number(maxBudget);

  return list.filter((property) => {
    const propertyPrice = priceToLakh(property.price);

    if (min > 0 && propertyPrice < min) {
      return false;
    }

    if (max > 0 && propertyPrice > max) {
      return false;
    }

    return true;
  });
}

export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("All");
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");

  const [minBudget, setMinBudget] = useState("0");
  const [maxBudget, setMaxBudget] = useState("0");

  const [sort, setSort] = useState("latest");

  const [searchResults, setSearchResults] = useState<Property[]>([]);

  /*
   * Read filters coming from homepage URL.
   *
   * Example:
   * /properties?location=Noida&type=Apartment&search=villa
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlLocation = params.get("location") || "All";
    const urlType = params.get("type") || "All";
    const urlSearch = params.get("search") || "";

    const urlMinBudget = params.get("minBudget") || "0";
    const urlMaxBudget = params.get("maxBudget") || "0";

    setLocation(urlLocation);
    setType(urlType);
    setSearch(urlSearch);

    setMinBudget(urlMinBudget);
    setMaxBudget(urlMaxBudget);
  }, []);

  /*
   * Initial property loading
   */
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/properties`);

        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }

        const json = await res.json();

        const properties = json.data || [];

        setAllProperties(properties);

        /*
         * Apply URL filters after initial load.
         */
        const params = new URLSearchParams(window.location.search);

        const urlLocation = params.get("location") || "All";
        const urlType = params.get("type") || "All";
        const urlSearch = params.get("search") || "";

        const urlMinBudget = params.get("minBudget") || "0";
        const urlMaxBudget = params.get("maxBudget") || "0";

        let filtered = [...properties];

        if (urlLocation !== "All") {
          filtered = filtered.filter(
            (property: Property) =>
              property.location.toLowerCase() ===
              urlLocation.toLowerCase()
          );
        }

        if (urlType !== "All") {
          filtered = filtered.filter(
            (property: Property) =>
              property.type.toLowerCase() === urlType.toLowerCase()
          );
        }

        if (urlSearch.trim()) {
          const searchText = urlSearch.toLowerCase().trim();

          filtered = filtered.filter(
            (property: Property) =>
              property.title.toLowerCase().includes(searchText) ||
              property.location.toLowerCase().includes(searchText)
          );
        }

        filtered = applyBudgetFilter(
          filtered,
          urlMinBudget,
          urlMaxBudget
        );

        setSearchResults(filtered);
      } catch (error) {
        console.error(error);
        setError(
          "Could not load properties. Is the server running?"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  /*
   * Search + all filters
   */
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (location !== "All") {
        params.set("location", location);
      }

      if (type !== "All") {
        params.set("type", type);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const query = params.toString();

      const res = await fetch(
        `${API_URL}/properties${query ? `?${query}` : ""}`
      );

      if (!res.ok) {
        throw new Error("Failed to search properties");
      }

      const json = await res.json();

      /*
       * Backend handles:
       * Location
       * Type
       * Search
       *
       * Frontend handles:
       * Min Budget
       * Max Budget
       */
      let filteredProperties: Property[] = json.data || [];

      filteredProperties = applyBudgetFilter(
        filteredProperties,
        minBudget,
        maxBudget
      );

      filteredProperties = applySort(
        filteredProperties,
        sort
      );

      setSearchResults(filteredProperties);

      /*
       * Update URL so filtered results can be shared/bookmarked.
       */
      const urlParams = new URLSearchParams();

      if (location !== "All") {
        urlParams.set("location", location);
      }

      if (type !== "All") {
        urlParams.set("type", type);
      }

      if (search.trim()) {
        urlParams.set("search", search.trim());
      }

      if (minBudget !== "0") {
        urlParams.set("minBudget", minBudget);
      }

      if (maxBudget !== "0") {
        urlParams.set("maxBudget", maxBudget);
      }

      const newUrl = urlParams.toString()
        ? `/properties?${urlParams.toString()}`
        : "/properties";

      window.history.replaceState({}, "", newUrl);
    } catch (error) {
      console.error(error);

      setError("Could not search properties.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Reset all filters
   */
  const handleReset = () => {
    setLocation("All");
    setType("All");
    setSearch("");
    setMinBudget("0");
    setMaxBudget("0");
    setSort("latest");

    setSearchResults(allProperties);

    window.history.replaceState({}, "", "/properties");
  };

  /*
   * Sorting
   */
  function applySort(list: Property[], sortValue: string) {
    const sorted = [...list];

    if (sortValue === "low") {
      sorted.sort(
        (a, b) =>
          priceToLakh(a.price) - priceToLakh(b.price)
      );
    }

    if (sortValue === "high") {
      sorted.sort(
        (a, b) =>
          priceToLakh(b.price) - priceToLakh(a.price)
      );
    }

    return sorted;
  }

  /*
   * Sort change
   */
  const handleSortChange = (value: string) => {
    setSort(value);

    setSearchResults((prev) =>
      applySort(prev, value)
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      {/* HERO */}
      <section className="bg-slate-950 px-6 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Properties For Sale
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Find a property that feels like home.
          </h1>

          <p className="mt-5 max-w-2xl text-slate-400">
            Explore homes, apartments and villas available for sale.
          </p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="mx-auto -mt-8 max-w-7xl px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-4 shadow-xl">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">

            {/* SEARCH */}
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search property or location..."
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-400"
            />

            {/* LOCATION */}
            <select
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="All">
                All Locations
              </option>

              <option value="Noida">
                Noida
              </option>

              <option value="Greater Noida">
                Greater Noida
              </option>

              <option value="Gurgaon">
                Gurgaon
              </option>
            </select>

            {/* TYPE */}
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="All">
                All Types
              </option>

              <option value="Apartment">
                Apartment
              </option>

              <option value="Villa">
                Villa
              </option>
            </select>

            {/* MIN BUDGET */}
            <select
              value={minBudget}
              onChange={(e) =>
                setMinBudget(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="0">
                Min Budget
              </option>

              <option value="25">
                ₹25 Lakh
              </option>

              <option value="50">
                ₹50 Lakh
              </option>

              <option value="75">
                ₹75 Lakh
              </option>

              <option value="100">
                ₹1 Crore
              </option>

              <option value="150">
                ₹1.5 Crore
              </option>

              <option value="200">
                ₹2 Crore
              </option>
            </select>

            {/* MAX BUDGET */}
            <select
              value={maxBudget}
              onChange={(e) =>
                setMaxBudget(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="0">
                Max Budget
              </option>

              <option value="50">
                ₹50 Lakh
              </option>

              <option value="75">
                ₹75 Lakh
              </option>

              <option value="100">
                ₹1 Crore
              </option>

              <option value="150">
                ₹1.5 Crore
              </option>

              <option value="200">
                ₹2 Crore
              </option>

              <option value="300">
                ₹3 Crore
              </option>
            </select>

            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Search
            </button>
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={handleReset}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      {/* PROPERTY LIST */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-slate-500">
              Showing {searchResults.length} properties
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Available Properties
            </h2>
          </div>

          {/* SORT */}
          <select
            value={sort}
            onChange={(e) =>
              handleSortChange(e.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="latest">
              Sort: Latest
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>
          </select>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              Loading properties...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
            <h3 className="text-2xl font-bold text-red-700">
              Something went wrong
            </h3>

            <p className="mt-3 text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* NO RESULTS */}
        {!loading &&
          !error &&
          searchResults.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <h3 className="text-2xl font-bold">
                No properties found
              </h3>

              <p className="mt-3 text-slate-500">
                Try changing your budget, location,
                search or property type.
              </p>

              <button
                onClick={handleReset}
                className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Reset Filters
              </button>
            </div>
          )}

        {/* PROPERTY CARDS */}
        {!loading &&
          !error &&
          searchResults.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((property) => (
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
                      {property.status ||
                        "For Sale"}
                    </span>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-slate-500">
                      📍 {property.location}
                    </p>

                    <h3 className="mt-2 text-xl font-bold">
                      {property.title}
                    </h3>

                    <p className="mt-3 text-sm text-slate-500">
                      {property.type}
                    </p>

                    <div className="mt-5 flex gap-4 border-b border-slate-100 pb-5 text-sm text-slate-500">
                      <span>
                        🛏 {property.beds} Beds
                      </span>

                      <span>
                        🚿 {property.baths} Baths
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {property.price}
                        </p>
                      </div>

                      <a
                        href={`/properties/${property._id}`}
                        className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Details →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-amber-400 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Can&apos;t find what you&apos;re looking for?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-700">
            Tell us your requirements and our property
            experts can help you find suitable options.
          </p>

          <a
            href="/contact"
            className="mt-7 inline-block rounded-full bg-slate-950 px-7 py-3.5 font-semibold text-white"
          >
            Contact Property Expert
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}