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
  // NOTE: We must fully process the message BEFORE responding. On serverless
  // platforms (Vercel) the function is frozen/terminated as soon as the HTTP
  // response is sent, so any fire-and-forget async work after res.send() never
  // runs and the user never gets a reply. A greeting/registration step is well
  // within Meta's ~20s acknowledgement window. We always answer 200 (even on
  // error) so Meta does not retry-storm us.
  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') {
      return res.sendStatus(200);
    }

    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value || {};
        const messages = value.messages || [];

        for (const message of messages) {
          const whatsappId = message.from; // Sender's WhatsApp number

          if (!whatsappId) {
            console.warn('[Webhook] Message missing "from" field, skipping');
            continue;
          }

          // Normalize interactive (button/list) taps into a uniform shape the
          // flows can read: message.interactive = { id, title }.
          const normalized = normalizeMessage(message);

          // Filter out delivery status updates and other non-message events
          const supportedTypes = ['text', 'image', 'audio', 'video', 'document', 'interactive'];
          if (!supportedTypes.includes(normalized.type)) {
            console.log(`[Webhook] Ignoring message type: ${normalized.type}`);
            continue;
          }

          console.log(`[Webhook] Incoming ${normalized.type} from ${whatsappId}`);

          // Process fully BEFORE responding so serverless does not freeze the
          // function mid-reply. Swallow per-message errors so one bad message
          // does not abort the rest of the batch.
          try {
            await dispatch(whatsappId, normalized);
          } catch (err) {
            console.error(`[Webhook] Dispatch error for ${whatsappId}:`, err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Webhook] POST handler error:', err.message);
  }

  // Always acknowledge so Meta does not retry-storm us.
  return res.sendStatus(200);
});

/**
 * Normalize an incoming WhatsApp message. For interactive button/list replies,
 * expose the selected option as `message.interactive = { id, title }` and also
 * mirror the title into `message.text.body` so existing text-based handlers
 * keep working.
 * @param {Object} message - Raw message object from Meta
 * @returns {Object} normalized message
 */
function normalizeMessage(message) {
  if (message.type !== 'interactive') return message;

  const interactive = message.interactive || {};
  const reply =
    interactive.type === 'button_reply'
      ? interactive.button_reply
      : interactive.type === 'list_reply'
      ? interactive.list_reply
      : null;

  if (!reply) return message;

  return {
    ...message,
    type: 'interactive',
    interactive: { id: reply.id, title: reply.title || '' },
    // Back-compat: many handlers read message.text.body
    text: { body: reply.title || reply.id || '' },
  };
}

module.exports = router;
