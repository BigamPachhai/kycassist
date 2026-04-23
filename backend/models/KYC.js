const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // user reference always required
    },

    // Personal Info
    fullName: { type: String, trim: true },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other', ''] },
    fatherName: { type: String, trim: true },
    grandfatherName: { type: String, trim: true },
    spouseName: { type: String, trim: true },

    // Address
    permanentDistrict: { type: String },
    permanentMunicipality: { type: String },
    permanentWardNo: { type: String },
    temporaryAddress: { type: String },

    // Identity Document
    documentType: {
      type: String,
      enum: ['citizenship', 'passport', 'driving_license', 'voter_id', ''],
    },
    documentNumber: { type: String, trim: true },
    documentIssuedDistrict: { type: String },
    documentIssuedDate: { type: String },

    // Occupation
    occupation: { type: String },
    sourceOfIncome: { type: String },
    annualIncome: { type: String },

    // Document images (base64 or URL)
    documentFrontImage: { type: String },
    documentBackImage: { type: String },
    selfieImage: { type: String },

    // OCR extracted data (for audit)
    ocrExtractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Form error log (for analytics)
    errorLog: [
      {
        field: String,
        errorType: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Status tracking
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'verified', 'rejected', 'action_required'],
      default: 'draft',
    },
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: String, // 'system' | 'admin'
      },
    ],

    rejectionReason: { type: String },
    actionRequired: { type: String },
    reviewerNotes: { type: String },

    // Progress tracking
    completionPercentage: { type: Number, default: 0 },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-update completionPercentage
kycSchema.methods.calculateCompletion = function () {
  const requiredFields = [
    'fullName', 'dateOfBirth', 'gender',
    'permanentDistrict', 'permanentMunicipality',
    'documentType', 'documentNumber',
  ];
  const optionalFields = [
    'fatherName', 'occupation', 'sourceOfIncome',
    'documentFrontImage', 'selfieImage',
  ];
  const requiredFilled = requiredFields.filter(f => this[f]).length;
  const optionalFilled = optionalFields.filter(f => this[f]).length;
  return Math.round(
    (requiredFilled / requiredFields.length) * 70 +
    (optionalFilled / optionalFields.length) * 30
  );
};

module.exports = mongoose.model('KYC', kycSchema);
