/* eslint-disable @typescript-eslint/no-require-imports */

const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");

// @desc    Create a new enquiry
// @route   POST /api/enquiries
const createEnquiry = async (req, res) => {
  try {
    const { propertyId, name, phone, email, message } = req.body;

    if (!propertyId || !name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "propertyId, name, phone and email are required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const enquiry = await Enquiry.create({
      property: property._id,
      propertyTitle: property.title,
      name,
      phone,
      email,
      message,
      status: "New",
    });

    res.status(201).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id/status
const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["New", "Contacted", "Closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status",
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.json({
      success: true,
      message: "Enquiry status updated successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
};