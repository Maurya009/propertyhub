import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties for Sale",
  description:
    "Explore apartments and villas for sale in Noida, Greater Noida and Gurgaon. Filter by location, type and budget.",
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
