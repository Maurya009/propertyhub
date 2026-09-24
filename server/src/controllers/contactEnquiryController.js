/* eslint-disable @typescript-eslint/no-require-imports */

const ContactEnquiry = require("../models/ContactEnquiry");

// Create contact enquiry
const createContactEnquiry = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const enquiry = await ContactEnquiry.create({
      name,
      phone,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    console.error("Contact enquiry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit enquiry",
      error: error.message,
    });
  }
};

// Get all contact enquiries
const getContactEnquiries = async (req, res) => {
  try {
    const enquiries = await ContactEnquiry.find().sort({
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
      message: "Failed to fetch enquiries",
      error: error.message,
    });
  }
};

module.exports = {
  createContactEnquiry,
  getContactEnquiries,
};