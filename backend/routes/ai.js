const express = require("express");
const { protect } = require("../middleware/auth");
const KYC = require("../models/KYC");
const User = require("../models/User");
const { Mistral } = require("@mistralai/mistralai");

const router = express.Router();
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
// AI-powered KYC assistant using Mistral Large - SYSTEM SPECIFIC ONLY
router.post("/chat", protect, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Fetch user's current KYC context
    const kyc = await KYC.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const user = req.user;

    const kycContext = kyc
      ? `
Current KYC Status: ${kyc.status}
Completion: ${kyc.completionPercentage}%
Document Type: ${kyc.documentType || "Not selected"}
Submitted At: ${kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : "Not yet submitted"}
Rejection Reason: ${kyc.rejectionReason || "N/A"}
Action Required: ${kyc.actionRequired || "None"}
Status History: ${kyc.statusHistory.map((h) => `${h.status} (${new Date(h.changedAt).toLocaleDateString()})`).join(" → ")}
      `.trim()
      : "No KYC record found — user has not started KYC yet.";

    const systemPrompt = `YOU ARE BUDDHI AI - KYCASSIST FORM ASSISTANT

YOUR USER'S DATA:
- Name: ${user.fullName}
- Email: ${user.email}
- Current KYC Status: **${user.kycStatus}**

INSTRUCTIONS: Answer ONLY these types of questions:

1️⃣ STATUS QUESTIONS - Use user data above
   User asks: "What is my status?" / "What's my KYC?" / "Am I verified?"
   You answer: "Your KYC status is ${user.kycStatus}." + brief explanation
   
2️⃣ DOCUMENT QUESTIONS - Answer about THIS form only
   User asks: "Which documents?" / "What can I upload?" / "Document types?"
   You answer: "In this form you can upload: Citizenship certificate, Passport, Driving license, or Voter ID."
   
3️⃣ FORMAT QUESTIONS - Answer about THIS form only
   User asks: "Citizenship format?" / "How to write number?" / "What format?"
   You answer: "Citizenship format: XX-XX-XX-XXXXX (example: 12-34-56-78901)"
   
4️⃣ FORM HELP - Answer about THIS form only
   User asks: "How fill form?" / "Form steps?" / "What's next?"
   You answer: "Fill these steps: 1) Upload document 2) Personal info 3) Address 4) Document details 5) Review & submit"
   
5️⃣ OCR HELP - Answer about THIS form's OCR
   User asks: "How use OCR?" / "Auto-fill?" / "Upload help?"
   You answer: "Upload a clear photo. We auto-extract your data. Review it, correct errors, then submit."

🚫 BLOCK EVERYTHING ELSE - Use this response:
   "I only help with this KYC form. I can answer about your status, documents, form steps, or format."

RESPONSE RULES:
✓ Keep it SHORT (1-2 sentences max)
✓ Use the user's REAL status from above
✓ ONLY talk about THIS form
✓ NO links, NO general info, NO eSewa procedures
✓ Be helpful and specific`;

    // Build chat history for Mistral
    const history = conversationHistory.map((h) => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content,
    }));

    // Add current user message to history
    history.push({
      role: "user",

      content: message,
    });

    // Call Mistral AI with conversation history
    const result = await client.chat.complete({
      model: "mistral-large-latest",
      system: systemPrompt,
      messages: history,
      maxTokens: 200,
    });

    let reply =
      result.choices[0].message.content ||
      "Sorry, I could not process your request.";

    // INTELLIGENT FILTER: Only block truly out-of-scope responses
    const lowerReply = reply.toLowerCase();
    const lowerMsg = (message || "").toLowerCase();

    // RED FLAGS: Signs of OUT-OF-SCOPE answer
    const hasOutOfScopeContent =
      lowerReply.includes("for individuals") ||
      lowerReply.includes("for businesses") ||
      lowerReply.includes("for merchants") ||
      lowerReply.includes("open esewa") ||
      lowerReply.includes("esewa app") ||
      lowerReply.includes("esewa platform") ||
      lowerReply.includes("cvl") ||
      lowerReply.includes("cams") ||
      lowerReply.includes("kra") ||
      lowerReply.includes("zerodha") ||
      lowerReply.includes("groww");

    // Check if AI is answering the user's ACTUAL question
    const isAnsweringQuestion =
      (lowerMsg.includes("status") &&
        (lowerReply.includes(user.kycStatus) || lowerReply.includes("kyc"))) ||
      (lowerMsg.includes("document") && lowerReply.includes("citizenship")) ||
      ((lowerMsg.includes("format") || lowerMsg.includes("number")) &&
        lowerReply.includes("xx-xx-xx")) ||
      ((lowerMsg.includes("fill") || lowerMsg.includes("form")) &&
        lowerReply.includes("step")) ||
      ((lowerMsg.includes("ocr") || lowerMsg.includes("upload")) &&
        lowerReply.includes("upload"));

    // If it's a legitimate question but AI dodged it, use fallback
    const shouldUseFallback =
      hasOutOfScopeContent ||
      (!isAnsweringQuestion && lowerReply.includes("only help with"));

    let finalReply = reply;

    if (shouldUseFallback) {
      // Use smart fallback based on user's question
      if (lowerMsg.includes("status")) {
        finalReply = `Your KYC status is **${user.kycStatus}**. ${user.kycStatus === "verified" ? "✅ Your account is activated." : user.kycStatus === "rejected" ? "Please resubmit with corrections." : "Check your dashboard for details."}`;
      } else if (lowerMsg.includes("document") || lowerMsg.includes("upload")) {
        finalReply = `In this form, you can upload:\n• Citizenship certificate\n• Passport\n• Driving license\n• Voter ID`;
      } else if (
        lowerMsg.includes("format") ||
        lowerMsg.includes("citizenship")
      ) {
        finalReply = `Citizenship number format: **XX-XX-XX-XXXXX** (example: 12-34-56-78901)`;
      } else if (lowerMsg.includes("fill") || lowerMsg.includes("form")) {
        finalReply = `Follow these 5 steps:\n1) Upload document\n2) Personal info\n3) Address\n4) Document details\n5) Review & submit`;
      } else if (lowerMsg.includes("ocr") || lowerMsg.includes("auto")) {
        finalReply = `Upload a clear photo of your document. We auto-extract your data. Review and correct any errors, then submit.`;
      } else {
        finalReply = `I help with KYC status, documents, form steps, formats, and OCR upload. What would you like to know?`;
      }
    }

    res.json({ success: true, reply: finalReply });
  } catch (err) {
    console.error("AI chat error:", err.message);

    // Provide helpful fallback responses (system-specific only, NO external info)
    const lowerMsg = (req.body.message || "").toLowerCase();
    let fallbackReply = "Having connection issues. Try again later.";

    if (lowerMsg.includes("status")) {
      fallbackReply = `Your KYCAssist status: **${req.user.kycStatus}**`;
    } else if (lowerMsg.includes("reject") || lowerMsg.includes("fail")) {
      fallbackReply = `Check your dashboard in KYCAssist for rejection details.`;
    } else if (lowerMsg.includes("document") || lowerMsg.includes("upload")) {
      fallbackReply = `KYCAssist accepts:\n- Citizenship certificate\n- Passport\n- Driving license`;
    } else if (lowerMsg.includes("form") || lowerMsg.includes("field")) {
      fallbackReply = `Fill form fields with your details exactly as shown on your document.`;
    } else {
      fallbackReply = `I only support KYCAssist. For questions outside this system, contact support.`;
    }

    res.json({ success: true, reply: fallbackReply, fallback: true });
  }
});

