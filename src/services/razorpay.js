const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://api.razorpay.com/v1';

/**
 * Default consultation fee in paise (₹399 = 39900 paise).
 * Override with PAYMENT_AMOUNT_PAISE in the environment.
 */
function feePaise() {
  return parseInt(process.env.PAYMENT_AMOUNT_PAISE, 10) || 39900;
}

function isConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader() {
  const creds = `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`;
  return `Basic ${Buffer.from(creds).toString('base64')}`;
}

/**
 * Create a Razorpay Payment Link for the consultation fee.
 * The whatsappId is stored in `notes` so the webhook can map a paid link back
 * to the right user/session.
 *
 * @param {Object} opts
 * @param {string} opts.whatsappId - sender's WhatsApp number (digits only)
 * @param {string} [opts.name]     - customer name for the receipt
 * @returns {Promise<{ id: string, shortUrl: string }>}
 */
async function createPaymentLink({ whatsappId, name }) {
  if (!isConfigured()) {
    throw new Error('Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing)');
  }

  const payload = {
    amount: feePaise(),
    currency: 'INR',
    accept_partial: false,
    description: 'Personalised remedy plan',
    customer: {
      name: name || 'Customer',
      // WhatsApp ids are bare digits (e.g. 919876543210); Razorpay wants +<number>.
      contact: `+${String(whatsappId).replace(/^\+/, '')}`,
    },
    notify: { sms: false, email: false },
    reminder_enable: false,
    notes: { whatsappId: String(whatsappId) },
  };

  const { data } = await axios.post(`${BASE_URL}/payment_links`, payload, {
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
  });

  return { id: data.id, shortUrl: data.short_url };
}

/**
 * Fetch a payment link's current status from Razorpay.
 * @param {string} id - payment link id (plink_...)
 * @returns {Promise<string>} - status, e.g. 'created' | 'paid' | 'cancelled' | 'expired'
 */
async function getPaymentLinkStatus(id) {
  if (!isConfigured()) {
    throw new Error('Razorpay is not configured');
  }
  const { data } = await axios.get(`${BASE_URL}/payment_links/${id}`, {
    headers: { Authorization: authHeader() },
  });
  return data.status;
}

/**
 * Verify the X-Razorpay-Signature header of a webhook using the raw request body.
 * @param {Buffer|string} rawBody - the exact bytes Razorpay POSTed
 * @param {string} signature - value of the x-razorpay-signature header
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !rawBody) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

module.exports = {
  isConfigured,
  feePaise,
  createPaymentLink,
  getPaymentLinkStatus,
  verifyWebhookSignature,
};
