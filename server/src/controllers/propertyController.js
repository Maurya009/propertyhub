/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require("mongoose");
const Property = require("../models/Property");

// GET all properties with search and filters
const getProperties = async (req, res) => {
  try {
    const { location, type, search } = req.query;

    const filter = {};

    // Location filter
    if (location && location !== "All") {
      filter.location = {
        $regex: String(location),
        $options: "i",
      };
    }

    // Property type filter
    if (type && type !== "All") {
      filter.type = String(type);
    }

    // Search by title or location
    if (search) {
      const safeSearch = String(search).trim();

      if (safeSearch) {
        filter.$or = [
          {
            title: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            location: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ];
      }
    }

    const properties = await Property.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

// GET single property
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};

// CREATE property
const createProperty = async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      type,
      beds,
      baths,
      area,
      status,
      description,
      image,
      images,
      amenities,
    } = req.body;

    // Required fields
    if (
      !title ||
      !location ||
      price === undefined ||
      !type ||
      beds === undefined ||
      baths === undefined ||
      !area ||
      !status ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "Required property fields are missing",
      });
    }

    // Clean text values
    const cleanTitle = String(title).trim();
    const cleanLocation = String(location).trim();
    const cleanType = String(type).trim();
    const cleanArea = String(area).trim();
    const cleanStatus = String(status).trim();
    const cleanDescription = String(description).trim();

    // Text validation
    if (cleanTitle.length < 3 || cleanTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Property title must be between 3 and 200 characters",
      });
    }

    if (cleanLocation.length < 2 || cleanLocation.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Location must be between 2 and 200 characters",
      });
    }

    if (cleanDescription.length < 10 || cleanDescription.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Description must be between 10 and 5000 characters",
      });
    }

    // Numeric validation
    const numericPrice = Number(price);
    const numericBeds = Number(beds);
    const numericBaths = Number(baths);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    if (
      !Number.isInteger(numericBeds) ||
      numericBeds < 0 ||
      numericBeds > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Beds must be a valid number",
      });
    }

    if (
      !Number.isInteger(numericBaths) ||
      numericBaths < 0 ||
      numericBaths > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Baths must be a valid number",
      });
    }

    // Array validation
    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }

    if (amenities !== undefined && !Array.isArray(amenities)) {
      return res.status(400).json({
        success: false,
        message: "Amenities must be an array",
      });
    }

    const property = await Property.create({
      title: cleanTitle,
      location: cleanLocation,
      price: numericPrice,
      type: cleanType,
      beds: numericBeds,
      baths: numericBaths,
      area: cleanArea,
      status: cleanStatus,
      description: cleanDescription,
      image,
      images: Array.isArray(images) ? images : [],
      amenities: Array.isArray(amenities) ? amenities : [],
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to create property",
    });
  }
};

// UPDATE property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const allowedFields = [
      "title",
      "location",
      "price",
      "type",
      "beds",
      "baths",
      "area",
      "status",
      "description",
      "image",
      "images",
      "amenities",
    ];

    const updateData = {};

    // Only allow known property fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid property fields provided",
      });
    }

    // Title validation
    if (updateData.title !== undefined) {
      updateData.title = String(updateData.title).trim();

      if (
        updateData.title.length < 3 ||
        updateData.title.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message: "Property title must be between 3 and 200 characters",
        });
      }
    }

    // Location validation
    if (updateData.location !== undefined) {
      updateData.location = String(updateData.location).trim();

      if (
        updateData.location.length < 2 ||
        updateData.location.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message: "Location must be between 2 and 200 characters",
        });
      }
    }

    // Description validation
    if (updateData.description !== undefined) {
      updateData.description = String(updateData.description).trim();

      if (
        updateData.description.length < 10 ||
        updateData.description.length > 5000
      ) {
        return res.status(400).json({
          success: false,
          message: "Description must be between 10 and 5000 characters",
        });
      }
    }

    // Price validation
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);

      if (
        !Number.isFinite(updateData.price) ||
        updateData.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid positive number",
        });
      }
    }

    // Beds validation
    if (updateData.beds !== undefined) {
      updateData.beds = Number(updateData.beds);

      if (
        !Number.isInteger(updateData.beds) ||
        updateData.beds < 0 ||
        updateData.beds > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Beds must be a valid number",
        });
      }
    }

    // Baths validation
    if (updateData.baths !== undefined) {
      updateData.baths = Number(updateData.baths);

      if (
        !Number.isInteger(updateData.baths) ||
        updateData.baths < 0 ||
        updateData.baths > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Baths must be a valid number",
        });
      }
    }

    // Images validation
    if (updateData.images !== undefined) {
      if (!Array.isArray(updateData.images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be an array",
        });
      }
    }

    // Amenities validation
    if (updateData.amenities !== undefined) {
      if (!Array.isArray(updateData.amenities)) {
        return res.status(400).json({
          success: false,
          message: "Amenities must be an array",
        });
      }
    }

    const property = await Property.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    console.error("Update property error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to update property",
    });
  }
};

// DELETE property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};