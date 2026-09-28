/**
 * Single place for all company details.
 * Replace the placeholder values below with the real ones before going live
 * (Phase 5). Header, Footer, SEO metadata and sitemap all read from here.
 */

type SiteConfig = {
  brand: { first: string; second: string };
  name: string;
  tagline: string;
  description: string;
  url: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};

export const site: SiteConfig = {
  brand: { first: "PROPERTY", second: "HUB" },

  name: "PropertyHub",

  tagline: "Helping you find a place to call home.",

  description:
    "Browse verified apartments and villas for sale in Noida, Greater Noida and Gurgaon. Get expert assistance from enquiry to final decision.",

  // Public URL of the website
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000",

  phone: "+91 9354967107",

  whatsapp: "919354967107",

  email: "contact@propertyhub.com",

  address: "Delhi NCR, India",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "Locations", href: "/#locations" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/contact" },
] as const;