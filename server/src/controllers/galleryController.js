/* eslint-disable @typescript-eslint/no-require-imports */

const Gallery = require("../models/Gallery");

// GET all gallery images
const getGallery = async (req, res) => {
  try {
    const { category, featured } = req.query;

    const filter = {};

    if (category && category !== "All") {
      filter.category = String(category).trim();
    }

    if (featured !== undefined) {
      filter.featured = String(featured) === "true";
    }

    const gallery = await Gallery.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: gallery.length,
      data: gallery,
    });
  } catch (error) {
    console.error("Get gallery error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery",
    });
  }
};

// CREATE gallery image
const createGalleryItem = async (req, res) => {
  try {
    const {
      title,
      category,
      imageUrl,
      publicId,
      order,
      featured,
    } = req.body;

    const cleanTitle = String(title || "").trim();
    const cleanCategory = String(
      category || ""
    ).trim();
    const cleanImageUrl = String(
      imageUrl || ""
    ).trim();
    const cleanPublicId = String(
      publicId || ""
    ).trim();

    const allowedCategories = [
      "Architecture",
      "Residences",
      "Amenities",
      "Lifestyle",
      "Retail",
      "Landscape",
    ];

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Gallery title is required",
      });
    }

    if (!cleanCategory) {
      return res.status(400).json({
        success: false,
        message: "Gallery category is required",
      });
    }

    if (!allowedCategories.includes(cleanCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery category",
      });
    }

    if (!cleanImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Gallery image URL is required",
      });
    }

    const numericOrder =
      order === undefined ||
      order === null ||
      order === ""
        ? 0
        : Number(order);

    if (
      !Number.isFinite(numericOrder) ||
      numericOrder < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must be a valid number",
      });
    }

    const galleryItem = await Gallery.create({
      title: cleanTitle,
      category: cleanCategory,
      imageUrl: cleanImageUrl,
      publicId: cleanPublicId,
      order: numericOrder,
      featured: Boolean(featured),
    });

    return res.status(201).json({
      success: true,
      message: "Gallery image created successfully",
      data: galleryItem,
    });
  } catch (error) {
    console.error(
      "Create gallery item error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to create gallery image",
    });
  }
};

// UPDATE gallery image
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryItem =
      await Gallery.findById(id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    const allowedCategories = [
      "Architecture",
      "Residences",
      "Amenities",
      "Lifestyle",
      "Retail",
      "Landscape",
    ];

    const fields = [
      "title",
      "category",
      "imageUrl",
      "publicId",
      "order",
      "featured",
    ];

    for (const field of fields) {
      if (req.body[field] === undefined) {
        continue;
      }

      if (
        field === "title" ||
        field === "category" ||
        field === "imageUrl" ||
        field === "publicId"
      ) {
        galleryItem[field] = String(
          req.body[field] || ""
        ).trim();
      } else if (field === "order") {
        const numericOrder = Number(
          req.body[field]
        );

        if (
          !Number.isFinite(numericOrder) ||
          numericOrder < 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Order must be a valid number",
          });
        }

        galleryItem[field] = numericOrder;
      } else if (field === "featured") {
        galleryItem[field] = Boolean(
          req.body[field]
        );
      }
    }

    if (
      galleryItem.category &&
      !allowedCategories.includes(
        galleryItem.category
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery category",
      });
    }

    if (!galleryItem.title) {
      return res.status(400).json({
        success: false,
        message: "Gallery title is required",
      });
    }

    if (!galleryItem.imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Gallery image URL is required",
      });
    }

    await galleryItem.save();

    return res.json({
      success: true,
      message: "Gallery image updated successfully",
      data: galleryItem,
    });
  } catch (error) {
    console.error(
      "Update gallery item error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update gallery image",
    });
  }
};

// DELETE gallery image
const deleteGalleryItem = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const galleryItem =
      await Gallery.findByIdAndDelete(id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    return res.json({
      success: true,
      message: "Gallery image deleted successfully",
      data: {
        id: galleryItem._id,
        publicId: galleryItem.publicId || "",
      },
    });
  } catch (error) {
    console.error(
      "Delete gallery item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
    });
  }
};

module.exports = {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};
