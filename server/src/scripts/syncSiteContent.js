require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const SiteContent = require("../models/SiteContent");

async function run() {
  try {
    await connectDB();

    const content = await SiteContent.findOneAndUpdate(
      { key: "main" },
      {
        key: "main",

        hero: {
          eyebrow:
            "The Story House · Sector 89A, Gurugram",

          title:
            "A home with\nmore room for life.",

          description:
            "Thoughtfully planned 2 & 3 BHK residences with generous spaces, landscaped surroundings and everyday amenities.",

          primaryCtaLabel:
            "Explore Residences",

          secondaryCtaLabel:
            "View Gallery",
        },

        story: {
          eyebrow:
            "The beginning of a beautiful new chapter",

          title:
            "Space that feels\nbeautifully yours.",

          description:
            "It is no longer about excess. It is about space that understands you — light that changes the character of a room, nature that becomes part of your everyday, and privacy that lets you retreat.\n\nThe Story House brings together spacious residences, landscaped surroundings, wellness-led amenities and everyday convenience within a thoughtfully planned community.",
        },

        projectStats: {
          acres: "4.525",
          acresLabel: "Acres",
          towers: "05",
          towersLabel: "Residential Towers",
        },

        contact: {
          eyebrow:
            "Make the next chapter yours",

          title:
            "Let’s plan your visit.",

          description:
            "Explore residences, amenities and floor plans with our team.",

          ctaLabel:
            "Send an enquiry",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Current public website content synced successfully.");
    console.log(`Content ID: ${content._id}`);
  } catch (error) {
    console.error("Site content sync failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
