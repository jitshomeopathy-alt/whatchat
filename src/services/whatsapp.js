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

module.exports = { sendText, downloadMedia };
