/* eslint-disable @typescript-eslint/no-require-imports */

const mongoose = require("mongoose");
const Property = require("../models/Property");

const cleanString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const cleanArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
};

// GET all properties
const getProperties = async (req, res) => {
  try {
    const { location, type, search, bhk, status } = req.query;

    const filter = {};

    if (location && location !== "All") {
      filter.location = {
        $regex: String(location).trim(),
        $options: "i",
      };
    }

    if (type && type !== "All") {
      filter.type = String(type).trim();
    }

    if (bhk && bhk !== "All") {
      filter.bhk = String(bhk).trim();
    }

    if (status && status !== "All") {
      filter.status = String(status).trim();
    }

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
          {
            bhk: {
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

    return res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    return res.status(500).json({
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

    return res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};

// CREATE property / residence
const createProperty = async (req, res) => {
  try {
    const {
      title,
      location,
      bhk,
      unitType,
      carpetArea,
      balconyArea,
      superArea,
      floorPlan,
      status,
      description,
      image,
      images,
      amenities,

      // Legacy compatibility
      price,
      type,
      beds,
      baths,
      area,
    } = req.body;

    const cleanTitle = cleanString(title);
    const cleanLocation =
      cleanString(location) || "Sector 89A, Gurugram";
    const cleanBhk = cleanString(bhk);
    const cleanUnitType = cleanString(unitType);
    const cleanCarpetArea = cleanString(carpetArea);
    const cleanBalconyArea = cleanString(balconyArea);
    const cleanSuperArea = cleanString(superArea);
    const cleanFloorPlan = cleanString(floorPlan);
    const cleanStatus = cleanString(status);
    const cleanDescription = cleanString(description);

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (cleanTitle.length < 3 || cleanTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 200 characters",
      });
    }

    if (!cleanLocation) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    if (!["2 BHK", "3 BHK"].includes(cleanBhk)) {
      return res.status(400).json({
        success: false,
        message: "BHK must be either 2 BHK or 3 BHK",
      });
    }

    if (!["Type 01", "Type 02"].includes(cleanUnitType)) {
      return res.status(400).json({
        success: false,
        message: "Unit type must be Type 01 or Type 02",
      });
    }

    if (!cleanCarpetArea) {
      return res.status(400).json({
        success: false,
        message: "Carpet area is required",
      });
    }

    if (!cleanBalconyArea) {
      return res.status(400).json({
        success: false,
        message: "Balcony area is required",
      });
    }

    if (!cleanSuperArea) {
      return res.status(400).json({
        success: false,
        message: "Super area is required",
      });
    }

    if (!cleanFloorPlan) {
      return res.status(400).json({
        success: false,
        message: "Floor plan image is required",
      });
    }

    if (!cleanStatus) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!cleanDescription) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (
      cleanDescription.length < 10 ||
      cleanDescription.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be between 10 and 5000 characters",
      });
    }

    const cleanImages = cleanArray(images);
    const cleanAmenities = cleanArray(amenities);

    let legacyBeds = 0;

    if (beds !== undefined && beds !== null && beds !== "") {
      legacyBeds = Number(beds);
    } else {
      legacyBeds = cleanBhk === "3 BHK" ? 3 : 2;
    }

    if (!Number.isInteger(legacyBeds) || legacyBeds < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bedroom value",
      });
    }

    let legacyBaths = 0;

    if (baths !== undefined && baths !== null && baths !== "") {
      legacyBaths = Number(baths);
    }

    if (!Number.isInteger(legacyBaths) || legacyBaths < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bathroom value",
      });
    }

    const property = await Property.create({
      title: cleanTitle,
      location: cleanLocation,

      bhk: cleanBhk,
      unitType: cleanUnitType,
      carpetArea: cleanCarpetArea,
      balconyArea: cleanBalconyArea,
      superArea: cleanSuperArea,
      floorPlan: cleanFloorPlan,

      status: cleanStatus,
      description: cleanDescription,

      image: cleanString(image),
      images: cleanImages,
      amenities: cleanAmenities,

      // Legacy compatibility
      price: cleanString(price),
      type: cleanString(type) || "Residence",
      beds: legacyBeds,
      baths: legacyBaths,
      area: cleanString(area) || cleanSuperArea,
    });

    return res.status(201).json({
      success: true,
      message: "Residence created successfully",
      data: property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Failed to create residence",
    });
  }
};

// UPDATE property / residence
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
      // Story House
      "title",
      "location",
      "bhk",
      "unitType",
      "carpetArea",
      "balconyArea",
      "superArea",
      "floorPlan",

      // Common
      "status",
      "description",
      "image",
      "images",
      "amenities",

      // Legacy
      "price",
      "type",
      "beds",
      "baths",
      "area",
    ];

    const updateData = {};

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

    if (updateData.title !== undefined) {
      updateData.title = cleanString(updateData.title);

      if (
        updateData.title.length < 3 ||
        updateData.title.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title must be between 3 and 200 characters",
        });
      }
    }

    if (updateData.location !== undefined) {
      updateData.location = cleanString(updateData.location);

      if (
        updateData.location.length < 2 ||
        updateData.location.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Location must be between 2 and 200 characters",
        });
      }
    }

    if (updateData.bhk !== undefined) {
      updateData.bhk = cleanString(updateData.bhk);

      if (!["2 BHK", "3 BHK"].includes(updateData.bhk)) {
        return res.status(400).json({
          success: false,
          message: "BHK must be either 2 BHK or 3 BHK",
        });
      }
    }

    if (updateData.unitType !== undefined) {
      updateData.unitType = cleanString(updateData.unitType);

      if (
        !["Type 01", "Type 02"].includes(updateData.unitType)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Unit type must be Type 01 or Type 02",
        });
      }
    }

    const stringFields = [
      "carpetArea",
      "balconyArea",
      "superArea",
      "floorPlan",
      "status",
      "description",
      "image",
      "price",
      "type",
      "area",
    ];

    for (const field of stringFields) {
      if (updateData[field] !== undefined) {
        updateData[field] = cleanString(updateData[field]);
      }
    }

    if (updateData.description !== undefined) {
      if (
        updateData.description.length < 10 ||
        updateData.description.length > 5000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Description must be between 10 and 5000 characters",
        });
      }
    }

    if (updateData.beds !== undefined) {
      updateData.beds = Number(updateData.beds);

      if (
        !Number.isInteger(updateData.beds) ||
        updateData.beds < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid bedroom value",
        });
      }
    }

    if (updateData.baths !== undefined) {
      updateData.baths = Number(updateData.baths);

      if (
        !Number.isInteger(updateData.baths) ||
        updateData.baths < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid bathroom value",
        });
      }
    }

    if (updateData.images !== undefined) {
      if (!Array.isArray(updateData.images)) {
        return res.status(400).json({
          success: false,
          message: "Images must be an array",
        });
      }

      updateData.images = cleanArray(updateData.images);
    }

    if (updateData.amenities !== undefined) {
      if (!Array.isArray(updateData.amenities)) {
        return res.status(400).json({
          success: false,
          message: "Amenities must be an array",
        });
      }

      updateData.amenities = cleanArray(updateData.amenities);
    }

    if (
      updateData.area === "" &&
      updateData.superArea
    ) {
      updateData.area = updateData.superArea;
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

    return res.json({
      success: true,
      message: "Residence updated successfully",
      data: property,
    });
  } catch (error) {
    console.error("Update property error:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Failed to update residence",
    });
  }
};

// DELETE property / residence
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

    return res.json({
      success: true,
      message: "Residence deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete residence",
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