// ── GET /api/ai/hints/:field ──────────────────────────────────────────────────
// Get contextual hint for a specific KYC form field
router.get("/hints/:field", protect, async (req, res) => {
  const hints = {
    fullName: {
      hint: "Enter your full legal name exactly as it appears on your citizenship certificate or passport.",
      example: "e.g. Bigam Pachhai",
      common_mistakes: [
        "Using nicknames",
        "Missing middle name",
        "Using abbreviations",
      ],
    },
    dateOfBirth: {
      hint: "Enter your date of birth in YYYY-MM-DD format.",
      example: "e.g. 1999-05-15",
      common_mistakes: [
        "Wrong date format",
        "Using BS (Bikram Sambat) instead of AD",
      ],
    },
    documentNumber: {
      hint: "Citizenship: XX-XX-XX-XXXXX format. Passport: 2 letters + 7 digits.",
      example: "Citizenship: 12-34-56-78901 | Passport: PA1234567",
      common_mistakes: [
        "Missing hyphens in citizenship number",
        "Including spaces",
      ],
    },
    permanentDistrict: {
      hint: "Select the district where your citizenship was issued.",
      example: "e.g. Rupandehi, Kathmandu, Pokhara",
      common_mistakes: ["Using zone name instead of district"],
    },
    documentIssuedDate: {
      hint: "Enter the date your document was issued, found on the document itself.",
      example: "e.g. 2015-03-20",
      common_mistakes: ["Confusing issue date with expiry date"],
    },
    fatherName: {
      hint: "Enter your father's full name as per official records.",
      example: "e.g. Ram Bahadur Pachhai",
      common_mistakes: ["Using shortened version of name"],
    },
  };

  const fieldHint = hints[req.params.field] || {
    hint: "Please fill this field accurately as per your official documents.",
    example: "",
    common_mistakes: [],
  };

  res.json({ success: true, field: req.params.field, ...fieldHint });
});

module.exports = router;
