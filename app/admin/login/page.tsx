"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserApiUrl } from "@/app/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${getBrowserApiUrl()}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Invalid email or password");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ym-login-page">
      <div className="ym-login-shell">
        {/* LEFT BRAND PANEL */}
        <section className="ym-login-brand-panel">
          <div className="ym-login-brand-top">
            <Link href="/" aria-label="YM Realty home">
              <img
                src="/brand/ym-realty-logo.png"
                alt="YM Realty"
                className="ym-login-logo"
              />
            </Link>

            <span className="ym-login-brand-tag">
              ADMINISTRATION
            </span>
          </div>

          <div className="ym-login-brand-middle">
            <div className="ym-login-accent-line" />

            <span className="ym-login-eyebrow">
              YM REALTY
            </span>

            <h1>
              Everything your
              <br />
              property needs.
            </h1>

            <p>
              One workspace for your residences, visual content,
              enquiries and website experience.
            </p>
          </div>

          <div className="ym-login-brand-bottom">
            <span>THE STORY HOUSE</span>
            <span className="ym-login-dot">•</span>
            <span>WEBSITE MANAGEMENT</span>
          </div>
        </section>

        {/* RIGHT FORM PANEL */}
        <section className="ym-login-form-panel">
          <div className="ym-login-form-wrap">
            <div className="ym-login-form-top">
              <span className="ym-login-form-label">
                SECURE ACCESS
              </span>

              <span className="ym-login-form-company">
                YM REALTY
              </span>
            </div>

            <div className="ym-login-heading">
              <h2>Admin Login</h2>

              <p>
                Sign in to continue to your management workspace.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="ym-login-form"
            >
              <div className="ym-login-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="ym-login-field">
                <div className="ym-login-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <span>Private access</span>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div
                  className="ym-login-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="ym-login-button"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing in..." : "Sign in"}
                </span>

                <span
                  className="ym-login-button-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </form>

            <div className="ym-login-bottom">
              <Link
                href="/"
                className="ym-login-back"
              >
                <span aria-hidden="true">←</span>
                Back to website
              </Link>

              <div className="ym-login-security">
                <span className="ym-login-security-dot" />
                Authorized administration only
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .ym-login-page {
          min-height: 100svh;
          padding: 22px;
          box-sizing: border-box;
          background: #f1f0ed;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ym-login-shell {
          width: min(1140px, 100%);
          min-height: 680px;
          display: grid;
          grid-template-columns: 40% 60%;
          overflow: hidden;
          border: 1px solid #dddcd8;
          border-radius: 20px;
          background: #fbfaf8;
          box-shadow:
            0 28px 70px rgba(30, 28, 24, 0.1),
            0 4px 14px rgba(30, 28, 24, 0.04);
        }

        /* LEFT BRAND PANEL */

        .ym-login-brand-panel {
          position: relative;
          padding: 42px 42px 34px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 100% 88%,
              rgba(181, 155, 106, 0.08),
              transparent 30%
            ),
            #171819;
          color: #ffffff;
        }

        .ym-login-brand-panel::before {
          content: "";
          position: absolute;
          width: 430px;
          height: 430px;
          right: -250px;
          bottom: -250px;
          border: 1px solid rgba(197, 171, 119, 0.15);
          border-radius: 50%;
        }

        .ym-login-brand-panel::after {
          content: "";
          position: absolute;
          width: 290px;
          height: 290px;
          right: -165px;
          bottom: -165px;
          border: 1px solid rgba(197, 171, 119, 0.09);
          border-radius: 50%;
        }

        .ym-login-brand-top,
        .ym-login-brand-middle,
        .ym-login-brand-bottom {
          position: relative;
          z-index: 2;
        }

        .ym-login-brand-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .ym-login-logo {
          width: 154px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .ym-login-brand-panel .ym-login-logo {
          background: transparent;
        }

        .ym-login-brand-tag {
          padding-top: 5px;
          color: rgba(255, 255, 255, 0.42);
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.16em;
          font-weight: 700;
        }

        .ym-login-brand-middle {
          max-width: 350px;
          margin-top: auto;
          margin-bottom: auto;
          padding: 60px 0 50px;
        }

        .ym-login-accent-line {
          width: 34px;
          height: 1px;
          margin-bottom: 22px;
          background: #b9a171;
        }

        .ym-login-eyebrow {
          display: block;
          margin-bottom: 16px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 700;
        }

        .ym-login-brand-middle h1 {
          margin: 0;
          max-width: 350px;
          font-size: clamp(34px, 3.5vw, 47px);
          line-height: 1.03;
          letter-spacing: -0.048em;
          font-weight: 500;
        }

        .ym-login-brand-middle p {
          max-width: 315px;
          margin: 24px 0 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          line-height: 1.75;
        }

        .ym-login-brand-bottom {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.34);
          font-size: 9px;
          letter-spacing: 0.14em;
          font-weight: 700;
        }

        .ym-login-dot {
          color: #b9a171;
        }

        /* RIGHT FORM PANEL */

        .ym-login-form-panel {
          padding: 52px 72px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          background: #fbfaf8;
        }

        .ym-login-form-wrap {
          width: min(430px, 100%);
          margin: 0 auto;
        }

        .ym-login-form-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 52px;
        }

        .ym-login-form-label,
        .ym-login-form-company {
          font-size: 9px;
          letter-spacing: 0.16em;
          font-weight: 700;
        }

        .ym-login-form-label {
          color: #aaa7a1;
        }

        .ym-login-form-company {
          color: #57554f;
        }

        .ym-login-heading {
          margin-bottom: 38px;
        }

        .ym-login-heading h2 {
          margin: 0;
          color: #181918;
          font-size: 42px;
          line-height: 1.05;
          letter-spacing: -0.045em;
          font-weight: 600;
        }

        .ym-login-heading p {
          max-width: 365px;
          margin: 13px 0 0;
          color: #85827b;
          font-size: 13px;
          line-height: 1.65;
        }

        .ym-login-form {
          display: flex;
          flex-direction: column;
          gap: 21px;
        }

        .ym-login-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .ym-login-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .ym-login-field label {
          color: #2c2d2b;
          font-size: 12px;
          line-height: 1;
          font-weight: 700;
        }

        .ym-login-label-row span {
          color: #aaa69f;
          font-size: 10px;
        }

        .ym-login-field input {
          width: 100%;
          height: 54px;
          padding: 0 15px;
          box-sizing: border-box;
          border: 1px solid #dedcd7;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #1d1e1c;
          font-size: 13px;
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease,
            transform 180ms ease;
        }

        .ym-login-field input::placeholder {
          color: #aaa8a3;
        }

        .ym-login-field input:hover:not(:disabled) {
          border-color: #c9c6c0;
        }

        .ym-login-field input:focus {
          border-color: #1c1d1b;
          box-shadow:
            0 0 0 3px rgba(185, 161, 113, 0.12);
        }

        .ym-login-field input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .ym-login-error {
          padding: 11px 13px;
          border: 1px solid #ead4d0;
          border-radius: 8px;
          background: #fff8f6;
          color: #9b4c42;
          font-size: 12px;
          line-height: 1.5;
        }

        .ym-login-button {
          width: 100%;
          height: 55px;
          margin-top: 5px;
          border: 0;
          border-radius: 8px;
          background: #191a19;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          transition:
            background 180ms ease,
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .ym-login-button-arrow {
          color: #b9a171;
          font-size: 16px;
          transition: transform 180ms ease;
        }

        .ym-login-button:hover:not(:disabled) {
          background: #222321;
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(18, 18, 18, 0.12);
        }

        .ym-login-button:hover:not(:disabled)
          .ym-login-button-arrow {
          transform: translateX(4px);
        }

        .ym-login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .ym-login-bottom {
          margin-top: 34px;
          padding-top: 21px;
          border-top: 1px solid #e8e6e1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .ym-login-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #464541;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          transition: color 180ms ease;
        }

        .ym-login-back:hover {
          color: #161715;
        }

        .ym-login-back span {
          font-size: 14px;
        }

        .ym-login-security {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #a4a19b;
          font-size: 10px;
          white-space: nowrap;
        }

        .ym-login-security-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #b9a171;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .ym-login-page {
            padding: 14px;
          }

          .ym-login-shell {
            min-height: calc(100svh - 28px);
            grid-template-columns: 1fr;
            border-radius: 18px;
          }

          .ym-login-brand-panel {
            display: none;
          }

          .ym-login-form-panel {
            padding: 42px 30px;
          }

          .ym-login-form-top {
            margin-bottom: 48px;
          }

          .ym-login-heading h2 {
            font-size: 36px;
          }
        }

        /* MOBILE */

        @media (max-width: 520px) {
          .ym-login-page {
            padding: 0;
            background: #fbfaf8;
          }

          .ym-login-shell {
            min-height: 100svh;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }

          .ym-login-form-panel {
            align-items: flex-start;
            padding: 30px 20px;
          }

          .ym-login-form-wrap {
            width: 100%;
          }

          .ym-login-form-top {
            margin-bottom: 58px;
          }

          .ym-login-heading {
            margin-bottom: 31px;
          }

          .ym-login-heading h2 {
            font-size: 34px;
          }

          .ym-login-bottom {
            flex-direction: column;
            align-items: flex-start;
          }

          .ym-login-security {
            white-space: normal;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ym-login-field input,
          .ym-login-button,
          .ym-login-button-arrow,
          .ym-login-back {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}