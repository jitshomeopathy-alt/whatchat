const axios = require('axios');

const BASE_URL = 'https://graph.facebook.com/v20.0';

/**
 * Send a plain text message via Meta Cloud API.
 * @param {string} to   - Recipient WhatsApp phone number (e.g. "919876543210")
 * @param {string} text - Message text (max 4096 chars)
 */
async function sendText(to, text) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_TOKEN not configured');
  }

  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('[WhatsApp] sendText error:', JSON.stringify(detail));
    throw new Error(`Failed to send WhatsApp message: ${JSON.stringify(detail)}`);
  }
}

/**
 * Send an interactive message with up to 3 reply buttons.
 * @param {string} to       - Recipient WhatsApp number
 * @param {string} body     - Body text (max 1024 chars)
 * @param {Array<{id:string,title:string}>} buttons - 1-3 buttons. title <= 20 chars.
 * @param {Object} [opts]   - { header, footer }
 */
async function sendButtons(to, body, buttons, opts = {}) {
  if (!Array.isArray(buttons) || buttons.length < 1 || buttons.length > 3) {
    throw new Error('sendButtons requires 1-3 buttons (WhatsApp limit)');
  }

  const interactive = {
    type: 'button',
    body: { text: truncate(body, 1024) },
    action: {
      buttons: buttons.map((b) => ({
        type: 'reply',
        reply: { id: String(b.id), title: truncate(b.title, 20) },
      })),
    },
  };

  if (opts.header) interactive.header = { type: 'text', text: truncate(opts.header, 60) };
  if (opts.footer) interactive.footer = { text: truncate(opts.footer, 60) };

  return sendInteractive(to, interactive);
}

/**
 * Send an interactive list message with up to 10 rows total.
 * @param {string} to        - Recipient WhatsApp number
 * @param {string} body      - Body text (max 1024 chars)
 * @param {string} buttonText- Label of the list-open button (max 20 chars)
 * @param {Array<{id:string,title:string,description?:string}>} rows - 1-10 rows. title <= 24 chars.
 * @param {Object} [opts]    - { header, footer, sectionTitle }
 */
async function sendList(to, body, buttonText, rows, opts = {}) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 10) {
    throw new Error('sendList requires 1-10 rows (WhatsApp limit)');
  }

  const interactive = {
    type: 'list',
    body: { text: truncate(body, 1024) },
    action: {
      button: truncate(buttonText || 'Choose', 20),
      sections: [
        {
          title: truncate(opts.sectionTitle || 'Options', 24),
          rows: rows.map((r) => ({
            id: String(r.id),
            title: truncate(r.title, 24),
            ...(r.description ? { description: truncate(r.description, 72) } : {}),
          })),
        },
      ],
    },
  };

  if (opts.header) interactive.header = { type: 'text', text: truncate(opts.header, 60) };
  if (opts.footer) interactive.footer = { text: truncate(opts.footer, 60) };

  return sendInteractive(to, interactive);
}

/**
 * Low-level sender for interactive payloads.
 */
async function sendInteractive(to, interactive) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_TOKEN not configured');
  }

  const url = `${BASE_URL}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('[WhatsApp] sendInteractive error:', JSON.stringify(detail));
    throw new Error(`Failed to send WhatsApp interactive message: ${JSON.stringify(detail)}`);
  }
}

function truncate(str, max) {
  const s = String(str ?? '');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

/**
 * Download media from WhatsApp by media ID.
 * Returns a Buffer containing the binary content.
 * @param {string} mediaId - The media_id from the incoming message object
 */
async function downloadMedia(mediaId) {
  const token = process.env.WHATSAPP_TOKEN;

  if (!token) {
    throw new Error('WHATSAPP_TOKEN not configured');
  }

  // Step 1: Retrieve the download URL
  const metaUrl = `${BASE_URL}/${mediaId}`;
  let downloadUrl;

  try {
    const metaResponse = await axios.get(metaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    downloadUrl = metaResponse.data.url;
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('[WhatsApp] downloadMedia metadata error:', JSON.stringify(detail));
    throw new Error(`Failed to fetch media metadata: ${JSON.stringify(detail)}`);
  }

  // Step 2: Download the actual binary
  try {
    const mediaResponse = await axios.get(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer',
    });
    return Buffer.from(mediaResponse.data);
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error('[WhatsApp] downloadMedia binary error:', JSON.stringify(detail));
    throw new Error(`Failed to download media binary: ${JSON.stringify(detail)}`);
  }
}

module.exports = { sendText, sendButtons, sendList, downloadMedia };
