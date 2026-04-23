const mongoose = require("mongoose");
const KYC = require("./models/KYC");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const kycs = await KYC.find({ status: { $in: ['submitted', 'under_review'] } });
  console.log("Submissions found:", kycs.length);
  kycs.forEach(k => {
    console.log("ID:", k._id, "Name:", k.fullName, "DocFrontImage:", k.documentFrontImage);
  });
  process.exit();
});
