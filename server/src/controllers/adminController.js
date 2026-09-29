/* eslint-disable @typescript-eslint/no-require-imports */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    // Name validation
    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Password validation
    if (cleanPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: cleanEmail,
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 12);

    const admin = await Admin.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin registration failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Password length check
    if (cleanPassword.length < 8) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const admin = await Admin.findOne({
      email: cleanEmail,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      cleanPassword,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // JWT secret must exist
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Store JWT in a secure HttpOnly cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
const logoutAdmin = (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    path: "/",
  });

  return res.json({
    success: true,
    message: "Logout successful",
  });
};
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const cleanCurrentPassword = String(currentPassword);
    const cleanNewPassword = String(newPassword);

    // New password validation
    if (cleanNewPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    // Logged-in admin ID comes from auth middleware
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    // Verify current password
    const isCurrentPasswordCorrect = await bcrypt.compare(
      cleanCurrentPassword,
      admin.password
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent using the same password
    const isSamePassword = await bcrypt.compare(
      cleanNewPassword,
      admin.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(cleanNewPassword, 12);

    admin.password = hashedPassword;
    await admin.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Admin password change failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
const changeAdminEmail = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Current password and new email are required",
      });
    }

    const cleanCurrentPassword = String(currentPassword);
    const cleanNewEmail = String(newEmail).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanNewEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      cleanCurrentPassword,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (cleanNewEmail === admin.email) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from current email",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: cleanNewEmail,
      _id: { $ne: admin._id },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use",
      });
    }

    admin.email = cleanNewEmail;
    await admin.save();

    return res.json({
      success: true,
      message: "Admin email changed successfully",
      data: {
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin email change failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change admin email",
    });
  }
};
const getCurrentAdmin = async (req, res) => {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const admin = await Admin.findById(req.admin.id).select(
      "_id name email role"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    return res.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(
      "Get current admin failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load admin profile",
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  changeAdminPassword,
  changeAdminEmail,
  getCurrentAdmin,
};