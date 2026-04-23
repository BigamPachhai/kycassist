const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const emailTemplates = {
  submitted: (name) => ({
    subject: '✅ KYC Submitted — eSewa',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
        <div style="background:#0F172A;padding:16px 24px;border-radius:6px 6px 0 0">
          <h2 style="color:#14B8A6;margin:0">KYCAssist · eSewa</h2>
        </div>
        <div style="padding:24px">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your KYC has been <strong style="color:#0D9488">submitted successfully</strong>.</p>
          <p>Our team will review your documents within <strong>1–2 business days</strong>. You will receive an email once your KYC is verified.</p>
          <div style="background:#F0F9FF;border-left:4px solid #0D9488;padding:12px 16px;margin:16px 0;border-radius:4px">
            <p style="margin:0;font-size:14px"><strong>What happens next?</strong><br>
            1. Our team reviews your documents<br>
            2. You get notified of the outcome<br>
            3. If approved, your account is fully activated</p>
          </div>
          <p>If you have questions, use the <strong>KYCAssist Chat</strong> in your app.</p>
          <p style="color:#64748B;font-size:13px">— eSewa Team</p>
        </div>
      </div>
    `,
  }),

  under_review: (name) => ({
    subject: '🔍 KYC Under Review — eSewa',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px"><p>Hello <strong>${name}</strong>,</p><p>Your KYC is now <strong>under review</strong>. Expected completion: <strong>1–2 business days</strong>.</p><p>— eSewa Team</p></div>`,
  }),

  verified: (name) => ({
    subject: '🎉 KYC Verified — Welcome to eSewa!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
        <div style="background:#0F172A;padding:16px 24px;border-radius:6px 6px 0 0">
          <h2 style="color:#14B8A6;margin:0">KYCAssist · eSewa</h2>
        </div>
        <div style="padding:24px">
          <p>Hello <strong>${name}</strong>,</p>
          <div style="background:#ECFDF5;border:1px solid #10B981;padding:16px;border-radius:6px;text-align:center;margin:16px 0">
            <h3 style="color:#10B981;margin:0">🎉 Your KYC is Verified!</h3>
          </div>
          <p>Congratulations! Your KYC has been <strong style="color:#10B981">successfully verified</strong>. Your eSewa account is now fully activated.</p>
          <p style="color:#64748B;font-size:13px">— eSewa Team</p>
        </div>
      </div>
    `,
  }),

  rejected: (name, reason) => ({
    subject: '⚠️ KYC Action Required — eSewa',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
        <div style="background:#0F172A;padding:16px 24px;border-radius:6px 6px 0 0">
          <h2 style="color:#14B8A6;margin:0">KYCAssist · eSewa</h2>
        </div>
        <div style="padding:24px">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Unfortunately, your KYC could not be approved at this time.</p>
          ${reason ? `<div style="background:#FFF1F2;border-left:4px solid #EF4444;padding:12px 16px;margin:16px 0;border-radius:4px"><strong>Reason:</strong> ${reason}</div>` : ''}
          <p><strong>Next steps:</strong><br>Please correct the issue and resubmit. Use the KYCAssist Chat in your app for guidance.</p>
          <p style="color:#64748B;font-size:13px">— eSewa Team</p>
        </div>
      </div>
    `,
  }),
};

const sendNotificationEmail = async (email, name, status, rejectionReason = '') => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📧 [Email skipped — no credentials] To: ${email}, Status: ${status}`);
      return;
    }
    const transporter = createTransporter();
    const template = emailTemplates[status]?.(name, rejectionReason);
    if (!template) return;

    await transporter.sendMail({
      from: `"eSewa KYCAssist" <${process.env.EMAIL_USER}>`,
      to: email,
      ...template,
    });
    console.log(`📧 Email sent to ${email} — status: ${status}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

module.exports = { sendNotificationEmail };
