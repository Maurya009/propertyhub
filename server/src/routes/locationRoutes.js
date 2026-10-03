const express = require("express");

const {
  getLocation,
  updateLocation,
} = require("../controllers/locationController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getLocation);
router.put("/", protectAdmin, updateLocation);

module.exports = router;
