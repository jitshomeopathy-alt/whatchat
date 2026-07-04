const { sendText } = require('../services/whatsapp');
const { t } = require('./i18n');
const { loadSession, saveSession, resetSession } = require('./stateManager');
const registrationFlow = require('./flows/registration');
const consultFlow = require('./flows/consult');
const User = require('../models/User');

/**
 * Main dispatcher. Receives a parsed message and routes it to the correct flow.
 * @param {string} whatsappId - Sender's WhatsApp ID
 * @param {Object} message    - Parsed message object { type, text, image, ... }
 */
async function dispatch(whatsappId, message) {
  let session;

  try {
    session = await loadSession(whatsappId);
  } catch (err) {
    console.error('[Dispatcher] Session load error:', err.message);
    await sendText(whatsappId, 'Sorry, there was a system error. Please try again.');
    return;
  }

  const state = session.state;
  const text = message.type === 'text' ? (message.text?.body || '').trim() : '';
  const lowerText = text.toLowerCase();

  // ── Global commands (available from any state) ─────────────────────────────

  if (lowerText === 'help') {
    await sendHelpMessage(whatsappId, state, session);
    return;
  }

  if (lowerText === 'cancel' || lowerText === 'reset') {
    const user = await User.findOne({ whatsappId });
    await resetSession(whatsappId, !!user);
    await sendText(
      whatsappId,
      `🔄 Current operation cancelled.\n\n` +
        (user
          ? `Welcome back, *${user.name}*! Type *"help"* to see what I can do.`
          : `Type *"hi"* or *"register"* to get started.`)
    );
    return;
  }

  // ── Handed off to the expert's number (terminal) ───────────────────────────
  // After payment the conversation moves to a dedicated number. Any message here
  // (hi/hello/anything, now or later) just gets a gentle "chat shifted" reply.
  // "cancel"/"reset" above still lets them start a fresh consultation.
  if (state === 'SHIFTED') {
    await sendText(whatsappId, t('chatShifted', session.language || 'en'));
    return;
  }

  // ── Intake states (language → intro → concern → summary) ───────────────────

  const registrationStates = [
    'IDLE',
    'REGISTERING_LANGUAGE',
    'READY_CONFIRM',
    'PURPOSE_SELECT',
    'REGISTERING_NAME',
    'REGISTERING_GENDER',
    'CONCERN_SELECT',
    'CONCERN_OTHER',
    'CONCERN_REALIZE',
    'CONCERN_AFFECT',
    'CONCERN_SEVERITY',
    'SUMMARY_CONFIRM',
    'SUMMARY_CLARIFY',
  ];

  // ── Post-summary states (path selection → astro details → payment) ─────────

  const consultStates = [
    'PATH_SELECT',
    'ASTRO_PALM',
    'ASTRO_KUNDLI',
    'ASTRO_DOB',
    'ASTRO_BIRTH_TIME',
    'ASTRO_BIRTH_PLACE',
    'PAYMENT_PENDING',
    'MEDICAL_Q',
  ];

  if (registrationStates.includes(state)) {
    // Every contact — new or returning — starts the journey from the top
    // (language → intro). Mid-intake states forward to the same handler.
    await registrationFlow.handle(whatsappId, message, session);
    return;
  }

  if (consultStates.includes(state)) {
    await consultFlow.handle(whatsappId, message, session);
    return;
  }

  // ── Any other / legacy state → restart the journey cleanly ─────────────────

  await registrationFlow.handle(whatsappId, message, { ...(session.toObject?.() ?? session), state: 'IDLE' });
}

async function sendHelpMessage(whatsappId, state, session) {
  const user = await User.findOne({ whatsappId });
  const isRegistered = !!user;

  let msg = `📋 *Astro Vaidhya Help Menu*\n\n`;

  if (!isRegistered) {
    msg += `It looks like you haven't registered yet.\n\n`;
    msg += `• Type *"hi"* or *"register"* to create your profile\n`;
  } else {
    msg += `Hello, *${user.name}*! Here's how it works:\n\n`;
    msg += `• Type *"hi"* — I'll walk you through a few gentle questions, then connect you with our care team\n`;
    msg += `• *"help"* — Show this menu\n`;
    msg += `• *"cancel"* — Cancel the current operation\n`;
    msg += `\nCurrent status: *${formatState(state)}*`;
  }

  await sendText(whatsappId, msg);
}

function formatState(state) {
  const labels = {
    IDLE: 'Not started',
    REGISTERING_LANGUAGE: 'Choosing language',
    READY_CONFIRM: 'Getting ready',
    PURPOSE_SELECT: 'Choosing purpose',
    REGISTERING_NAME: 'Sharing name',
    REGISTERING_GENDER: 'Sharing gender',
    CONCERN_SELECT: 'Sharing concern',
    CONCERN_OTHER: 'Describing concern',
    CONCERN_REALIZE: 'Reflecting',
    CONCERN_AFFECT: 'What it affects',
    CONCERN_SEVERITY: 'Sense of control',
    SUMMARY_CONFIRM: 'Confirming summary',
    SUMMARY_CLARIFY: 'Explaining more',
    PATH_SELECT: 'Choosing path',
    ASTRO_PALM: 'Sharing palm photo',
    ASTRO_KUNDLI: 'Sharing kundli',
    ASTRO_DOB: 'Sharing date of birth',
    ASTRO_BIRTH_TIME: 'Sharing birth time',
    ASTRO_BIRTH_PLACE: 'Sharing birth place',
    PAYMENT_PENDING: 'Awaiting payment',
    MEDICAL_Q: 'Medical questions',
  };
  return labels[state] || state;
}

module.exports = { dispatch };
