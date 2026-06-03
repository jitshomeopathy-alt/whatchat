const { sendText } = require('../services/whatsapp');
const { loadSession, saveSession, resetSession } = require('./stateManager');
const registrationFlow = require('./flows/registration');
const analyseMeFlow = require('./flows/analyseMe');
const recoverMeFlow = require('./flows/recoverMe');
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
    'REGISTERING_NAME',
    'REGISTERING_AGE',
    'REGISTERING_GENDER',
    'REGISTERING_EMAIL',
    'REGISTERING_IMAGE',
  ];

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

  // ── Post-registration: check for trigger keywords ─────────────────────────

  if (state === 'REGISTERED' || state === 'ANALYSE_DONE' || state === 'RECOVER_DONE') {
    if (lowerText.includes('analyse me') || lowerText === 'analyze me') {
      await saveSession(whatsappId, { state: 'ANALYSE_PENDING' });
      await analyseMeFlow.handle(whatsappId, message, { ...session.toObject(), state: 'ANALYSE_PENDING' });
      return;
    }

    if (lowerText.includes('recover me')) {
      await recoverMeFlow.handle(whatsappId, message, session);
      return;
    }

    // Unknown input from a registered user
    await sendText(
      whatsappId,
      `I didn't quite understand that. Here's what you can do:\n\n` +
        `• *"analyse me"* — Health assessment\n` +
        `• *"recover me"* — Recovery questionnaire\n` +
        `• *"help"* — Full help menu`
    );
    return;
  }

  // ── Analyse flow ───────────────────────────────────────────────────────────

  if (state === 'ANALYSE_PENDING') {
    await analyseMeFlow.handle(whatsappId, message, session);
    return;
  }

  // ── Recover flow ──────────────────────────────────────────────────────────

  if (state === 'RECOVER_CATEGORY_SELECT' || state === 'RECOVER_Q') {
    // Allow escape to "analyse me" mid-recovery
    if (lowerText.includes('analyse me') || lowerText === 'analyze me') {
      await saveSession(whatsappId, { state: 'ANALYSE_PENDING' });
      await analyseMeFlow.handle(whatsappId, message, { ...session.toObject(), state: 'ANALYSE_PENDING' });
      return;
    }

    await recoverMeFlow.handle(whatsappId, message, session);
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
    msg += `Hello, *${user.name}*! Here's what I can do:\n\n`;
    msg += `• *"analyse me"* — Get a personalised health analysis using AI\n`;
    msg += `• *"recover me"* — Answer a health questionnaire and get recovery recommendations\n`;
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
    REGISTERING_NAME: 'Registering (name)',
    REGISTERING_AGE: 'Registering (age)',
    REGISTERING_GENDER: 'Registering (gender)',
    REGISTERING_EMAIL: 'Registering (email)',
    REGISTERING_IMAGE: 'Registering (photo)',
    REGISTERED: 'Registered',
    ANALYSE_PENDING: 'Analysing...',
    ANALYSE_DONE: 'Analysis complete',
    RECOVER_CATEGORY_SELECT: 'Recovery (selecting category)',
    RECOVER_Q: 'Recovery (questionnaire)',
    RECOVER_DONE: 'Recovery complete',
  };
  return labels[state] || state;
}

module.exports = { dispatch };
