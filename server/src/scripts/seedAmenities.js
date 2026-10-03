const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const Amenity = require("../models/Amenity");

const amenities = [
  {
    title: "Fitness Centre",
    imageUrl: "/story-house/09.webp",
    order: 1,
    featured: true,
    active: true,
  },
  {
    title: "Indoor Swimming Pool",
    imageUrl: "/story-house/19.webp",
    order: 2,
    featured: true,
    active: true,
  },
  {
    title: "Kids' Play Park",
    imageUrl: "/story-house/05.webp",
    order: 3,
    featured: true,
    active: true,
  },
  {
    title: "Mini Theatre",
    imageUrl: "/story-house/31.webp",
    order: 4,
    featured: true,
    active: true,
  },
  {
    title: "Yoga & Wellness",
    order: 5,
    featured: false,
    active: true,
  },
  {
    title: "Walking Track",
    order: 6,
    featured: false,
    active: true,
  },
  {
    title: "Green Area",
    order: 7,
    featured: false,
    active: true,
  },
  {
    title: "Housekeeping",
    order: 8,
    featured: false,
    active: true,
  },
  {
    title: "Medical Clinic",
    order: 9,
    featured: false,
    active: true,
  },
  {
    title: "24×7 Emergency Services",
    order: 10,
    featured: false,
    active: true,
  },
  {
    title: "Shopping Complex",
    order: 11,
    featured: false,
    active: true,
  },
];

async function seedAmenities() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    for (const amenity of amenities) {
      await Amenity.updateOne(
        { title: amenity.title },
        {
          $setOnInsert: amenity,
        },
        { upsert: true }
      );
    }

    const total = await Amenity.countDocuments();

    console.log("Amenities seeded successfully.");
    console.log(`Total amenities in database: ${total}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Amenity seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAmenities();
