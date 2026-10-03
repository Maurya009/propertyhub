/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  ["The Story", "#story"],
  ["Residences", "#residences"],
  ["Amenities", "#amenities"],
  ["Gallery", "#gallery"],
];

type HeaderProps = {
  variant?: "solid" | "overlay";
  cta?: { label: string; href: string } | null;
};

export default function Header({
  variant = "solid",
  cta = { label: "Schedule a Visit", href: "#contact" },
}: HeaderProps) {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const overlay =
    variant === "overlay" && pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const getTarget = (href: string) => {
    if (!href.startsWith("#")) {
      return href;
    }

    return pathname === "/"
      ? href
      : `/${href}`;
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <header
      className={[
        "site-header",
        overlay
          ? "site-header-overlay"
          : "site-header-solid",
        scrolled
          ? "site-header-scrolled"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="site-header-inner">
        <Link
          href="/"
          className="ym-brand"
          aria-label="YM Realty home"
          onClick={() => setOpen(false)}
        >
          <img
            src="/brand/ym-realty-logo.png"
            alt="YM Realty"
            className="ym-brand-logo"
          />
        </Link>

        <nav
          className={`site-nav ${
            open ? "is-open" : ""
          }`}
          aria-label="Primary navigation"
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              href={getTarget(href)}
              onClick={handleNavClick}
            >
              {label}
            </a>
          ))}

          {cta && (
            <a
              className="nav-cta"
              href={getTarget(cta.href)}
              onClick={handleNavClick}
            >
              <span>{cta.label}</span>
              <span aria-hidden="true">
                →
              </span>
            </a>
          )}
        </nav>

        <button
          className={`mobile-menu-toggle ${
            open ? "is-open" : ""
          }`}
          type="button"
          aria-expanded={open}
          aria-label={
            open
              ? "Close navigation"
              : "Open navigation"
          }
          onClick={() =>
            setOpen((value) => !value)
          }
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
