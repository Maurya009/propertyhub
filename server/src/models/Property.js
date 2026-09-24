/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String, // e.g. "₹85 Lakh", "₹1.25 Crore"
      required: true,
    },
    type: {
      type: String, // e.g. "Apartment", "Villa"
      required: true,
    },
    beds: {
      type: Number,
      required: true,
    },
    baths: {
      type: Number,
      required: true,
    },
    area: {
      type: String, // e.g. "1,450 sq.ft"
      required: true,
    },
    status: {
      type: String, // e.g. "Ready to Move"
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, // main thumbnail image URL
      required: true,
    },
    images: {
      type: [String], // gallery image URLs
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("Property", propertySchema);