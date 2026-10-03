const Location = require("../models/Location");

const LOCATION_KEY = "story-house";

const defaultLocation = {
  key: LOCATION_KEY,

  project: {
    label: "The Story House · Sector 89A, Gurugram",
    address: "",
    mapQuery: "",
  },

  heading: "Connected to what matters.",

  description:
    "Well connected to key business districts, transport links, everyday essentials and important destinations.",

  office: {
    address:
      "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007",
    mapQuery:
      "GF 10 & 11, Ozone Centre, Sector-12, Faridabad - 121007",
  },

  connectivity: [],

  active: true,
};

async function getLocation(req, res) {
  try {
    const location =
      await Location.findOne({
        key: LOCATION_KEY,
      }).lean();

    return res.json({
      success: true,
      data: location || defaultLocation,
    });
  } catch (error) {
    console.error("Get location error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load location content.",
    });
  }
}

async function updateLocation(req, res) {
  try {
    const body = req.body || {};

    const connectivity = Array.isArray(body.connectivity)
      ? body.connectivity.map((item, index) => ({
          time: String(item?.time || "").trim(),
          place: String(item?.place || "").trim(),
          order: Number.isFinite(Number(item?.order))
            ? Number(item.order)
            : index + 1,
          active: item?.active !== false,
        }))
      : [];

    const update = {
      key: LOCATION_KEY,

      project: {
        label: String(
          body.project?.label ||
            defaultLocation.project.label
        ).trim(),

        address: String(
          body.project?.address || ""
        ).trim(),

        mapQuery: String(
          body.project?.mapQuery || ""
        ).trim(),
      },

      heading: String(
        body.heading ||
          defaultLocation.heading
      ).trim(),

      description: String(
        body.description ||
          defaultLocation.description
      ).trim(),

      office: {
        address: String(
          body.office?.address ||
            defaultLocation.office.address
        ).trim(),

        mapQuery: String(
          body.office?.mapQuery ||
            defaultLocation.office.mapQuery
        ).trim(),
      },

      connectivity,

      active: body.active !== false,
    };

    const location =
      await Location.findOneAndUpdate(
        { key: LOCATION_KEY },
        { $set: update },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return res.json({
      success: true,
      message: "Location content updated successfully.",
      data: location,
    });
  } catch (error) {
    console.error("Update location error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update location content.",
    });
  }
}

module.exports = {
  getLocation,
  updateLocation,
};
