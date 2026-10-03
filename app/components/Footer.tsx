"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../lib/api";

const fallbackOfficeAddress =
  "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007";

export default function Footer() {
  const [officeAddress, setOfficeAddress] =
    useState(fallbackOfficeAddress);

  const [mapsQuery, setMapsQuery] =
    useState(
      encodeURIComponent(
        fallbackOfficeAddress
      )
    );

  useEffect(() => {
    let mounted = true;

    async function loadLocation() {
      try {
        const response = await fetch(
          `${getBrowserApiUrl()}/location`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result?.success ||
          result?.data?.active === false
        ) {
          return;
        }

        const address =
          result?.data?.office?.address?.trim();

        const mapQuery =
          result?.data?.office?.mapQuery?.trim();

        if (mounted && address) {
          setOfficeAddress(address);
        }

        if (mounted) {
          setMapsQuery(
            encodeURIComponent(
              mapQuery ||
                address ||
                fallbackOfficeAddress
            )
          );
        }
      } catch (error) {
        console.error(
          "Location API unavailable. Using footer fallback.",
          error
        );
      }
    }

    void loadLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="ym-footer">
      <div className="ym-footer-inner">
        <div className="ym-footer-main">
          <div className="ym-footer-brand">
            <img
              src="/brand/ym-realty-logo.png"
              alt="YM Realty"
            />

            <p>
              Driven by vision, defined by quality.
            </p>

            <span>
              The Story House
            </span>
          </div>

          <div className="ym-footer-column">
            <span className="ym-footer-label">
              Explore
            </span>

            <a href="#story">The Story</a>
            <a href="#residences">Residences</a>
            <a href="#amenities">Amenities</a>
            <a href="#gallery">Gallery</a>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="ym-footer-column">
            <span className="ym-footer-label">
              Office &amp; Contact
            </span>

            <p>{officeAddress}</p>

            <a href="tel:+919354967107">
              +91 93549 67107
            </a>

            <Link href="/contact">
              Send an enquiry ↗
            </Link>
          </div>
        </div>

        <div className="ym-footer-map-section">
          <div className="ym-footer-map-heading">
            <div>
              <span className="ym-footer-label">
                Location
              </span>

              <h3>
                Find us on the map
              </h3>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="ym-footer-map-link"
            >
              Open in Google Maps ↗
            </a>
          </div>

          <div className="ym-footer-map">
            <iframe
              title="YM Realty office location"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div className="ym-footer-bottom">
        <span>
          © {new Date().getFullYear()} YM Realty. All rights reserved.
        </span>

        <span>
          Visuals and specifications are indicative.
        </span>
      </div>

      <style jsx>{`
        .ym-footer {
          background: #191816;
          color: #fffdf8;
          padding: 58px 28px 20px;
        }

        .ym-footer-inner {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .ym-footer-main {
          display: grid;
          grid-template-columns: 1.25fr 0.7fr 1fr;
          gap: 55px;
          padding-bottom: 42px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.11);
        }

        .ym-footer-brand img {
          width: 135px;
          height: auto;
          display: block;
          margin-bottom: 20px;
        }

        .ym-footer-brand p {
          max-width: 250px;
          margin: 0 0 7px;
          color: rgba(255, 253, 248, 0.58);
          font-size: 12px;
          line-height: 1.6;
        }

        .ym-footer-brand > span {
          color: #c7a269;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 16px;
        }

        .ym-footer-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 9px;
        }

        .ym-footer-label {
          display: block;
          margin-bottom: 5px;
          color: rgba(255, 253, 248, 0.38);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.17em;
        }

        .ym-footer-column a,
        .ym-footer-column p {
          margin: 0;
          color: rgba(255, 253, 248, 0.7);
          text-decoration: none;
          font-size: 12px;
          line-height: 1.65;
        }

        .ym-footer-column a:hover {
          color: #fffdf8;
        }

        .ym-footer-column p {
          max-width: 250px;
        }

        .ym-footer-map-section {
          padding: 27px 0 0;
        }

        .ym-footer-map-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 13px;
        }

        .ym-footer-map-heading h3 {
          margin: 5px 0 0;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 23px;
          font-weight: 500;
        }

        .ym-footer-map-link {
          color: #d0b37d;
          text-decoration: none;
          font-size: 10px;
          white-space: nowrap;
        }

        .ym-footer-map-link:hover {
          color: #fffdf8;
        }

        .ym-footer-map {
          width: 100%;
          height: 300px;
          overflow: hidden;
          border: 1px solid
            rgba(255, 255, 255, 0.12);
          background: #25231f;
        }

        .ym-footer-map iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
          filter: grayscale(1) contrast(0.92);
          opacity: 0.9;
        }

        .ym-footer-bottom {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding-top: 17px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: rgba(255, 253, 248, 0.36);
          font-size: 9px;
          line-height: 1.5;
        }

        @media (max-width: 850px) {
          .ym-footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 35px;
          }

          .ym-footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 600px) {
          .ym-footer {
            padding: 45px 18px 18px;
          }

          .ym-footer-main {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .ym-footer-brand {
            grid-column: auto;
          }

          .ym-footer-map-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .ym-footer-map {
            height: 250px;
          }

          .ym-footer-bottom {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
}
