/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");

const router = express.Router();

const {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
} = require("../controllers/enquiryController");

const protectAdmin = require("../middleware/authMiddleware");

// Public route
router.post("/", createEnquiry);

// Protected admin routes
router.get("/", protectAdmin, getEnquiries);
router.put("/:id/status", protectAdmin, updateEnquiryStatus);

module.exports = router;