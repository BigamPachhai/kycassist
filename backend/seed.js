/**
 * Database Seeder
 * Populates MongoDB with sample data for development/testing
 * Usage: node seed.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const KYC = require("./models/KYC");
const Notification = require("./models/Notification");
    
const sampleUsers = [
  {
    fullName: "Admin User",
    email: "admin@example.com",
    password: "Admin@1234",
    phone: "+977-9800000000",
    kycStatus: "verified",
    role: "admin",
    kycSubmittedAt: new Date("2026-04-10"),
    kycVerifiedAt: new Date("2026-04-10"),
    notificationPrefs: { email: true, inApp: true },
  },
  {
    fullName: "Bigam Pachhai",
    email: "bigam@example.com",
    password: "Test@1234",
    phone: "+977-9841234567",
    kycStatus: "verified",
    kycSubmittedAt: new Date("2026-04-10"),
    kycVerifiedAt: new Date("2026-04-15"),
    notificationPrefs: { email: true, inApp: true },
  },
  {
    fullName: "Priya Sharma",
    email: "priya@example.com",
    password: "Test@1234",
    phone: "+977-9842345678",
    kycStatus: "submitted",
    kycSubmittedAt: new Date("2026-04-18"),
    notificationPrefs: { email: true, inApp: true },
  },
  {
    fullName: "Rajesh Kumar",
    email: "rajesh@example.com",
    password: "Test@1234",
    phone: "+977-9843456789",
    kycStatus: "under_review",
    kycSubmittedAt: new Date("2026-04-12"),
    notificationPrefs: { email: true, inApp: false },
  },
  {
    fullName: "Anita Thapa",
    email: "anita@example.com",
    password: "Test@1234",
    phone: "+977-9844567890",
    kycStatus: "action_required",
    kycSubmittedAt: new Date("2026-03-20"),
    kycRejectionReason: "Document image is not clear. Please resubmit.",
    notificationPrefs: { email: true, inApp: true },
  },
  {
    fullName: "Suresh Neupane",
    email: "suresh@example.com",
    password: "Test@1234",
    phone: "+977-9845678901",
    kycStatus: "rejected",
    kycRejectionReason: "Document verification failed. Please contact support.",
    notificationPrefs: { email: false, inApp: true },
  },
  {
    fullName: "Maya Gurung",
    email: "maya@example.com",
    password: "Test@1234",
    phone: "+977-9846789012",
    kycStatus: "in_progress",
    notificationPrefs: { email: true, inApp: true },
  },
  {
    fullName: "Deepak Singh",
    email: "deepak@example.com",
    password: "Test@1234",
    phone: "+977-9847890123",
    kycStatus: "not_started",
    notificationPrefs: { email: true, inApp: true },
  },
  {
    fullName: "eSewa Demo User",
    email: "demo@esewa.com.np",
    password: "demo123",
    phone: "+977-9848901234",
    kycStatus: "verified",
    kycSubmittedAt: new Date("2026-04-05"),
    kycVerifiedAt: new Date("2026-04-10"),
    notificationPrefs: { email: true, inApp: true },
  },
];

const sampleKYCData = [
  {
    fullName: "Bigam Pachhai",
    dateOfBirth: "1998-05-15",
    gender: "male",
    fatherName: "Devi Pachhai",
    grandfatherName: "Hari Pachhai",
    permanentDistrict: "Kathmandu",
    permanentMunicipality: "Kathmandu Metropolitan City",
    permanentWardNo: "5",
    temporaryAddress: "Thamel, Kathmandu",
    documentType: "citizenship",
    documentNumber: "12-34-56-78901",
    documentIssuedDistrict: "Kathmandu",
    documentIssuedDate: "2020-01-15",
    occupation: "Software Engineer",
    sourceOfIncome: "Employment",
    annualIncome: "500000",
    status: "verified",
    completionPercentage: 100,
    submittedAt: new Date("2026-04-10"),
    verifiedAt: new Date("2026-04-15"),
    statusHistory: [
      {
        status: "draft",
        note: "Started",
        changedAt: new Date("2026-04-08"),
        changedBy: "system",
      },
      {
        status: "submitted",
        note: "Submitted for review",
        changedAt: new Date("2026-04-10"),
        changedBy: "system",
      },
      {
        status: "under_review",
        note: "Admin reviewing",
        changedAt: new Date("2026-04-12"),
        changedBy: "admin",
      },
      {
        status: "verified",
        note: "All documents verified",
        changedAt: new Date("2026-04-15"),
        changedBy: "admin",
      },
    ],
  },
  {
    fullName: "Priya Sharma",
    dateOfBirth: "1995-08-22",
    gender: "female",
    fatherName: "Vikram Sharma",
    grandfatherName: "Dev Sharma",
    permanentDistrict: "Lalitpur",
    permanentMunicipality: "Lalitpur Metropolitan City",
    permanentWardNo: "3",
    temporaryAddress: "Patan, Lalitpur",
    documentType: "passport",
    documentNumber: "C1234567",
    documentIssuedDistrict: "Kathmandu",
    documentIssuedDate: "2018-03-20",
    occupation: "Business Analyst",
    sourceOfIncome: "Employment",
    annualIncome: "450000",
    status: "submitted",
    completionPercentage: 90,
    submittedAt: new Date("2026-04-18"),
    statusHistory: [
      {
        status: "draft",
        note: "Started",
        changedAt: new Date("2026-04-16"),
        changedBy: "system",
      },
      {
        status: "submitted",
        note: "Submitted for review",
        changedAt: new Date("2026-04-18"),
        changedBy: "system",
      },
    ],
  },
  {
    fullName: "Rajesh Kumar",
    dateOfBirth: "1992-12-10",
    gender: "male",
    fatherName: "Ram Kumar",
    grandfatherName: "Hari Kumar",
    permanentDistrict: "Bhaktapur",
    permanentMunicipality: "Bhaktapur Municipality",
    permanentWardNo: "7",
    documentType: "citizenship",
    documentNumber: "23-45-67-89012",
    documentIssuedDistrict: "Bhaktapur",
    documentIssuedDate: "2019-06-10",
    occupation: "Entrepreneur",
    sourceOfIncome: "Self Employment",
    annualIncome: "800000",
    status: "under_review",
    completionPercentage: 95,
    submittedAt: new Date("2026-04-12"),
    statusHistory: [
      {
        status: "draft",
        note: "Started",
        changedAt: new Date("2026-04-08"),
        changedBy: "system",
      },
      {
        status: "submitted",
        note: "Submitted for review",
        changedAt: new Date("2026-04-12"),
        changedBy: "system",
      },
      {
        status: "under_review",
        note: "Admin reviewing",
        changedAt: new Date("2026-04-13"),
        changedBy: "admin",
      },
    ],
  },
  {
    fullName: "Anita Thapa",
    dateOfBirth: "1999-03-05",
    gender: "female",
    fatherName: "Passang Thapa",
    grandfatherName: "Tsering Thapa",
    permanentDistrict: "Parbat",
    permanentMunicipality: "Kusma Municipality",
    permanentWardNo: "2",
    documentType: "citizenship",
    documentNumber: "34-56-78-90123",
    documentIssuedDistrict: "Parbat",
    documentIssuedDate: "2021-02-14",
    occupation: "Teacher",
    sourceOfIncome: "Employment",
    annualIncome: "300000",
    status: "action_required",
    completionPercentage: 85,
    submittedAt: new Date("2026-03-20"),
    actionRequired:
      "Document image is not clear. Please resubmit with better quality.",
    statusHistory: [
      {
        status: "draft",
        note: "Started",
        changedAt: new Date("2026-03-18"),
        changedBy: "system",
      },
      {
        status: "submitted",
        note: "Submitted for review",
        changedAt: new Date("2026-03-20"),
        changedBy: "system",
      },
      {
        status: "under_review",
        note: "Admin reviewing",
        changedAt: new Date("2026-03-22"),
        changedBy: "admin",
      },
      {
        status: "action_required",
        note: "Image quality issue",
        changedAt: new Date("2026-03-25"),
        changedBy: "admin",
      },
    ],
  },
  {
    fullName: "Suresh Neupane",
    dateOfBirth: "1988-07-18",
    gender: "male",
    fatherName: "Keshar Neupane",
    grandfatherName: "Bishan Neupane",
    permanentDistrict: "Kaski",
    permanentMunicipality: "Pokhara Metropolis",
    permanentWardNo: "12",
    documentType: "passport",
    documentNumber: "D9876543",
    documentIssuedDistrict: "Kaski",
    documentIssuedDate: "2017-09-05",
    status: "rejected",
    completionPercentage: 70,
    submittedAt: new Date("2026-02-15"),
    rejectionReason:
      "Document verification failed. Multiple discrepancies found.",
    statusHistory: [
      {
        status: "draft",
        note: "Started",
        changedAt: new Date("2026-02-10"),
        changedBy: "system",
      },
      {
        status: "submitted",
        note: "Submitted for review",
        changedAt: new Date("2026-02-15"),
        changedBy: "system",
      },
      {
        status: "under_review",
        note: "Admin reviewing",
        changedAt: new Date("2026-02-18"),
        changedBy: "admin",
      },
      {
        status: "rejected",
        note: "Verification failed",
        changedAt: new Date("2026-02-22"),
        changedBy: "admin",
      },
    ],
  },
  {
    fullName: "eSewa Demo User",
    dateOfBirth: "1996-06-20",
    gender: "male",
    fatherName: "Demo Father",
    grandfatherName: "Demo Grandfather",
    permanentDistrict: "Kathmandu",
    permanentMunicipality: "Kathmandu Metropolitan City",
    permanentWardNo: "1",
    temporaryAddress: "Kathmandu, Nepal",
    documentType: "citizenship",
    documentNumber: "45-67-89-01234",
    documentIssuedDistrict: "Kathmandu",
    documentIssuedDate: "2022-08-25",
    occupation: "Finance Professional",
    sourceOfIncome: "Employment",
    annualIncome: "600000",
    status: "verified",
    completionPercentage: 100,
    submittedAt: new Date("2026-04-05"),
    verifiedAt: new Date("2026-04-10"),
    statusHistory: [
      {
        status: "draft",
        note: "Started",
        changedAt: new Date("2026-04-03"),
        changedBy: "system",
      },
      {
        status: "submitted",
        note: "Submitted for review",
        changedAt: new Date("2026-04-05"),
        changedBy: "system",
      },
      {
        status: "under_review",
        note: "Admin reviewing",
        changedAt: new Date("2026-04-07"),
        changedBy: "admin",
      },
      {
        status: "verified",
        note: "All documents verified",
        changedAt: new Date("2026-04-10"),
        changedBy: "admin",
      },
    ],
  },
];

const sampleNotifications = [
  {
    type: "kyc_submitted",
    title: "KYC Application Submitted",
    message: "Your KYC application has been successfully submitted for review.",
    isRead: true,
  },
  {
    type: "kyc_verified",
    title: "KYC Verification Complete",
    message:
      "Congratulations! Your KYC verification has been completed successfully.",
    isRead: true,
  },
  {
    type: "action_required",
    title: "Action Required on Your KYC",
    message:
      "Please submit clearer document images. The current images are not readable.",
    isRead: false,
  },
  {
    type: "kyc_rejected",
    title: "KYC Application Rejected",
    message:
      "Your KYC application was rejected. Please contact support for assistance.",
    isRead: true,
  },
  {
    type: "reminder",
    title: "Complete Your KYC",
    message:
      "You have not started your KYC process yet. Complete it now to enjoy full access.",
    isRead: false,
  },
  {
    type: "info",
    title: "KYC System Maintenance",
    message:
      "The KYC system will undergo scheduled maintenance on April 25, 2026.",
    isRead: false,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/kycassist",
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🔄 Clearing existing data...");
    await User.deleteMany({});
    await KYC.deleteMany({});
    await Notification.deleteMany({});
    console.log("✅ Cleared existing data");

    // Seed Users
    console.log("👥 Seeding users...");
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed KYC Data
    console.log("📝 Seeding KYC records...");
    const kycRecordsWithUsers = sampleKYCData.map((kyc, index) => ({
      ...kyc,
      user: createdUsers[index]._id,
    }));
    const createdKYCs = await KYC.create(kycRecordsWithUsers);
    console.log(`✅ Created ${createdKYCs.length} KYC records`);

    // Seed Notifications
    console.log("📢 Seeding notifications...");
    const notificationsWithUsers = sampleNotifications.map((notif, index) => ({
      ...notif,
      user: createdUsers[index % createdUsers.length]._id,
    }));
    const createdNotifications = await Notification.create(
      notificationsWithUsers,
    );
    console.log(`✅ Created ${createdNotifications.length} notifications`);

    // Display summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Users: ${createdUsers.length}`);
    console.log(`KYC Records: ${createdKYCs.length}`);
    console.log(`Notifications: ${createdNotifications.length}`);
    console.log("=".repeat(60));

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📋 Sample Login Credentials:");
    console.log("─".repeat(60));
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} | Password: ${user.role === 'admin' ? 'Admin@1234' : 'Test@1234'} | Role: ${user.role}`);
    });
    console.log("─".repeat(60));
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
    process.exit(0);
  }
}

// Run seeder
seedDatabase();
