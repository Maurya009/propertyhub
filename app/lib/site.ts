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
  brand: { first: "THE", second: "STORY HOUSE" },
  name: "The Story House",
  tagline: "A life worth telling.",
  description:
    "The Story House brings spacious residences, wellness-oriented amenities, landscaped surroundings and everyday conveniences together in one considered community.",
  url: process.env.SITE_URL || "http://localhost:3000",
  phone: "+91 9354967107",
  whatsapp: "919354967107",
  email: "",
  address: "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007",
};

export const navLinks = [
  { label: "The Story", href: "/#story" },
  { label: "Residences", href: "/#residences" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/contact" },
] as const;
