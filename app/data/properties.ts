export type Property = {
    id: number;
    title: string;
    location: string;
    price: string;
    type: string;
    beds: number;
    baths: number;
    area: string;
    status: string;
    description: string;
    image: string;
    images: string[];
    amenities: string[];
  };
  
  export const properties: Property[] = [
    {
      id: 1,
      title: "Luxury 3 BHK Apartment",
      location: "Sector 62, Noida",
      price: "₹85 Lakh",
      type: "Apartment",
      beds: 3,
      baths: 2,
      area: "1,450 sq.ft",
      status: "Ready to Move",
      description:
        "A beautifully designed 3 BHK apartment located in one of Noida's well-connected residential areas. The property offers spacious rooms, modern interiors and excellent natural light.",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80",
      ],
      amenities: [
        "Covered Parking",
        "24/7 Security",
        "Power Backup",
        "Lift",
        "Swimming Pool",
        "Gym",
        "Garden",
        "Club House",
      ],
    },
  
    {
      id: 2,
      title: "Modern Family Villa",
      location: "Greater Noida",
      price: "₹1.25 Crore",
      type: "Villa",
      beds: 4,
      baths: 3,
      area: "2,400 sq.ft",
      status: "Ready to Move",
      description:
        "A spacious modern family villa designed for comfortable living with premium interiors, large bedrooms and a private outdoor space.",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
      ],
      amenities: [
        "Private Parking",
        "Security",
        "Garden",
        "Power Backup",
        "Modular Kitchen",
        "Club House",
      ],
    },
  
    {
      id: 3,
      title: "Premium 2 BHK Home",
      location: "Sector 137, Noida",
      price: "₹62 Lakh",
      type: "Apartment",
      beds: 2,
      baths: 2,
      area: "1,150 sq.ft",
      status: "Ready to Move",
      description:
        "A premium 2 BHK apartment with modern interiors, practical room layouts and easy access to major business and residential areas.",
      image:
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
      images: [
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      ],
      amenities: [
        "Covered Parking",
        "Lift",
        "Security",
        "Power Backup",
        "Gym",
        "Garden",
      ],
    },
  
    {
      id: 4,
      title: "Contemporary 4 BHK Villa",
      location: "Sector 150, Noida",
      price: "₹1.65 Crore",
      type: "Villa",
      beds: 4,
      baths: 4,
      area: "2,850 sq.ft",
      status: "Under Construction",
      description:
        "A contemporary 4 BHK villa offering generous living spaces, premium finishes and a modern architectural design.",
      image:
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",
      images: [
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      ],
      amenities: [
        "Private Garden",
        "Covered Parking",
        "Security",
        "Power Backup",
        "Gym",
        "Club House",
      ],
    },
  
    {
      id: 5,
      title: "Elegant 3 BHK Residence",
      location: "Sector 78, Noida",
      price: "₹95 Lakh",
      type: "Apartment",
      beds: 3,
      baths: 2,
      area: "1,650 sq.ft",
      status: "Ready to Move",
      description:
        "An elegant 3 BHK residence with spacious interiors, natural lighting and excellent connectivity to schools, offices and shopping destinations.",
      image:
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80",
      images: [
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80",
      ],
      amenities: [
        "Parking",
        "Lift",
        "24/7 Security",
        "Swimming Pool",
        "Gym",
        "Garden",
      ],
    },
  
    {
      id: 6,
      title: "Premium Garden Villa",
      location: "Gurgaon",
      price: "₹2.10 Crore",
      type: "Villa",
      beds: 4,
      baths: 4,
      area: "3,100 sq.ft",
      status: "Ready to Move",
      description:
        "A premium garden villa in Gurgaon featuring large living areas, elegant interiors and a private outdoor space suitable for family living.",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      ],
      amenities: [
        "Private Garden",
        "Private Parking",
        "Security",
        "Power Backup",
        "Gym",
        "Club House",
        "Swimming Pool",
      ],
    },
  ];