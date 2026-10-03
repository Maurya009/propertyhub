const mongoose = require("mongoose");

const connectivitySchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    place: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    order: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

const locationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "story-house",
      trim: true,
    },

    project: {
      label: {
        type: String,
        default: "The Story House · Sector 89A, Gurugram",
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },

      mapQuery: {
        type: String,
        default: "",
        trim: true,
      },
    },

    heading: {
      type: String,
      default: "Connected to what matters.",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    office: {
      address: {
        type: String,
        default:
          "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007",
        trim: true,
      },

      mapQuery: {
        type: String,
        default:
          "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007",
        trim: true,
      },
    },

    connectivity: {
      type: [connectivitySchema],
      default: [],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Location", locationSchema);
