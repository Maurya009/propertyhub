require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Gallery = require("../models/Gallery");

const galleryItems = [
  { image: "/story-house/01.webp", title: "3 BHK Floor Plan", category: "Residences", featured: false },
  { image: "/story-house/02.webp", title: "2 & 3 BHK Plans", category: "Residences", featured: false },
  { image: "/story-house/03.webp", title: "Private Balcony Living", category: "Lifestyle", featured: true },

  { image: "/story-house/04.webp", title: "Kids' Play Park", category: "Amenities", featured: false },
  { image: "/story-house/05.webp", title: "Play & Explore", category: "Amenities", featured: true },
  { image: "/story-house/06.webp", title: "Outdoor Play Space", category: "Amenities", featured: false },
  { image: "/story-house/07.webp", title: "Family Recreation", category: "Amenities", featured: false },

  { image: "/story-house/08.webp", title: "Fitness Centre", category: "Amenities", featured: false },
  { image: "/story-house/09.webp", title: "Training Zone", category: "Amenities", featured: false },
  { image: "/story-house/10.webp", title: "Wellness & Fitness", category: "Amenities", featured: false },

  { image: "/story-house/11.webp", title: "Residents' Lounge", category: "Lifestyle", featured: false },
  { image: "/story-house/12.webp", title: "Community Lounge", category: "Lifestyle", featured: false },
  { image: "/story-house/13.webp", title: "Social Spaces", category: "Lifestyle", featured: false },

  { image: "/story-house/14.webp", title: "Retail Promenade", category: "Retail", featured: false },

  { image: "/story-house/15.webp", title: "Main Arrival", category: "Architecture", featured: true },
  { image: "/story-house/16.webp", title: "Grand Entrance", category: "Architecture", featured: false },
  { image: "/story-house/17.webp", title: "Arrival Court", category: "Architecture", featured: false },
  { image: "/story-house/18.webp", title: "The Story House Entrance", category: "Architecture", featured: false },

  { image: "/story-house/19.webp", title: "Indoor Swimming Pool", category: "Amenities", featured: true },
  { image: "/story-house/20.webp", title: "Pool & Wellness", category: "Amenities", featured: false },
  { image: "/story-house/21.webp", title: "Pool Lounge", category: "Amenities", featured: false },

  { image: "/story-house/22.webp", title: "Retail Street", category: "Retail", featured: false },
  { image: "/story-house/23.webp", title: "Retail Promenade", category: "Retail", featured: false },
  { image: "/story-house/24.webp", title: "NMT & Retail Zone", category: "Retail", featured: false },

  { image: "/story-house/25.webp", title: "Landscaped Drive", category: "Landscape", featured: false },
  { image: "/story-house/26.webp", title: "Accessible Pathways", category: "Landscape", featured: false },

  { image: "/story-house/27.webp", title: "Garden Retail Court", category: "Retail", featured: false },
  { image: "/story-house/28.webp", title: "Outdoor Retail Zone", category: "Retail", featured: false },
  { image: "/story-house/29.webp", title: "Promenade View", category: "Retail", featured: false },

  { image: "/story-house/30.webp", title: "An Elevated Lifestyle", category: "Lifestyle", featured: false },
  { image: "/story-house/31.webp", title: "Mini Theatre", category: "Amenities", featured: false },
  { image: "/story-house/32.webp", title: "Social Lounge", category: "Lifestyle", featured: true },
  { image: "/story-house/33.webp", title: "Walk & Connect", category: "Lifestyle", featured: false },
  { image: "/story-house/34.webp", title: "Residential Architecture", category: "Architecture", featured: true },
  { image: "/story-house/35.webp", title: "Indoor Games", category: "Amenities", featured: false },
];

async function seedGallery() {
  try {
    await connectDB();

    const existingCount = await Gallery.countDocuments();

    if (existingCount > 0) {
      console.log(
        `Gallery already contains ${existingCount} item(s).`
      );
      console.log("No seed performed.");
      process.exit(0);
    }

    const documents = galleryItems.map((item, index) => ({
      title: item.title,
      category: item.category,
      imageUrl: item.image,
      publicId: "",
      order: index + 1,
      featured: item.featured,
    }));

    const inserted = await Gallery.insertMany(documents);

    console.log(
      `✅ Successfully seeded ${inserted.length} gallery items.`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Gallery seed failed:", error);
    process.exit(1);
  }
}

seedGallery();
