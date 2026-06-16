const { sendText, sendButtons, downloadMedia } = require('../../services/whatsapp');
const { uploadFromUrl } = require('../../services/imagekit');
const { saveSession } = require('../stateManager');
const { formatDob, isValidDob } = require('../../utils/date');
const consultFlow = require('./consult');
const { t } = require('../i18n');
const User = require('../../models/User');

/**
 * Handle registration flow.
 * @param {string} whatsappId
 * @param {Object} message - Parsed WhatsApp message object
 * @param {Object} session - Current session document
 */
async function handle(whatsappId, message, session) {
  const state = session.state;

  // ── IDLE: kick off registration — ask language first ─────────────────────────
  if (state === 'IDLE') {
    await saveSession(whatsappId, {
      state: 'REGISTERING_LANGUAGE',
      registrationBuffer: {},
    });
    await sendButtons(
      whatsappId,
      `👋 Welcome to WhatChat!\n\nPlease choose your language.\nकृपया अपनी भाषा चुनें।`,
      [
        { id: 'lang:en', title: 'English' },
        { id: 'lang:hi', title: 'हिंदी' },
      ]
    );
    return;
  }

  // ── REGISTERING_LANGUAGE ─────────────────────────────────────────────────────
  if (state === 'REGISTERING_LANGUAGE') {
    const raw = (message.interactive?.id || extractText(message) || '').toLowerCase().trim();
    let language = null;
    if (raw === 'lang:en' || raw === 'english' || raw === 'en') language = 'en';
    else if (raw === 'lang:hi' || raw === 'hindi' || raw === 'हिंदी' || raw === 'hi') language = 'hi';

    if (!language) {
      await sendButtons(
        whatsappId,
        'Please choose your language. / कृपया अपनी भाषा चुनें।',
        [
          { id: 'lang:en', title: 'English' },
          { id: 'lang:hi', title: 'हिंदी' },
        ]
      );
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), language };
    await saveSession(whatsappId, {
      state: 'REGISTERING_NAME',
      language,
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askName', language));
    return;
  }

  // ── REGISTERING_NAME ─────────────────────────────────────────────────────────
  if (state === 'REGISTERING_NAME') {
    const lang = session.language || 'en';
    const name = extractText(message);
    if (!name || name.length < 2) {
      await sendText(whatsappId, t('invalidName', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), name };
    await saveSession(whatsappId, {
      state: 'REGISTERING_AGE',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askAge', lang, { name }));
    return;
  }

  // ── REGISTERING_AGE ──────────────────────────────────────────────────────────
  if (state === 'REGISTERING_AGE') {
    const lang = session.language || 'en';
    const text = extractText(message);
    const age = parseInt(text, 10);

    if (isNaN(age) || age < 1 || age > 150) {
      await sendText(whatsappId, t('invalidAge', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), age };
    await saveSession(whatsappId, {
      state: 'REGISTERING_GENDER',
      registrationBuffer: buffer,
    });
    await sendButtons(
      whatsappId,
      t('askGender', lang, { age }),
      [
        { id: 'male', title: t('genderMale', lang) },
        { id: 'female', title: t('genderFemale', lang) },
        { id: 'other', title: t('genderOther', lang) },
      ]
    );
    return;
  }

  // ── REGISTERING_GENDER ───────────────────────────────────────────────────────
  if (state === 'REGISTERING_GENDER') {
    const lang = session.language || 'en';
    const text = (message.interactive?.id || extractText(message))?.toLowerCase().trim();
    const allowed = ['male', 'female', 'other'];

    if (!allowed.includes(text)) {
      await sendButtons(
        whatsappId,
        t('genderRetry', lang),
        [
          { id: 'male', title: t('genderMale', lang) },
          { id: 'female', title: t('genderFemale', lang) },
          { id: 'other', title: t('genderOther', lang) },
        ]
      );
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), gender: text };
    await saveSession(whatsappId, {
      state: 'REGISTERING_EMAIL',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askEmail', lang));
    return;
  }

  // ── REGISTERING_EMAIL ────────────────────────────────────────────────────────
  if (state === 'REGISTERING_EMAIL') {
    const lang = session.language || 'en';
    const text = extractText(message)?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!text || !emailRegex.test(text)) {
      await sendText(whatsappId, t('invalidEmail', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), email: text };
    await saveSession(whatsappId, {
      state: 'REGISTERING_IMAGE',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askImage', lang));
    return;
  }

  // ── REGISTERING_IMAGE ────────────────────────────────────────────────────────
  if (state === 'REGISTERING_IMAGE') {
    const lang = session.language || 'en';
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
          await sendText(whatsappId, t('imageReadError', lang));
          return;
        }

        await sendText(whatsappId, t('imageUploading', lang));
        const mediaBuffer = await downloadMedia(mediaId);
        const filename = `user_${whatsappId}_palm.jpg`;
        imageUrl = await uploadFromUrl(null, filename, mediaBuffer);
      } catch (err) {
        console.error('[Registration] Image upload error:', err.message);
        await sendText(whatsappId, t('imageUploadError', lang, { msg: err.message }));
        return;
      }
    } else {
      await sendText(whatsappId, t('imageSendPrompt', lang));
      return;
    }

    // Defer the save — we still need dob and city for the profile reading.
    const updatedBuffer = { ...buffer, imageUrl };
    await saveSession(whatsappId, {
      state: 'REGISTERING_DOB',
      registrationBuffer: updatedBuffer,
    });
    await sendText(whatsappId, t('askDob', lang));
    return;
  }

  // ── REGISTERING_DOB ──────────────────────────────────────────────────────────
  if (state === 'REGISTERING_DOB') {
    const lang = session.language || 'en';
    const dobInput = extractText(message)?.trim();
    if (!isValidDob(dobInput)) {
      await sendText(whatsappId, t('invalidDob', lang));
      return;
    }

    const dob = formatDob(dobInput); // normalized to dd-mm-yyyy
    const buffer = { ...(session.registrationBuffer || {}), dob };
    await saveSession(whatsappId, {
      state: 'REGISTERING_ADDRESS',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askAddress', lang, { dob }));
    return;
  }

  // ── REGISTERING_ADDRESS (final step → save + start astrology) ─────────────────
  if (state === 'REGISTERING_ADDRESS') {
    const lang = session.language || 'en';
    const address = extractText(message)?.trim();
    if (!address || address.length < 2) {
      await sendText(whatsappId, t('invalidAddress', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), address };

    // Save the complete user profile to MongoDB
    let user;
    try {
      user = await User.findOneAndUpdate(
        { whatsappId },
        {
          whatsappId,
          name: buffer.name,
          age: buffer.age,
          gender: buffer.gender,
          email: buffer.email,
          imageUrl: buffer.imageUrl || null,
          language: buffer.language || 'en',
          dob: buffer.dob,
          address: buffer.address,
          createdAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('[Registration] User save error:', err.message);
      await sendText(whatsappId, t('saveError', lang));
      return;
    }

    await saveSession(whatsappId, {
      state: 'REGISTERED',
      registrationBuffer: {},
    });

    await sendText(whatsappId, t('profileComplete', lang, { name: buffer.name }));

    // Automatically generate the astrological reading (next step in the flow).
    await consultFlow.startAstrology(whatsappId, user);
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
