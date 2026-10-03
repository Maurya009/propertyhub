/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");

const router = express.Router();

const {
  createContactEnquiry,
  getContactEnquiries,
  updateContactEnquiryStatus,
} = require("../controllers/contactEnquiryController");

const protectAdmin = require("../middleware/authMiddleware");

// Public — customer contact form
router.post("/", createContactEnquiry);

// Admin only — view contact enquiries
router.get("/", protectAdmin, getContactEnquiries);

// Admin only — update contact enquiry status
router.put(
  "/:id/status",
  protectAdmin,
  updateContactEnquiryStatus
);

module.exports = router;