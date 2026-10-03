/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    // =========================
    // STORY HOUSE RESIDENCE
    // =========================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      default: "Sector 89A, Gurugram",
    },

    bhk: {
      type: String,
      trim: true,
      enum: ["2 BHK", "3 BHK"],
    },

    unitType: {
      type: String,
      trim: true,
      enum: ["Type 01", "Type 02"],
    },

    carpetArea: {
      type: String,
      trim: true,
    },

    balconyArea: {
      type: String,
      trim: true,
    },

    superArea: {
      type: String,
      trim: true,
    },

    floorPlan: {
      type: String,
      trim: true,
    },

    // =========================
    // LEGACY / COMPATIBILITY
    // =========================

    price: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      default: "Apartment",
      trim: true,
    },

    beds: {
      type: Number,
      default: 0,
    },

    baths: {
      type: Number,
      default: 0,
    },

    area: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // COMMON
    // =========================

    status: {
      type: String,
      required: true,
      trim: true,
      default: "Available",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Property",
  propertySchema
);