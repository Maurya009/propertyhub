const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const Property = require("../models/Property");

const residences = [
  {
    title: "3 BHK · Type 1",
    location: "Sector 89A, Gurugram",
    bhk: "3 BHK",
    unitType: "Type 01",
    carpetArea: "1,018 sq.ft.",
    balconyArea: "309 sq.ft.",
    superArea: "1,785 sq.ft.",
    floorPlan: "/story-house/02.webp",
    status: "Available",
    description:
      "Generous proportions, considered circulation and balcony space designed to bring daylight and air into everyday living.",
    image: "/story-house/02.webp",
    images: [],
    amenities: [],
  },
  {
    title: "3 BHK · Type 2",
    location: "Sector 89A, Gurugram",
    bhk: "3 BHK",
    unitType: "Type 02",
    carpetArea: "992 sq.ft.",
    balconyArea: "297 sq.ft.",
    superArea: "1,761 sq.ft.",
    floorPlan: "/story-house/01.webp",
    status: "Available",
    description:
      "Generous proportions, considered circulation and balcony space designed to bring daylight and air into everyday living.",
    image: "/story-house/01.webp",
    images: [],
    amenities: [],
  },
  {
    title: "2 BHK · Type 1",
    location: "Sector 89A, Gurugram",
    bhk: "2 BHK",
    unitType: "Type 01",
    carpetArea: "756 sq.ft.",
    balconyArea: "203 sq.ft.",
    superArea: "1,450 sq.ft.",
    floorPlan: "/story-house/01.webp",
    status: "Available",
    description:
      "Generous proportions, considered circulation and balcony space designed to bring daylight and air into everyday living.",
    image: "/story-house/01.webp",
    images: [],
    amenities: [],
  },
  {
    title: "2 BHK · Type 2",
    location: "Sector 89A, Gurugram",
    bhk: "2 BHK",
    unitType: "Type 02",
    carpetArea: "803 sq.ft.",
    balconyArea: "305 sq.ft.",
    superArea: "1,548 sq.ft.",
    floorPlan: "/story-house/02.webp",
    status: "Available",
    description:
      "Generous proportions, considered circulation and balcony space designed to bring daylight and air into everyday living.",
    image: "/story-house/02.webp",
    images: [],
    amenities: [],
  },
];

async function seedResidences() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing from server/.env"
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    for (const residence of residences) {
      await Property.updateOne(
        { title: residence.title },
        {
          $setOnInsert: residence,
        },
        { upsert: true }
      );
    }

    const total =
      await Property.countDocuments();

    console.log(
      "Residences seeded successfully."
    );
    console.log(
      `Total residences in database: ${total}`
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "Residence seed failed:",
      error
    );

    await mongoose.disconnect();
    process.exit(1);
  }
}

seedResidences();
