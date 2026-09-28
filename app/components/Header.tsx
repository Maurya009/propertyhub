"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks, site } from "../lib/site";

type HeaderProps = {
  variant?: "solid" | "overlay";
  cta?: { label: string; href: string } | null;
};

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({
  variant = "solid",
  cta = { label: "Get Started", href: "/properties" },
}: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const overlay = variant === "overlay";

  const wrapper = overlay
    ? "absolute left-0 right-0 top-0 z-50"
    : "relative z-50 border-b border-slate-200 bg-white";

  const logoColor = overlay ? "text-white" : "text-slate-900";
  const accent = overlay ? "text-amber-400" : "text-amber-500";

  const linkClass = (href: string) => {
    const active = isActive(pathname, href);

    if (overlay) {
      return `transition-colors hover:text-amber-400 ${
        active ? "text-amber-400" : "text-white"
      }`;
    }

    return `transition-colors hover:text-amber-600 ${
      active ? "text-amber-600" : "text-slate-900"
    }`;
  };

  const ctaClass = overlay
    ? "rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
    : "rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800";

  const burgerColor = overlay ? "text-white" : "text-slate-900";

  return (
    <header className={wrapper}>
      {/* Header bar */}
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className={`shrink-0 text-xl font-bold tracking-tight sm:text-2xl ${logoColor}`}
          onClick={() => setOpen(false)}
        >
          {site.brand.first}
          <span className={accent}>{site.brand.second}</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop CTA */}
          {cta && (
            <Link
              href={cta.href}
              className={`hidden lg:inline-flex ${ctaClass}`}
            >
              {cta.label}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((prev) => !prev)}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 lg:hidden ${
              overlay
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            } ${burgerColor}`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Background overlay */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-180 bg-slate-950/20"
        />

        {/* Menu panel */}
        <nav
          id="mobile-menu"
          className={`absolute left-0 right-0 top-full z-50 border-t shadow-2xl transition-all duration-200 ${
            open
              ? "translate-y-0"
              : "-translate-y-2"
          } ${
            overlay
              ? "border-slate-200 bg-white"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex min-h-13ms-center border-b border-slate-100 px-2 text-base font-medium transition-colors ${
                  isActive(pathname, link.href)
                    ? "text-amber-600"
                    : "text-slate-900 hover:text-amber-600"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {cta && (
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {cta.label}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}