const express = require('express');
const router = express.Router();
const { dispatch } = require('../conversation/dispatcher');
const { sendTyping } = require('../services/whatsapp');
const razorpay = require('../services/razorpay');
const { completePayment } = require('../conversation/flows/consult');
const Order = require('../models/Order');

// How long to show the "typing…" indicator before our reply, for a human feel.
// Randomised within a small range so it never feels mechanically uniform.
const TYPING_MIN_MS = parseInt(process.env.TYPING_MIN_MS, 10) || 5000;
const TYPING_MAX_MS = parseInt(process.env.TYPING_MAX_MS, 10) || 5000;

function humanTypingDelay() {
  const lo = Math.min(TYPING_MIN_MS, TYPING_MAX_MS);
  const hi = Math.max(TYPING_MIN_MS, TYPING_MAX_MS);
  const ms = lo + Math.floor(Math.random() * (hi - lo + 1));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

          // Give a human touch: show a "typing…" indicator and pause briefly
          // before replying. The indicator clears automatically when dispatch
          // sends its first message. Best-effort — never block the reply.
          await sendTyping(message.id);
          await humanTypingDelay();

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
 * POST /webhook/razorpay
 * Razorpay payment webhook. On `payment_link.paid` we advance the matching
 * user's session from the payment gate to the Order / Consult choice.
 */
router.post('/razorpay', async (req, res) => {
  // Verify the signature against the raw bytes Razorpay sent.
  const signature = req.headers['x-razorpay-signature'];
  if (!razorpay.verifyWebhookSignature(req.rawBody, signature)) {
    console.warn('[Razorpay] Webhook signature verification failed');
    return res.sendStatus(400);
  }

  try {
    const event = req.body?.event;
    if (event === 'payment_link.paid') {
      const entity = req.body?.payload?.payment_link?.entity || {};
      const { whatsappId, orderId } = entity?.notes || {};

      // Storefront order payment.
      if (orderId) {
        const paymentId =
          req.body?.payload?.payment?.entity?.id || entity?.id || '';
        const order = await Order.findById(orderId);
        if (order && order.status === 'pending') {
          order.status = 'paid';
          order.payment.status = 'paid';
          order.payment.paymentId = paymentId;
          order.updatedAt = new Date();
          await order.save();
          console.log(`[Razorpay] Order ${orderId} marked paid (${entity.id})`);
        } else if (!order) {
          console.warn(`[Razorpay] payment_link.paid for unknown order ${orderId}`);
        }
      } else if (whatsappId) {
        // WhatsApp consultation payment.
        console.log(`[Razorpay] Payment confirmed for ${whatsappId} (${entity.id})`);
        await completePayment(whatsappId);
      } else {
        console.warn('[Razorpay] payment_link.paid missing notes.orderId / notes.whatsappId');
      }
    }
  } catch (err) {
    console.error('[Razorpay] Webhook handler error:', err.message);
  }

  // Always 200 so Razorpay does not retry-storm us.
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
