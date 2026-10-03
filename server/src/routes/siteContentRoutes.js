const express = require("express");

const router = express.Router();

const {
  getSiteContent,
  updateSiteContent,
} = require("../controllers/siteContentController");

const protectAdmin = require("../middleware/authMiddleware");

router.get("/", getSiteContent);
router.put("/", protectAdmin, updateSiteContent);

module.exports = router;
