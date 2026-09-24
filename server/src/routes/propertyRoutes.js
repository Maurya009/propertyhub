/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");

const router = express.Router();

const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const protectAdmin = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Protected admin routes
router.post("/", protectAdmin, createProperty);
router.put("/:id", protectAdmin, updateProperty);
router.delete("/:id", protectAdmin, deleteProperty);

module.exports = router;