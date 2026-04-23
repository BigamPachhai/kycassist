const mongoose = require("mongoose");
const KYC = require("./models/KYC");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await KYC.updateMany(
    { status: { $in: ['submitted', 'under_review'] }, documentFrontImage: { $exists: false } },
    { $set: { documentFrontImage: 'https://res.cloudinary.com/dgm34bn8y/image/upload/v1776924920/kycassist/ocr/yvzam7jl6hxbjth8i5mg.jpg' } }
  );
  console.log("Updated:", result.modifiedCount);
  process.exit();
});
