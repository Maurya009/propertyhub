/* eslint-disable @typescript-eslint/no-require-imports */

const ContactEnquiry = require("../models/ContactEnquiry");

// Create contact enquiry
const createContactEnquiry = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    // Required fields validation
    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Clean input
    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanMessage = String(message).trim();

    // Name validation
    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
    }

    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Message validation
    if (cleanMessage.length < 5 || cleanMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 5 and 2000 characters",
      });
    }

    const enquiry = await ContactEnquiry.create({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      message: cleanMessage,
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
    console.error("Get contact enquiries error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
    });
  }
};

module.exports = {
  createContactEnquiry,
  getContactEnquiries,
};