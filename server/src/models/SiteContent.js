const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "main",
    },

    hero: {
      eyebrow: {
        type: String,
        trim: true,
        default: "The Story House",
      },
      title: {
        type: String,
        trim: true,
        default: "A Life Worth Telling",
      },
      description: {
        type: String,
        trim: true,
        default:
          "The Story House brings spacious residences, wellness-oriented amenities, landscaped surroundings and everyday conveniences together in one considered community.",
      },
      primaryCtaLabel: {
        type: String,
        trim: true,
        default: "Schedule a Visit",
      },
      secondaryCtaLabel: {
        type: String,
        trim: true,
        default: "Explore Residences",
      },
    },

    story: {
      eyebrow: {
        type: String,
        trim: true,
        default: "The Story",
      },
      title: {
        type: String,
        trim: true,
        default: "A Life Worth Telling",
      },
      description: {
        type: String,
        trim: true,
        default:
          "The Story House is designed around comfort, confidence and lasting value.",
      },
    },

    projectStats: {
      acres: {
        type: String,
        trim: true,
        default: "4.525",
      },
      acresLabel: {
        type: String,
        trim: true,
        default: "Acres",
      },
      towers: {
        type: String,
        trim: true,
        default: "5",
      },
      towersLabel: {
        type: String,
        trim: true,
        default: "Residential Towers",
      },
    },

    contact: {
      eyebrow: {
        type: String,
        trim: true,
        default: "Get in touch",
      },
      title: {
        type: String,
        trim: true,
        default: "Plan your visit to The Story House.",
      },
      description: {
        type: String,
        trim: true,
        default:
          "Share your details and the project team can help you explore the residences, amenities, connectivity and next steps.",
      },
      ctaLabel: {
        type: String,
        trim: true,
        default: "Send an enquiry",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SiteContent",
  siteContentSchema
);
