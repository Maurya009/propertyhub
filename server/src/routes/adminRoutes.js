/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../controllers/adminController");

const protectAdmin = require("../middleware/authMiddleware");

// Strict rate limit for admin login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// Only an already-logged-in admin can create a new admin account
router.post("/register", protectAdmin, registerAdmin);

// Admin login with brute-force protection
router.post("/login", loginLimiter, loginAdmin);

// Admin logout
router.post("/logout", logoutAdmin);

module.exports = router;