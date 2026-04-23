const express = require('express');
const KYC = require('../models/KYC');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { sendNotificationEmail } = require('../utils/mailer');
const { validateKYCField } = require('../utils/kycValidator');

const router = express.Router();

// ── GET /api/kyc/status ───────────────────────────────────────────────────────
// Get current user's KYC record & status
router.get('/status', protect, async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!kyc) {
      return res.json({ success: true, kyc: null, status: 'not_started' });
    }
    res.json({ success: true, kyc, status: kyc.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/kyc/save ────────────────────────────────────────────────────────
// Save KYC draft (auto-save as user types)
router.post('/save', protect, async (req, res) => {
  try {
    let kyc = await KYC.findOne({ user: req.user._id, status: 'draft' });

    const data = { ...req.body, user: req.user._id };

    if (kyc) {
      Object.assign(kyc, data);
    } else {
      kyc = new KYC(data);
    }

    kyc.completionPercentage = kyc.calculateCompletion();
    await kyc.save();

    // Update user kycStatus
    await User.findByIdAndUpdate(req.user._id, { kycStatus: 'in_progress' });

    res.json({ success: true, kyc, completionPercentage: kyc.completionPercentage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/kyc/submit ──────────────────────────────────────────────────────
// Final submission
router.post('/submit', protect, async (req, res) => {
  try {
    // Enforce required fields only at submission time
    const required = ['fullName', 'dateOfBirth', 'gender', 'permanentDistrict', 'permanentMunicipality', 'documentType', 'documentNumber'];
    const missing = required.filter(f => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    let kyc = await KYC.findOne({ user: req.user._id, status: 'draft' });

    if (!kyc) {
      kyc = new KYC({ ...req.body, user: req.user._id });
    } else {
      Object.assign(kyc, req.body);
    }

    kyc.status = 'submitted';
    kyc.submittedAt = new Date();
    kyc.completionPercentage = 100;
    kyc.statusHistory.push({
      status: 'submitted',
      note: 'KYC submitted by user',
      changedBy: 'user',
    });

    await kyc.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: 'submitted',
      kycSubmittedAt: new Date(),
    });

    // Create in-app notification
    await Notification.create({
      user: req.user._id,
      type: 'kyc_submitted',
      title: 'KYC Submitted Successfully',
      message: 'Your KYC has been submitted and is under review. We will notify you once it is processed.',
    });

    // Send email
    await sendNotificationEmail(req.user.email, req.user.fullName, 'submitted');

    // Simulate moving to under_review after 2 seconds (demo only)
    setTimeout(async () => {
      try {
        const k = await KYC.findById(kyc._id);
        if (k && k.status === 'submitted') {
          k.status = 'under_review';
          k.statusHistory.push({ status: 'under_review', note: 'Under review by eSewa team', changedBy: 'system' });
          await k.save();
          await User.findByIdAndUpdate(req.user._id, { kycStatus: 'under_review' });
          await Notification.create({
            user: req.user._id,
            type: 'info',
            title: 'KYC Under Review',
            message: 'Your KYC is now under review. Expected completion: 1–2 business days.',
          });
        }
      } catch (e) { /* silent */ }
    }, 2000);

    res.json({ success: true, message: 'KYC submitted successfully', kyc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/kyc/validate-field ──────────────────────────────────────────────
// Real-time field validation (called on blur/change)
router.post('/validate-field', protect, async (req, res) => {
  try {
    const { field, value, documentType } = req.body;
    const result = validateKYCField(field, value, documentType);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/kyc/log-error ───────────────────────────────────────────────────
// Log field error for analytics
router.post('/log-error', protect, async (req, res) => {
  try {
    const { field, errorType } = req.body;
    await KYC.findOneAndUpdate(
      { user: req.user._id, status: 'draft' },
      { $push: { errorLog: { field, errorType } } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/kyc/history ──────────────────────────────────────────────────────
// Get full status history
router.get('/history', protect, async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!kyc) return res.json({ success: true, history: [] });
    res.json({ success: true, history: kyc.statusHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/kyc/admin/update-status ────────────────────────────────────────
// Admin: update KYC status (mock admin endpoint)
router.post('/admin/update-status', async (req, res) => {
  try {
    const { kycId, status, note, rejectionReason } = req.body;
    const adminKey = req.headers['x-admin-key'];

    if (adminKey !== (process.env.ADMIN_KEY || 'admin123')) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const kyc = await KYC.findByIdAndUpdate(
      kycId,
      {
        status,
        rejectionReason: rejectionReason || '',
        $push: { statusHistory: { status, note, changedBy: 'admin' } },
        ...(status === 'verified' ? { verifiedAt: new Date() } : {}),
      },
      { new: true }
    ).populate('user');

    if (!kyc) return res.status(404).json({ success: false, message: 'KYC not found' });

    await User.findByIdAndUpdate(kyc.user._id, { kycStatus: status });

    await Notification.create({
      user: kyc.user._id,
      type: status === 'verified' ? 'kyc_verified' : status === 'rejected' ? 'kyc_rejected' : 'action_required',
      title: status === 'verified' ? '🎉 KYC Verified!' : status === 'rejected' ? 'KYC Rejected' : 'Action Required',
      message: note || rejectionReason || `Your KYC status has been updated to ${status}`,
    });

    await sendNotificationEmail(kyc.user.email, kyc.user.fullName, status, rejectionReason);

    res.json({ success: true, kyc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
