/**
 * Single place for all company details.
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
  brand: {
    first: "YM",
    second: "REALTY",
  },

  name: "YM Realty",

  tagline: "Real Estate. Redefined.",

  description:
    "Discover carefully selected properties in Noida, Greater Noida and Gurgaon. Find a home that matches your lifestyle and future.",

  // Public URL of the website
  url:
    process.env.SITE_URL ||
    "https://ymrealty.in",

  phone: "+91 9354967107",

  whatsapp: "919354967107",

  email: "contact@ymrealty.in",

  address: "Delhi NCR, India",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "Locations", href: "/#locations" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/contact" },
] as const;