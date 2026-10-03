const express = require("express");

const router = express.Router();

const {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} = require("../controllers/amenityController");

const protectAdmin = require("../middleware/authMiddleware");

router.get("/", getAmenities);
router.post("/", protectAdmin, createAmenity);
router.put("/:id", protectAdmin, updateAmenity);
router.delete("/:id", protectAdmin, deleteAmenity);

module.exports = router;
