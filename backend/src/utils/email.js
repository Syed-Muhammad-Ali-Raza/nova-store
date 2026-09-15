const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'NovStore <onboarding@resend.dev>';

const resend = apiKey ? new Resend(apiKey) : null;

const sendEmail = async (to, subject, html) => {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
  return data;
};

const sendVerificationEmail = (to, link) =>
  sendEmail(
    to,
    'Verify your email address',
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4f46e5">Confirm your email</h2>
      <p>Thanks for signing up for <strong>NovStore</strong>. Click the button below to verify your email address:</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold">Verify my email</a></p>
      <p style="color:#6b7280;font-size:13px">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>`
  );

const sendTwoFactorEmail = (to, otp) =>
  sendEmail(
    to,
    'Your login code',
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4f46e5">Two-factor authentication</h2>
      <p>Your verification code is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#111827;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px">${otp}</p>
      <p style="color:#6b7280;font-size:13px">This code expires in 10 minutes. Never share it with anyone.</p>
    </div>`
  );

const sendResetPasswordEmail = (to, link) =>
  sendEmail(
    to,
    'Reset your password',
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4f46e5">Reset your password</h2>
      <p>We received a request to reset your <strong>NovStore</strong> password. Click the button below to choose a new one:</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold">Reset password</a></p>
      <p style="color:#6b7280;font-size:13px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>`
  );

module.exports = { sendVerificationEmail, sendTwoFactorEmail, sendResetPasswordEmail };
