const Amenity = require("../models/Amenity");

async function getAmenities(req, res) {
  try {
    const filter = {};

    if (req.query.active !== undefined) {
      filter.active = req.query.active === "true";
    }

    if (req.query.featured !== undefined) {
      filter.featured = req.query.featured === "true";
    }

    const amenities = await Amenity.find(filter).sort({
      order: 1,
      createdAt: 1,
    });

    return res.json({
      success: true,
      count: amenities.length,
      data: amenities,
    });
  } catch (error) {
    console.error("Get amenities failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load amenities.",
    });
  }
}

async function createAmenity(req, res) {
  try {
    const {
      title,
      description = "",
      imageUrl = "",
      publicId = "",
      order = 0,
      featured = false,
      active = true,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Amenity title is required.",
      });
    }

    const amenity = await Amenity.create({
      title: String(title).trim(),
      description: String(description || "").trim(),
      imageUrl: String(imageUrl || "").trim(),
      publicId: String(publicId || "").trim(),
      order: Number(order) || 0,
      featured: Boolean(featured),
      active: Boolean(active),
    });

    return res.status(201).json({
      success: true,
      message: "Amenity created successfully.",
      data: amenity,
    });
  } catch (error) {
    console.error("Create amenity failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create amenity.",
    });
  }
}

async function updateAmenity(req, res) {
  try {
    const amenity = await Amenity.findById(req.params.id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found.",
      });
    }

    const {
      title,
      description,
      imageUrl,
      publicId,
      order,
      featured,
      active,
    } = req.body || {};

    if (
      title !== undefined &&
      !String(title).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Amenity title cannot be empty.",
      });
    }

    if (title !== undefined) {
      amenity.title = String(title).trim();
    }

    if (description !== undefined) {
      amenity.description = String(description).trim();
    }

    if (imageUrl !== undefined) {
      amenity.imageUrl = String(imageUrl).trim();
    }

    if (publicId !== undefined) {
      amenity.publicId = String(publicId).trim();
    }

    if (order !== undefined) {
      amenity.order = Number(order) || 0;
    }

    if (featured !== undefined) {
      amenity.featured = Boolean(featured);
    }

    if (active !== undefined) {
      amenity.active = Boolean(active);
    }

    await amenity.save();

    return res.json({
      success: true,
      message: "Amenity updated successfully.",
      data: amenity,
    });
  } catch (error) {
    console.error("Update amenity failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update amenity.",
    });
  }
}

async function deleteAmenity(req, res) {
  try {
    const amenity = await Amenity.findById(req.params.id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found.",
      });
    }

    await amenity.deleteOne();

    return res.json({
      success: true,
      message: "Amenity deleted successfully.",
    });
  } catch (error) {
    console.error("Delete amenity failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete amenity.",
    });
  }
}

module.exports = {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
};
