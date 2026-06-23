const transporter = require('../config/email');
const env = require('../config/env');
const logger = require('../utils/logger');

// ── Shared email wrapper ──

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    logger.warn('Email not sent (SMTP not configured):', subject);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Phoenix Business Exchange" <${env.smtp.user}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error('Email send failed:', error.message);
    return false;
  }
};

// ── Shared template shell ──

const emailShell = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#060b1c;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060b1c;">
<tr><td align="center" style="padding:40px 16px 48px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Logo & Brand -->
  <tr><td align="center" style="padding-bottom:32px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:42px;height:42px;border-radius:10px;background:linear-gradient(150deg,#ff7a45,#ff4d4d);text-align:center;vertical-align:middle;">
        <img src="https://img.icons8.com/ios-filled/28/ffffff/fire-element.png" width="24" height="24" alt="" style="display:block;margin:9px auto;" />
      </td>
      <td style="padding-left:14px;">
        <div style="font-weight:700;font-size:20px;letter-spacing:0.04em;color:#ffffff;line-height:1;">PHOENIX</div>
        <div style="font-weight:500;font-size:11px;letter-spacing:0.42em;color:#ff8a5c;line-height:1;margin-top:4px;">BUSINESS EXCHANGE</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- Glass Card -->
  <tr><td>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(160deg,rgba(120,160,230,0.08),rgba(20,40,90,0.06));border:1px solid rgba(170,200,255,0.18);border-radius:22px;">
      <tr><td style="padding:40px 36px 36px;">
        ${bodyContent}
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding-top:28px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:8px;height:8px;border-radius:50%;background:#ff5a3c;"></td>
      <td style="padding-left:10px;font-size:10px;letter-spacing:0.18em;color:#46577a;font-weight:600;">
        HIGHLY CONFIDENTIAL &middot; RESTRICTED ACCESS
      </td>
    </tr></table>
    <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(170,200,255,0.1);font-size:11px;color:#33415a;line-height:1.6;">
      Phoenix Business Exchange<br>
      This is an automated message. Please do not reply directly.
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;

// ── Button helper ──

const emailButton = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
  <tr><td style="border-radius:12px;background:linear-gradient(135deg,#2f6bff,#5b8cff 60%,#7fa6ff);box-shadow:0 12px 32px rgba(50,110,255,0.35);">
    <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.04em;text-decoration:none;font-family:'Segoe UI',Arial,sans-serif;">${label}</a>
  </td></tr>
</table>
`;

// ── Info row helper ──

const infoRow = (label, value) => `
<tr>
  <td style="padding:8px 0;font-size:13px;color:#7f93bd;font-weight:600;width:140px;vertical-align:top;">${label}</td>
  <td style="padding:8px 0;font-size:14px;color:#eef3ff;vertical-align:top;">${value}</td>
</tr>
`;

// ── Info card helper ──

const infoCard = (rows) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(6,12,28,0.5);border:1px solid rgba(150,190,255,0.15);border-radius:14px;margin:20px 0;">
  <tr><td style="padding:20px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows}
    </table>
  </td></tr>
</table>
`;

// ─────────────────────────────────────────────────
// 1. Password Reset Email
// ─────────────────────────────────────────────────

const sendPasswordResetEmail = async (email, resetToken, role = 'admin') => {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}&role=${role}`;

  const body = `
    <div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:#ff8a5c;text-transform:uppercase;margin-bottom:8px;">Security Alert</div>
    <h1 style="font-size:24px;font-weight:600;color:#eef3ff;margin:0 0 8px;letter-spacing:-0.01em;">Password Reset Request</h1>
    <p style="font-size:15px;color:#8ea2c8;line-height:1.6;margin:0 0 4px;">
      We received a request to reset the password associated with your Phoenix Business Exchange account.
    </p>

    <p style="font-size:15px;color:#8ea2c8;line-height:1.6;margin:16px 0 0;">
      Click the button below to set a new password. This link will expire in <strong style="color:#bcd0f2;">1 hour</strong>.
    </p>

    ${emailButton(resetUrl, 'RESET PASSWORD')}

    <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(170,200,255,0.1);">
      <p style="font-size:12px;color:#546180;line-height:1.6;margin:0;">
        If you did not request this reset, you can safely ignore this email. Your account remains secure.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Phoenix Business Exchange — Password Reset',
    html: emailShell(body),
  });
};

// ─────────────────────────────────────────────────
// 2. New User Welcome Email (with credentials)
// ─────────────────────────────────────────────────

