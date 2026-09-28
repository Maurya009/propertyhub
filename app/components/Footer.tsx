import Link from "next/link";
import { navLinks, site } from "../lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3 lg:px-8">
        <div>
          <div className="text-xl font-bold">
            {site.brand.first}
            <span className="text-amber-500">{site.brand.second}</span>
          </div>

          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            {site.tagline}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Quick Links
          </h3>

          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-amber-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Contact
          </h3>

          <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
            {site.phone && (
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s+/g, "")}`}
                  className="hover:text-amber-600"
                >
                  📞 {site.phone}
                </a>
              </li>
            )}

            {site.email && (
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="hover:text-amber-600"
                >
                  ✉️ {site.email}
                </a>
              </li>
            )}

            {site.address && <li>📍 {site.address}</li>}

            <li>
              <Link href="/contact" className="font-medium text-amber-600">
                Send us an enquiry →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <p className="mx-auto max-w-7xl px-6 py-5 text-center text-sm text-slate-400 lg:px-8">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
