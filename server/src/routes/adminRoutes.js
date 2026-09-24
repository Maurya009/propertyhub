/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");

const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
} = require("../controllers/adminController");

const protectAdmin = require("../middleware/authMiddleware");

// Only an already-logged-in admin can create a new admin account
router.post("/register", protectAdmin, registerAdmin);

router.post("/login", loginAdmin);

module.exports = router;