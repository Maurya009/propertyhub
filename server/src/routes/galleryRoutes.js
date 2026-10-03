/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");

const router = express.Router();

const {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require("../controllers/galleryController");

const protectAdmin = require("../middleware/authMiddleware");

// Public: website gallery read kar sakti hai
router.get("/", getGallery);

// Protected: Admin only
router.post("/", protectAdmin, createGalleryItem);
router.put("/:id", protectAdmin, updateGalleryItem);
router.delete("/:id", protectAdmin, deleteGalleryItem);

module.exports = router;
