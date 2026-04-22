const nodemailer = require("nodemailer");

function canSendEmail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendOtpEmail({ to, otp, name }) {
  if (!canSendEmail()) {
    return { sent: false };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Your Secure File Manager OTP",
    text: `Hello ${name || "user"}, your OTP is ${otp}. It expires when the login session expires.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Secure File Manager Login OTP</h2>
        <p>Hello ${name || "user"},</p>
        <p>Your one-time password is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>Enter this OTP to finish signing in.</p>
      </div>
    `
  });

  return { sent: true };
}

async function sendSharedFileEmail({ to, senderName, fileName, fileBuffer, mimeType }) {
  if (!canSendEmail()) {
    return { sent: false, reason: "smtp_not_configured" };
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `${senderName || "Someone"} shared a file with you`,
      text: `${senderName || "Someone"} shared ${fileName} with you as an attachment.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>File Shared With You</h2>
          <p>${senderName || "Someone"} shared <strong>${fileName}</strong> with you.</p>
          <p>The file is attached to this email.</p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: fileBuffer,
          contentType: mimeType
        }
      ]
    });

    return { sent: true };
  } catch (error) {
    console.error("Shared file email failed:", error.message);
    return {
      sent: false,
      reason: "email_send_failed"
    };
  }
}

module.exports = {
  canSendEmail,
  sendOtpEmail,
  sendSharedFileEmail
};
