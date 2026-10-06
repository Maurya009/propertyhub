"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserApiUrl } from "../lib/api";

const fallbackOfficeAddress =
  "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007";

export default function Footer() {
  const [officeAddress, setOfficeAddress] =
    useState(fallbackOfficeAddress);

  const [mapsQuery, setMapsQuery] = useState(
    encodeURIComponent(fallbackOfficeAddress)
  );

  useEffect(() => {
    let mounted = true;

    async function loadLocation() {
      try {
        const response = await fetch(
          `${getBrowserApiUrl()}/location`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result?.success ||
          result?.data?.active === false
        ) {
          return;
        }

        const address = result?.data?.office?.address?.trim();
        const mapQuery = result?.data?.office?.mapQuery?.trim();

        if (mounted && address) {
          setOfficeAddress(address);
        }

        if (mounted) {
          setMapsQuery(
            encodeURIComponent(
              mapQuery || address || fallbackOfficeAddress
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

        <div className="ym-footer-grid">

          {/* Brand */}
          <div className="ym-footer-brand">
            <img
              src="/brand/ym-realty-logo.png"
              alt="YM Realty"
            />

            <p>
              Driven by vision, defined by quality.
            </p>

            <span>The Story House</span>
          </div>

          {/* Explore */}
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

          {/* Office */}
          <div className="ym-footer-column ym-footer-office">
            <span className="ym-footer-label">
              Office &amp; Contact
            </span>

            <p>{officeAddress}</p>

            <a href="tel:+919354967107">
              +91 93549 67107
            </a>

            <a href="mailto:info@ymrealty.in">
              info@ymrealty.in
            </a>

            <Link href="/contact" className="ym-footer-enquiry">
              Send an enquiry ↗
            </Link>
          </div>

          {/* Map */}
          <div className="ym-footer-map-column">
            <div className="ym-footer-map-heading">
              <div>
                <span className="ym-footer-label">
                  Location
                </span>

                <h3>Find us on the map</h3>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
                className="ym-footer-map-link"
              >
                Open ↗
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

      </div>

      <style jsx>{`
        .ym-footer {
          background: #191816;
          color: #fffdf8;
          padding: 56px 28px 20px;
        }

        .ym-footer-inner {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .ym-footer-grid {
          display: grid;
          grid-template-columns:
            1.1fr
            0.62fr
            0.95fr
            1.45fr;
          gap: 38px;
          align-items: start;
          padding-bottom: 42px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ym-footer-brand img {
          width: 132px;
          height: auto;
          display: block;
          margin-bottom: 20px;
        }

        .ym-footer-brand p {
          max-width: 220px;
          margin: 0 0 8px;
          color: rgba(255, 253, 248, 0.56);
          font-size: 12px;
          line-height: 1.6;
        }

        .ym-footer-brand > span {
          color: #c7a269;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
        }

        .ym-footer-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .ym-footer-label {
          display: block;
          margin-bottom: 6px;
          color: rgba(255, 253, 248, 0.38);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.17em;
        }

        .ym-footer-column a,
        .ym-footer-column p {
          margin: 0;
          max-width: 240px;
          color: rgba(255, 253, 248, 0.69);
          text-decoration: none;
          font-size: 12px;
          line-height: 1.65;
        }

        .ym-footer-column a:hover,
        .ym-footer-enquiry {
          color: #fffdf8;
        }

        .ym-footer-enquiry {
          margin-top: 8px !important;
          color: #d0b37d !important;
          font-size: 13px !important;
        }

        .ym-footer-map-column {
          min-width: 0;
        }

        .ym-footer-map-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 12px;
        }

        .ym-footer-map-heading h3 {
          margin: 5px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          line-height: 1.05;
          font-weight: 500;
        }

        .ym-footer-map-link {
          flex: 0 0 auto;
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
          height: 235px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: rgba(255, 253, 248, 0.34);
          font-size: 9px;
          line-height: 1.5;
        }

        @media (max-width: 980px) {
          .ym-footer-grid {
            grid-template-columns:
              1.1fr
              0.7fr
              1fr;
            gap: 30px;
          }

          .ym-footer-map-column {
            grid-column: 1 / -1;
          }

          .ym-footer-map {
            height: 280px;
          }
        }

        @media (max-width: 620px) {
          .ym-footer {
            padding: 44px 18px 18px;
          }

          .ym-footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
            padding-bottom: 32px;
          }

          .ym-footer-map-column {
            grid-column: auto;
          }

          .ym-footer-map {
            height: 240px;
          }

          .ym-footer-map-heading {
            align-items: center;
          }

          .ym-footer-bottom {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </footer>
  );
}
