/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useEffect,
  useState,
} from "react";
import { getBrowserApiUrl } from "../lib/api";

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
  description?: string;
};

const fallbackImages = [
  "/story-house/02.webp",
  "/story-house/01.webp",
];

const fallbackDescription =
  "Generous proportions, considered circulation and balcony space designed to bring daylight and air into everyday living.";

export default function ResidenceExplorer() {
  const [residences, setResidences] =
    useState<Residence[]>([]);

  const [activeId, setActiveId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadResidences() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${getBrowserApiUrl()}/properties`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message ||
              "Unable to load residences."
          );
        }

        const data = Array.isArray(result?.data)
          ? result.data
          : [];

        if (!mounted) return;

        setResidences(data);

        setActiveId(
          data.length > 0
            ? data[0]._id
            : null
        );
      } catch (err) {
        console.error(
          "Residence API unavailable.",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load residences."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadResidences();

    return () => {
      mounted = false;
    };
  }, []);

  const activeResidence =
    residences.find(
      (item) => item._id === activeId
    ) || residences[0];

  function getImage(
    residence: Residence,
    index: number
  ) {
    return (
      residence.floorPlan ||
      residence.image ||
      fallbackImages[
        index % fallbackImages.length
      ]
    );
  }

  if (loading) {
    return (
      <div className="residence-explorer">
        <div className="residence-loading">
          Loading residences...
        </div>

        <style jsx>{`
          .residence-loading {
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #dedbd5;
            color: #7d796f;
            font-size: 11px;
          }
        `}</style>
      </div>
    );
  }

  if (!activeResidence) {
    return (
      <div className="residence-explorer">
        <div className="residence-loading">
          {error ||
            "No residences are available yet."}
        </div>

        <style jsx>{`
          .residence-loading {
            min-height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #dedbd5;
            color: #7d796f;
            font-size: 11px;
          }
        `}</style>
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    residences.findIndex(
      (item) =>
        item._id === activeResidence._id
    )
  );

  return (
    <div className="residence-explorer">
      <div
        className="residence-tabs"
        role="tablist"
        aria-label="Residence plans"
      >
        {residences.map(
          (residence, index) => (
            <button
              key={residence._id}
              type="button"
              role="tab"
              aria-selected={
                activeResidence._id ===
                residence._id
              }
              className={`residence-tab ${
                activeResidence._id ===
                residence._id
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                setActiveId(
                  residence._id
                )
              }
            >
              {residence.title ||
                `${residence.bhk || ""} · ${
                  residence.unitType ||
                  `Type ${index + 1}`
                }`}
            </button>
          )
        )}
      </div>

      <div className="residence-detail">
        <div className="residence-plan-image">
          <img
            key={activeResidence._id}
            src={getImage(
              activeResidence,
              activeIndex
            )}
            alt={`${activeResidence.title} floor plan`}
          />
        </div>

        <div className="residence-copy">
          <span className="eyebrow eyebrow-dark">
            Floor plans
          </span>

          <h3>
            {activeResidence.title}
          </h3>

          <p>
            {activeResidence.description ||
              fallbackDescription}
          </p>

          <div className="plan-metrics">
            <div>
              <span>
                Carpet Area
              </span>

              <strong>
                {activeResidence.carpetArea ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>
                Balcony Area
              </span>

              <strong>
                {activeResidence.balconyArea ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>
                Super Area
              </span>

              <strong>
                {activeResidence.superArea ||
                  "—"}
              </strong>
            </div>
          </div>

          <a
            className="button button-dark"
            href="/contact"
          >
            Enquire about this residence
            <span aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
