const { sendText } = require('../services/whatsapp');
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

  // ── Registration states ────────────────────────────────────────────────────

  const registrationStates = [
    'IDLE',
    'REGISTERING_LANGUAGE',
    'REGISTERING_NAME',
    'REGISTERING_AGE',
    'REGISTERING_GENDER',
    'REGISTERING_EMAIL',
    'REGISTERING_IMAGE',
    'REGISTERING_DOB',
    'REGISTERING_ADDRESS',
  ];

  const consultStates = ['ASTRO_SATISFACTION', 'CATEGORY_SELECT', 'CONSULT_Q', 'CONSULT_ACTION'];

  if (registrationStates.includes(state)) {
    // Allow "register" / "hi" / "hello" / "start" to kick off registration
    if (state === 'IDLE' && ['hi', 'hello', 'start', 'register', 'hey'].includes(lowerText)) {
      await registrationFlow.handle(whatsappId, message, session);
      return;
    }

    if (state === 'IDLE') {
      // First contact — start registration regardless of what they said
      await registrationFlow.handle(whatsappId, message, session);
      return;
    }

    // Mid-registration: forward to registration flow
    await registrationFlow.handle(whatsappId, message, session);
    return;
  }

  // ── Post-registration: (re)start the astrology → consult flow ─────────────

  if (state === 'REGISTERED') {
    const user = await User.findOne({ whatsappId });
    if (!user) {
      await registrationFlow.handle(whatsappId, message, { ...session.toObject(), state: 'IDLE' });
      return;
    }
    await consultFlow.startAstrology(whatsappId, user);
    return;
  }

  // ── Ongoing astrology → consult flow ──────────────────────────────────────

  if (consultStates.includes(state)) {
    await consultFlow.handle(whatsappId, message, session);
    return;
  }

  // ── Fallback ──────────────────────────────────────────────────────────────

  await sendText(
    whatsappId,
    `👋 Hello! I'm WhatChat, your AI health assistant.\n\nType *"help"* to see what I can do for you.`
  );
}

async function sendHelpMessage(whatsappId, state, session) {
  const user = await User.findOne({ whatsappId });
  const isRegistered = !!user;

  let msg = `📋 *WhatChat Help Menu*\n\n`;

  if (!isRegistered) {
    msg += `It looks like you haven't registered yet.\n\n`;
    msg += `• Type *"hi"* or *"register"* to create your profile\n`;
  } else {
    msg += `Hello, *${user.name}*! Here's how it works:\n\n`;
    msg += `• Type *"hi"* — I'll give you an astrological reading, then a few questions, then your personalised result\n`;
    msg += `• *"help"* — Show this menu\n`;
    msg += `• *"cancel"* — Cancel the current operation\n`;
    msg += `\nCurrent status: *${formatState(state)}*`;
    if (session.category) {
      msg += ` | Category: *${session.category}*`;
    }
  }

  await sendText(whatsappId, msg);
}

function formatState(state) {
  const labels = {
    IDLE: 'Not registered',
    REGISTERING_LANGUAGE: 'Registering (language)',
    REGISTERING_NAME: 'Registering (name)',
    REGISTERING_AGE: 'Registering (age)',
    REGISTERING_GENDER: 'Registering (gender)',
    REGISTERING_EMAIL: 'Registering (email)',
    REGISTERING_IMAGE: 'Registering (palm photo)',
    REGISTERING_DOB: 'Registering (date of birth)',
    REGISTERING_ADDRESS: 'Registering (city)',
    REGISTERED: 'Registered',
    ASTRO_SATISFACTION: 'Astrology (rating)',
    CATEGORY_SELECT: 'Selecting category',
    CONSULT_Q: 'Questionnaire',
    CONSULT_ACTION: 'Choosing next step',
  };
  return labels[state] || state;
}

module.exports = { dispatch };
