const express = require('express');
const router = express.Router();
const { dispatch } = require('../conversation/dispatcher');

/**
 * GET /webhook
 * Meta Cloud API webhook verification (hub challenge).
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('[Webhook] Verification successful');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook] Verification failed — token mismatch or wrong mode');
  return res.sendStatus(403);
});

/**
 * POST /webhook
 * Inbound messages from Meta Cloud API.
 */
router.post('/', async (req, res) => {
  // Acknowledge receipt immediately (Meta expects 200 within 20s)
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') {
      return;
    }

    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value || {};
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        for (const message of messages) {
          const whatsappId = message.from; // Sender's WhatsApp number

          if (!whatsappId) {
            console.warn('[Webhook] Message missing "from" field, skipping');
            continue;
          }

          // Filter out delivery status updates and other non-message events
          const supportedTypes = ['text', 'image', 'audio', 'video', 'document'];
          if (!supportedTypes.includes(message.type)) {
            console.log(`[Webhook] Ignoring message type: ${message.type}`);
            continue;
          }

          console.log(`[Webhook] Incoming ${message.type} from ${whatsappId}`);

          // Dispatch asynchronously (res already sent)
          dispatch(whatsappId, message).catch((err) => {
            console.error(`[Webhook] Dispatch error for ${whatsappId}:`, err.message);
          });
        }
      }
    }
  } catch (err) {
    console.error('[Webhook] POST handler error:', err.message);
  }
});

module.exports = router;
