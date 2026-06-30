const nodemailer = require('nodemailer');

/**
 * Lightweight SMTP email sender, used for internal/admin notifications
 * (e.g. "a user just paid"). Configured entirely via environment:
 *
 *   SMTP_HOST   - smtp server host (e.g. smtp.gmail.com)
 *   SMTP_PORT   - smtp port (587 for STARTTLS, 465 for SSL); default 587
 *   SMTP_USER   - smtp username
 *   SMTP_PASS   - smtp password / app password
 *   SMTP_FROM   - From: address (defaults to SMTP_USER)
 *   ADMIN_EMAIL - default recipient for admin notifications
 *
 * Every call is best-effort: if SMTP isn't configured or sending fails we log
 * and return false rather than throwing, so a mail hiccup never breaks the
 * payment/chat flow.
 */

let transporter;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (transporter) return transporter;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // SSL on 465, STARTTLS otherwise
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Send an email. Best-effort — never throws.
 * @param {Object} opts
 * @param {string} [opts.to]      - recipient(s); defaults to ADMIN_EMAIL
 * @param {string} opts.subject
 * @param {string} opts.text      - plain-text body
 * @param {string} [opts.html]    - optional HTML body
 * @returns {Promise<boolean>} true if accepted by the SMTP server
 */
async function sendEmail({ to, subject, text, html }) {
  const recipient = to || process.env.ADMIN_EMAIL;
  if (!isConfigured()) {
    console.warn('[Email] SMTP not configured — skipping email:', subject);
    return false;
  }
  if (!recipient) {
    console.warn('[Email] No recipient (set ADMIN_EMAIL) — skipping email:', subject);
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipient,
      subject,
      text,
      html,
    });
    console.log(`[Email] Sent "${subject}" to ${recipient}`);
    return true;
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return false;
  }
}

module.exports = { isConfigured, sendEmail };
