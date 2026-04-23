const mongoose = require("mongoose");
const KYC = require("./models/KYC");
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const kycs = await KYC.find();
  console.log("Found:", kycs.length);
  console.log(kycs.map(k => k.documentFrontImage));
  process.exit();
});
