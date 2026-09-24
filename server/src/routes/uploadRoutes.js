/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const protectAdmin = require("../middleware/authMiddleware");
const { uploadImage } = require("../controllers/uploadController");

router.post(
  "/image",
  protectAdmin,
  upload.single("image"),
  uploadImage
);

module.exports = router;