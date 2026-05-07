const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Fix for module resolution in Vercel environment
const resolveBackendPath = (modulePath) => {
  return path.join(__dirname, "..", "backend", modulePath);
};

// Load routes dynamically
let authRoutes, kycRoutes, aiRoutes, ocrRoutes, notificationRoutes, adminRoutes;

try {
  authRoutes = require(resolveBackendPath("routes/auth"));
  kycRoutes = require(resolveBackendPath("routes/kyc"));
  aiRoutes = require(resolveBackendPath("routes/ai"));
  ocrRoutes = require(resolveBackendPath("routes/ocr"));
  notificationRoutes = require(resolveBackendPath("routes/notifications"));
  adminRoutes = require(resolveBackendPath("routes/admin"));
} catch (err) {
  console.error("Failed to load routes:", err.message);
  // Routes will be undefined, but app will still work for health check
}

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
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
  });
});

// ── Routes (if loaded successfully) ────────────────────────────────────────────
if (authRoutes) app.use("/api/auth", authRoutes);
if (kycRoutes) app.use("/api/kyc", kycRoutes);
if (aiRoutes) app.use("/api/ai", aiRoutes);
if (ocrRoutes) app.use("/api/ocr", ocrRoutes);
if (notificationRoutes) app.use("/api/notifications", notificationRoutes);
if (adminRoutes) app.use("/api/admin", adminRoutes);

// ── Fallback route for undefined paths ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

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

// ── MongoDB Connection Handler ────────────────────────────────────────────────
let mongoConnected = false;

const connectDB = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    mongoConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    mongoConnected = false;
    throw err;
  }
};

// ── Middleware to ensure DB connection (skip for health check) ────────────────
app.use((req, res, next) => {
  // Skip DB connection for health check
  if (req.path === "/api/health") {
    return next();
  }

  connectDB()
    .then(() => next())
    .catch((err) => {
      console.error("DB connection middleware error:", err.message);
      res.status(503).json({
        success: false,
        message: "Database connection failed",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });
});

// Export for Vercel serverless environment
module.exports = app;
