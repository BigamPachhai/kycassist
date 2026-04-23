const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { v2: cloudinary } = require("cloudinary");
const { protect } = require("../middleware/auth");
const { Mistral } = require("@mistralai/mistralai");

const router = express.Router();
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// ── Cloudinary config (uses backend env vars — never exposed to browser) ──────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer: keep file in memory (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// ── POST /api/ocr/extract ─────────────────────────────────────────────────────
// Accepts: multipart/form-data with `document` file + optional `documentType`
// 1. Preprocess image buffer with Sharp
// 2. Upload processed buffer to Cloudinary
// 3. Call OCR.space with the returned public URL and optimized parameters
// 4. Clean text and use Gemini AI to extract structured JSON data
// 5. Return { extracted, confidence, imageUrl }
router.post(
  "/extract",
  protect,
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image file provided" });
      }

      const documentType = req.body.documentType || "citizenship";

      // ── Step 1: Preprocess with Sharp ─────────────────────────────────────────
      // Keep preprocessing minimal to avoid damaging text quality
      const processedBuffer = await sharp(req.file.buffer)
        .normalize() // gentle contrast improvement
        .resize({ width: 1500, withoutEnlargement: true }) // higher resolution for better OCR
        .toFormat("jpeg", { quality: 95 }) // high quality JPEG
        .toBuffer();

      // ── Step 2: Upload to Cloudinary ──────────────────────────────────────────
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "kycassist/ocr",
            resource_type: "image",
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error) return reject(new Error(error.message));
            resolve(result.secure_url);
          },
        );
        stream.end(processedBuffer);
      });

      // ── Step 3: OCR.space via URL (Optimized params) ──────────────────────────
      const ocrForm = new URLSearchParams();
      ocrForm.append("url", imageUrl);
      ocrForm.append("language", "eng");
      ocrForm.append("isOverlayRequired", "true"); // highly recommended param
      ocrForm.append("detectOrientation", "true");
      ocrForm.append("scale", "true");
      ocrForm.append("OCREngine", "2"); // Better engine

      const ocrRes = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: { apikey: process.env.OCR_SPACE_API_KEY },
        body: ocrForm,
      });

      if (!ocrRes.ok) throw new Error(`OCR.space HTTP error: ${ocrRes.status}`);
      const ocrData = await ocrRes.json();
      if (ocrData.IsErroredOnProcessing) {
        throw new Error(ocrData.ErrorMessage?.[0] || "OCR processing failed");
      }

      const rawText = ocrData.ParsedResults?.[0]?.ParsedText || "";
      const confidence =
        ocrData.ParsedResults?.[0]?.TextOverlay?.MeanConfidence ??
        ocrData.ParsedResults?.[0]?.MeanConfidence ??
        85;

      // ── Step 4: Minimal text cleaning (don't replace 0/1, they might be correct) ────
      const cleanText = rawText.trim();

      const combinedCleanText = cleanText + "\n\n";
      const avgConfidence = Number(confidence);

      // ── Step 5: Mistral AI Data Extraction ──────────────────────────────────
      const extractionPrompt = `You are an expert KYC data extractor specialized in Nepal citizenship certificates, passports, and driving licenses.

Carefully analyze the OCR text below and extract structured information. Use context to correct obvious OCR errors:
- Citizenship documents typically show: full name, citizenship number (format XX-XX-XX-XXXXX), father's name, date of birth, gender, district, municipality
- For dates: prefer DD-MM-YYYY or YYYY-MM-DD format
- For names: use proper title case, correct common OCR mistakes (e.g., "rn" → "m", "1" → "l" in names)
- For gender: normalize to 'male' or 'female' (ignore M/F variations)

Return ONLY a valid JSON object with NO markdown, NO code blocks, NO extra text:
{
  "fullName": "Full name in proper title case",
  "documentNumber": "Citizenship/Passport/License number in appropriate format",
  "dateOfBirth": "Extract as YYYY-MM-DD",
  "documentIssuedDate": "Extract as YYYY-MM-DD if available",
  "fatherName": "Father's name if present, title case",
  "gender": "male or female",
  "permanentDistrict": "District name",
  "permanentMunicipality": "Municipality or VDC name"
}

Only include fields you are confident about. Omit fields if you cannot reliably extract them.

OCR Text:
${combinedCleanText}`;

      const result = await client.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "user",
            content: extractionPrompt,
          },
        ],
      });

      let extracted = {};

      try {
        let responseText = result.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        responseText = responseText
          .replace(/^```json\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        // Also try removing any leading/trailing backticks
        responseText = responseText
          .replace(/^`+/, "")
          .replace(/`+$/, "")
          .trim();

        extracted = JSON.parse(responseText);

        // Normalize extracted data
        if (extracted.gender) {
          extracted.gender =
            extracted.gender.toLowerCase().includes("female") ||
            extracted.gender === "F"
              ? "female"
              : "male";
        }
      } catch (e) {
        console.error(
          "Mistral extraction failed to parse JSON",
          e,
          result.choices[0].message.content,
        );
        // Fallback to empty if AI fails to format properly
        extracted = {};
      }

      res.json({
        success: true,
        extracted,
        confidence: avgConfidence,
        imageUrl,
        rawText: combinedCleanText,
      });
    } catch (err) {
      console.error("OCR extract error:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
