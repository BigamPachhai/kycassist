const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("../backend/routes/auth");
const kycRoutes = require("../backend/routes/kyc");
const aiRoutes = require("../backend/routes/ai");
const ocrRoutes = require("../backend/routes/ocr");
const notificationRoutes = require("../backend/routes/notifications");
const adminRoutes = require("../backend/routes/admin");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// ── MongoDB Connection ────────────────────────────────────────────────────────
let mongoConnected = false;

const connectDB = async () => {
  if (mongoConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/kycassist";

    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
};

// ── Middleware to ensure DB connection ────────────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

module.exports = app;