const sendNewUserEmail = async (email, tempPassword, fullName) => {
  const loginUrl = `${env.frontendUrl}`;

  const body = `
    <div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:#ff8a5c;text-transform:uppercase;margin-bottom:8px;">Welcome</div>
    <h1 style="font-size:24px;font-weight:600;color:#eef3ff;margin:0 0 8px;letter-spacing:-0.01em;">Your account is ready</h1>
    <p style="font-size:15px;color:#8ea2c8;line-height:1.6;margin:0;">
      ${fullName ? `Hello <strong style="color:#bcd0f2;">${fullName}</strong>,<br><br>` : ''}An account has been created for you on the Phoenix Business Exchange portal. Use the credentials below to log in.
    </p>

    ${infoCard(
      infoRow('Email', `<span style="color:#7fa6ff;">${email}</span>`) +
      infoRow('Temporary Password', `<code style="background:rgba(47,107,255,0.12);border:1px solid rgba(91,140,255,0.2);border-radius:6px;padding:3px 10px;font-size:15px;color:#7fa6ff;letter-spacing:0.06em;">${tempPassword}</code>`)
    )}

    <div style="background:rgba(255,122,69,0.08);border:1px solid rgba(255,138,92,0.2);border-radius:10px;padding:14px 18px;margin:0 0 4px;">
      <p style="font-size:13px;color:#ffb39c;margin:0;line-height:1.5;">
        <strong>Important:</strong> For security, please change your password immediately after your first login.
      </p>
    </div>

    ${emailButton(loginUrl, 'LOGIN TO PORTAL')}
  `;

  return sendEmail({
    to: email,
    subject: 'Phoenix Business Exchange — Your Account Has Been Created',
    html: emailShell(body),
  });
};

// ─────────────────────────────────────────────────
// 3. Inquiry Notification — Admin
// ─────────────────────────────────────────────────

const sendInquiryNotificationAdmin = async (inquiry) => {
  const body = `
    <div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:#ff8a5c;text-transform:uppercase;margin-bottom:8px;">New Inquiry</div>
    <h1 style="font-size:24px;font-weight:600;color:#eef3ff;margin:0 0 8px;letter-spacing:-0.01em;">Business Inquiry Received</h1>
    <p style="font-size:15px;color:#8ea2c8;line-height:1.6;margin:0;">
      A new inquiry has been submitted on the portal. Details below.
    </p>

    ${infoCard(
      infoRow('From', `<strong style="color:#eef3ff;">${inquiry.userName}</strong>`) +
      infoRow('Email', `<span style="color:#7fa6ff;">${inquiry.userEmail}</span>`) +
      infoRow('Business', `<strong style="color:#eef3ff;">${inquiry.businessName}</strong>`)
    )}

    <div style="margin-top:4px;">
      <div style="font-size:13px;font-weight:600;color:#7f93bd;margin-bottom:10px;">MESSAGE</div>
      <div style="background:rgba(6,12,28,0.5);border:1px solid rgba(150,190,255,0.15);border-radius:14px;padding:20px 24px;">
        <p style="font-size:15px;color:#bcd0f2;line-height:1.7;margin:0;">${inquiry.message}</p>
      </div>
    </div>

    <p style="font-size:13px;color:#546180;line-height:1.6;margin:24px 0 0;">
      Log in to the admin panel to respond to this inquiry.
    </p>
  `;

  return sendEmail({
    to: env.adminEmail,
    subject: `New Inquiry — ${inquiry.businessName}`,
    html: emailShell(body),
  });
};

// ─────────────────────────────────────────────────
// 4. Inquiry Confirmation — User
// ─────────────────────────────────────────────────

const sendInquiryConfirmationUser = async (inquiry) => {
  const body = `
    <div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:#ff8a5c;text-transform:uppercase;margin-bottom:8px;">Inquiry Sent</div>
    <h1 style="font-size:24px;font-weight:600;color:#eef3ff;margin:0 0 8px;letter-spacing:-0.01em;">We received your inquiry</h1>
    <p style="font-size:15px;color:#8ea2c8;line-height:1.6;margin:0;">
      Hello <strong style="color:#bcd0f2;">${inquiry.userName}</strong>,<br><br>
      Thank you for your interest. Your inquiry for <strong style="color:#eef3ff;">${inquiry.businessName}</strong> has been received. Our team will review it and get back to you shortly.
    </p>

    ${infoCard(
      infoRow('Business', `<strong style="color:#eef3ff;">${inquiry.businessName}</strong>`) +
      infoRow('Status', '<span style="display:inline-block;background:rgba(70,226,154,0.12);border:1px solid rgba(70,226,154,0.25);border-radius:6px;padding:2px 10px;font-size:12px;color:#46e29a;font-weight:600;">Received</span>')
    )}

    <div style="margin-top:4px;">
      <div style="font-size:13px;font-weight:600;color:#7f93bd;margin-bottom:10px;">YOUR MESSAGE</div>
      <div style="background:rgba(6,12,28,0.5);border:1px solid rgba(150,190,255,0.15);border-radius:14px;padding:20px 24px;">
        <p style="font-size:15px;color:#bcd0f2;line-height:1.7;margin:0;">${inquiry.message}</p>
      </div>
    </div>

    <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(170,200,255,0.1);">
      <p style="font-size:13px;color:#546180;line-height:1.6;margin:0;">
        Our team typically responds within 1-2 business days. You will receive a follow-up email once we have reviewed your request.
      </p>
    </div>
  `;

  return sendEmail({
    to: inquiry.userEmail,
    subject: `Inquiry Received — ${inquiry.businessName}`,
    html: emailShell(body),
  });
};

// ── Backward-compatible alias ──

const sendInquiryNotification = async (inquiry) => {
  await Promise.all([
    sendInquiryNotificationAdmin(inquiry),
    sendInquiryConfirmationUser(inquiry),
  ]);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendNewUserEmail,
  sendInquiryNotification,
  sendInquiryNotificationAdmin,
  sendInquiryConfirmationUser,
};
