/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const connectDB = require("./config/db");

const propertyRoutes = require("./routes/propertyRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactEnquiryRoutes = require("./routes/contactEnquiryRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ------------------------------------
// Security Middleware
// ------------------------------------

// Secure HTTP headers
app.use(helmet());

// Limit repeated requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// ------------------------------------
// General Middleware
// ------------------------------------

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.31.50:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ------------------------------------
// Test Route
// ------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Real Estate API is running",
  });
});

// ------------------------------------
// API Routes
// ------------------------------------

app.use("/api/properties", propertyRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact-enquiries", contactEnquiryRoutes);
// ------------------------------------
// 404 Handler
// ------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ------------------------------------
// Global Error Handler
// ------------------------------------

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ------------------------------------
// Connect to DB and Start Server
// ------------------------------------

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});