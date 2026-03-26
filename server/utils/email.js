const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Homely" <${process.env.SMTP_USER || 'noreply@homely.uz'}>`,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Homely account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1A56DB;">Welcome to Homely!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${url}" style="display:inline-block;background:#1A56DB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#666;font-size:14px;">Or copy this link: <br/>${url}</p>
        <p style="color:#999;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Homely password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1A56DB;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${url}" style="display:inline-block;background:#1A56DB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666;font-size:14px;">Or copy this link: <br/>${url}</p>
        <p style="color:#999;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
