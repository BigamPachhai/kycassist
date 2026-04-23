const express = require('express');
const KYC = require('../models/KYC');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all KYC submissions
router.get('/kyc', protect, authorizeAdmin, async (req, res) => {
  try {
    const kycs = await KYC.find().populate('user', 'fullName email phone');
    res.json({ success: true, kycs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a single KYC detail
router.get('/kyc/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const kyc = await KYC.findById(req.params.id).populate('user', 'fullName email phone');
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC not found' });
    res.json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update KYC Status
router.put('/kyc/:id/status', protect, authorizeAdmin, async (req, res) => {
  try {
    const { status, note, rejectionReason, actionRequired } = req.body;
    const kyc = await KYC.findById(req.params.id);
    
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC not found' });

    kyc.status = status;
    if (status === 'verified') kyc.verifiedAt = new Date();
    if (status === 'rejected') kyc.rejectionReason = rejectionReason;
    if (status === 'action_required') kyc.actionRequired = actionRequired;

    kyc.statusHistory.push({
      status,
      note: note || `Status changed to ${status}`,
      changedBy: 'admin',
    });

    await kyc.save();

    // Update User model status
    const user = await User.findById(kyc.user);
    if (user) {
      user.kycStatus = status;
      if (status === 'verified') user.kycVerifiedAt = new Date();
      if (status === 'rejected') user.kycRejectionReason = rejectionReason;
      if (status === 'action_required') user.kycRejectionReason = actionRequired;
      await user.save();

      // Create Notification
      const notificationTitle = status === 'verified' ? 'KYC Verification Complete' 
                            : status === 'rejected' ? 'KYC Application Rejected'
                            : 'Action Required on Your KYC';
      const notificationMessage = status === 'verified' ? 'Congratulations! Your KYC verification has been completed successfully.'
                            : status === 'rejected' ? `Your KYC application was rejected: ${rejectionReason}`
                            : `Please take action: ${actionRequired}`;
                            
      await Notification.create({
        user: user._id,
        type: status === 'verified' ? 'kyc_verified' : status === 'rejected' ? 'kyc_rejected' : 'action_required',
        title: notificationTitle,
        message: notificationMessage,
      });
    }

    res.json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
