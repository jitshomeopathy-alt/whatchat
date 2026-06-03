const { sendText, downloadMedia } = require('../../services/whatsapp');
const { uploadFromUrl } = require('../../services/imagekit');
const { saveSession } = require('../stateManager');
const User = require('../../models/User');

/**
 * Handle registration flow.
 * @param {string} whatsappId
 * @param {Object} message - Parsed WhatsApp message object
 * @param {Object} session - Current session document
 */
async function handle(whatsappId, message, session) {
  const state = session.state;

  // ── IDLE: kick off registration ─────────────────────────────────────────────
  if (state === 'IDLE') {
    await saveSession(whatsappId, {
      state: 'REGISTERING_NAME',
      registrationBuffer: {},
    });
    await sendText(
      whatsappId,
      `👋 Welcome to WhatChat Health Assistant!\n\nI'm here to help you with personalised health insights and recovery recommendations.\n\nLet's get you registered first. What is your *full name*?`
    );
    return;
  }

  // ── REGISTERING_NAME ─────────────────────────────────────────────────────────
  if (state === 'REGISTERING_NAME') {
    const name = extractText(message);
    if (!name || name.length < 2) {
      await sendText(whatsappId, 'Please enter a valid name (at least 2 characters).');
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), name };
    await saveSession(whatsappId, {
      state: 'REGISTERING_AGE',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, `Nice to meet you, *${name}*! 😊\n\nHow old are you? Please enter your age as a number.`);
    return;
  }

  // ── REGISTERING_AGE ──────────────────────────────────────────────────────────
  if (state === 'REGISTERING_AGE') {
    const text = extractText(message);
    const age = parseInt(text, 10);

    if (isNaN(age) || age < 1 || age > 150) {
      await sendText(whatsappId, 'Please enter a valid age (a number between 1 and 150).');
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), age };
    await saveSession(whatsappId, {
      state: 'REGISTERING_GENDER',
      registrationBuffer: buffer,
    });
    await sendText(
      whatsappId,
      `Got it — *${age} years old*.\n\nWhat is your gender?\nPlease reply with one of:\n• male\n• female\n• other`
    );
    return;
  }

  // ── REGISTERING_GENDER ───────────────────────────────────────────────────────
  if (state === 'REGISTERING_GENDER') {
    const text = extractText(message)?.toLowerCase().trim();
    const allowed = ['male', 'female', 'other'];

    if (!allowed.includes(text)) {
      await sendText(whatsappId, 'Please reply with *male*, *female*, or *other*.');
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), gender: text };
    await saveSession(whatsappId, {
      state: 'REGISTERING_EMAIL',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, `Thank you! Now, what is your *email address*?`);
    return;
  }

  // ── REGISTERING_EMAIL ────────────────────────────────────────────────────────
  if (state === 'REGISTERING_EMAIL') {
    const text = extractText(message)?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!text || !emailRegex.test(text)) {
      await sendText(whatsappId, 'Please enter a valid email address.');
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), email: text };
    await saveSession(whatsappId, {
      state: 'REGISTERING_IMAGE',
      registrationBuffer: buffer,
    });
    await sendText(
      whatsappId,
      `Great! Almost done. 📸\n\nPlease send a *photo of yourself* so I can provide a more personalised health analysis.\n\n_(You can skip this by typing "skip")_`
    );
    return;
  }

  // ── REGISTERING_IMAGE ────────────────────────────────────────────────────────
  if (state === 'REGISTERING_IMAGE') {
    const buffer = session.registrationBuffer || {};
    let imageUrl = null;

    const textInput = extractText(message)?.toLowerCase().trim();

    if (textInput === 'skip') {
      // User chose to skip photo
      imageUrl = null;
    } else if (message.type === 'image') {
      try {
        const mediaId = message.image?.id;
        if (!mediaId) {
          await sendText(whatsappId, 'Could not read the image. Please try again or type "skip".');
          return;
        }

        await sendText(whatsappId, '⏳ Uploading your photo, please wait...');
        const mediaBuffer = await downloadMedia(mediaId);
        const filename = `user_${whatsappId}_profile.jpg`;
        imageUrl = await uploadFromUrl(null, filename, mediaBuffer);
      } catch (err) {
        console.error('[Registration] Image upload error:', err.message);
        await sendText(
          whatsappId,
          `Sorry, I couldn't upload your photo (${err.message}). Please try again or type "skip".`
        );
        return;
      }
    } else {
      await sendText(whatsappId, 'Please send a *photo* or type *"skip"* to continue without one.');
      return;
    }

    // Save the user to MongoDB
    try {
      await User.findOneAndUpdate(
        { whatsappId },
        {
          whatsappId,
          name: buffer.name,
          age: buffer.age,
          gender: buffer.gender,
          email: buffer.email,
          imageUrl,
          createdAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('[Registration] User save error:', err.message);
      await sendText(whatsappId, 'Sorry, there was an error saving your profile. Please try again.');
      return;
    }

    await saveSession(whatsappId, {
      state: 'REGISTERED',
      registrationBuffer: {},
    });

    const photoMsg = imageUrl ? ' and your photo has been saved' : '';
    await sendText(
      whatsappId,
      `🎉 You're all set, *${buffer.name}*!\n\nYour profile is complete${photoMsg}.\n\nHere's what I can do for you:\n\n` +
        `• Type *"analyse me"* — I'll assess your health profile\n` +
        `• Type *"recover me"* — I'll guide you through a recovery questionnaire\n` +
        `• Type *"help"* — see all available commands`
    );
    return;
  }
}

/**
 * Extract text from various message types.
 */
function extractText(message) {
  if (message.type === 'text') return message.text?.body || '';
  return null;
}

module.exports = { handle };
